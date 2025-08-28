import React, { useState, useEffect } from "react";
import "../styles/web/NestedComponent.scss";
import MultiNumInput from "./MultiNumInput";

interface NestedFieldOption {
  key?: string;
  value: string;
  label: string;
  proSetting?: boolean;
}

interface NestedField {
  key: string;
  type: "number" | "select" | "multi-number" | "checkbox";
  label?: string;
  placeholder?: string;
  options?: NestedFieldOption[];
  dependent?: { key: string; set: boolean; value: string };
  firstRowOnly?: boolean;
  skipFirstRow?: boolean;
}

interface NestedComponentProps {
  id: string;
  label?: string;
  fields: NestedField[];
  value: Record<string, any>[];
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  onChange: (value: Record<string, any>[]) => void;
  single?: boolean;
}

const NestedComponent: React.FC<NestedComponentProps> = ({
  id,
  fields,
  value = [],
  onChange,
  addButtonLabel = "Add",
  deleteButtonLabel = "Delete",
  single = false,
}) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    if (single) {
      setRows(value.length ? [value[0]] : [{}]);
    } else {
      setRows(value.length ? value : [{}]);
    }
  }, [value, single]);

  const formatData = (data: Record<string, any>[]) => {
    return data.map((row) => {
      const formattedRow: Record<string, any> = {};
      Object.keys(row).forEach((key) => {
        const field = fields.find((f) => f.key === key);

        if (!field) {
          formattedRow[key] = row[key];
          return;
        }

        if (field.type === "multi-number") {
          // convert to array of { key, value }
          formattedRow[key] = (row[key] || []).map((item: any) => ({
            key: item.key,
            value: item.value,
          }));
        } else if (field.type === "checkbox") {
          // keep as array of selected values
          formattedRow[key] = Array.isArray(row[key]) ? row[key] : [];
        } else {
          // number, select, normal string/number
          formattedRow[key] = row[key];
        }
      });
      return formattedRow;
    });
  };

  const updateAndSave = (updated: Record<string, any>[]) => {
    setRows(updated);
    onChange(formatData(updated)); // ✅ pass formatted data
  };

  const handleFieldChange = (index: number, key: string, val: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: val };
    updateAndSave(updated);
  };

   // Special handler for multi-number nested input change
  const handleMultiNumChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    parentKey: string,
    optionKey: string,
    rowIndex: number
  ) => {
    const updated = [...rows];
    const newVal = e.target.value;

    // Instead of nesting, store directly in the row
    updated[rowIndex][optionKey] = newVal;

    setRows(updated);
    onChange(updated);
  };

  const addRow = () => {
    if (!single) {
      if (rows.length > 0) {
        const lastRow = rows[rows.length - 1] || {};
        const isComplete = fields.every((f) => {
          if (f.skipFirstRow && rows.length === 1) return true;

          if (f.type === "multi-number") {
            return f.options?.every((opt) => {
              const key = opt.key as keyof typeof lastRow;
              const val = lastRow[key];
              return val !== undefined && val !== "" && val !== null;
            });
          } else {
            if (f.dependent) {
              const depKey = f.dependent.key;
              const depValue = f.dependent.value;

              if (lastRow[depKey] === depValue) {
                const val = lastRow[f.key];
                return val !== undefined && val !== "" && val !== null;
              }

              return true;
            }

            const val = lastRow[f.key];
            return val !== undefined && val !== "" && val !== null;
          }

        });

        if (!isComplete && rows.length > 1) {
          return; // block only if not the first row
        }
      }

      const updated = [...rows, {}];
      updateAndSave(updated);
    }
  };

  const removeRow = (index: number) => {
    if (!single) {
      const updated = rows.filter((_, i) => i !== index);
      updateAndSave(updated);
    }
  };

  return (
    <div className="nested-wrapper" id={id}>
      {rows.map((row, rowIndex) => (
        <div key={`nested-row-${rowIndex}`} className="nested-row">
          {fields.map((field) => {
            if (rowIndex === 0 && field.skipFirstRow) return null;
            if (rowIndex > 0 && field.firstRowOnly) return null;

            const inputValue = row[field.key] ?? "";

            if (field.dependent) {
              const depVal = row[field.dependent.key];
              if (
                (field.dependent.set && depVal !== field.dependent.value) ||
                (!field.dependent.set && depVal === field.dependent.value)
              ) {
                return null;
              }
            }

            // ✅ select
            if (field.type === "select") {
              return (
                <div className="form-wrapper" key={field.key}>
                  {field.label && <label>{field.label}</label>}
                  <div className="toggle-setting-container">
                    <div className="toggle-setting-wrapper">
                      {field.options?.map((opt) => (
                        <div
                          key={opt.value}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            handleFieldChange(rowIndex, field.key, opt.value)
                          }
                        >
                          <input
                            type="radio"
                            id={`${field.key}-${rowIndex}-${opt.value}`}
                            name={`${field.key}-${rowIndex}`}
                            value={opt.value}
                            checked={inputValue === opt.value}
                            readOnly
                            className="toggle-setting-form-input"
                          />
                          <label
                            htmlFor={`${field.key}-${rowIndex}-${opt.value}`}
                          >
                            {opt.label}
                          </label>
                          {opt.proSetting && (
                            <span className="admin-pro-tag">Pro</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // ✅ multi-number
            if (field.type === "multi-number") {
              return (
                <div className="form-wrapper" key={field.key}>
                  {field.label && <label>{field.label}</label>}
                  <MultiNumInput
                    parentWrapperClass="settings-basic-input-class"
                    childWrapperClass="settings-basic-child-wrap"
                    inputWrapperClass="settings-basic-input-child-class"
                    innerInputWrapperClass="setting-form-input"
                    inputLabelClass="setting-form-basic-input"
                    idPrefix="setting-integer-input"
                    options={field.options || []}
                    value={(field.options || []).map(opt => ({
                      key: opt.key || field.key,
                      value: row[opt.key || field.key] || ''
                    }))}
                    onChange={(e, k, optKey) =>
                      handleMultiNumChange(e, field.key, optKey || "", rowIndex)
                    }
                  />
                </div>
              );
            }

            // ✅ checkbox
            if (field.type === "checkbox") {
              return (
                <div className="form-wrapper" key={field.key}>
                  {field.label && <label>{field.label}</label>}
                  {field.options?.map((opt) => (
                    <div key={opt.value} className="checkbox-option">
                      <input
                        type="checkbox"
                        id={`${field.key}-${rowIndex}-${opt.value}`}
                        checked={(row[field.key] || []).includes(opt.value)}
                        onChange={(e) => {
                          const updatedValues = row[field.key] || [];
                          if (e.target.checked) {
                            updatedValues.push(opt.value);
                          } else {
                            const idx = updatedValues.indexOf(opt.value);
                            if (idx > -1) updatedValues.splice(idx, 1);
                          }
                          handleFieldChange(rowIndex, field.key, updatedValues);
                        }}
                      />
                      <label htmlFor={`${field.key}-${rowIndex}-${opt.value}`}>
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              );
            }

            // ✅ number (default)
            if (field.type === "number") {
              return (
                <div className="form-wrapper" key={field.key}>
                  {field.label && <label>{field.label}</label>}
                  <input
                    type="number"
                    value={inputValue}
                    placeholder={field.placeholder || ""}
                    onChange={(e) =>
                      handleFieldChange(rowIndex, field.key, e.target.value)
                    }
                    className="basic-input"
                  />
                </div>
              );
            }

            return null;
          })}

          {!single && (
            <div className="buttons-wrapper">
              <button
                type="button"
                className="admin-btn btn-green"
                onClick={addRow}
              >
                + {addButtonLabel}
              </button>

              {rows.length > 1 && (
                <button
                  type="button"
                  className="admin-btn btn-red"
                  onClick={() => removeRow(rowIndex)}
                >
                  {deleteButtonLabel}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NestedComponent;
