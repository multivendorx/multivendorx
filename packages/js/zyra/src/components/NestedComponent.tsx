import React, { useState, useEffect } from "react";
import "../styles/web/NestedComponent.scss";
import MultiInput from "./MultiInput";

interface NestedFieldOption {
  key?: string;
  value: string;
  label: string;
  proSetting?: boolean;
}

interface NestedField {
  key: string;
  type: "number" | "select" | "multi-number";
  label?: string;
  placeholder?: string;
  options?: NestedFieldOption[];
  dependent?: { key: string; set: boolean; value: string };
  firstRowOnly?: boolean;
  skipFirstRow?: boolean;
  skipLabel?: boolean;
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

  // sync value → state
  useEffect(() => {
    setRows(single ? (value.length ? [value[0]] : [{}]) : value.length ? value : [{}]);
  }, [value, single]);

  // Normalize output
  function formatData(data: Record<string, any>[]) {
    return data.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, val]) => {
          const field = fields.find((f) => f.key === key);
          if (field?.type === "multi-number") {
            return [
              key,
              (val || []).map((item: any) => ({ key: item.key, value: item.value })),
            ];
          }
          return [key, val];
        })
      )
    );
  }

  function updateAndSave(updated: Record<string, any>[]) {
    setRows(updated);
    onChange(formatData(updated));
  }

  // Generic field change handler
  function handleChange(rowIndex: number, key: string, value: any) {
    updateAndSave(rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)));
  }

  function addRow() {
    if (single) return;
    const lastRow = rows.at(-1) || {};

    // Validation: ensure last row is filled
    const isComplete = fields.every((f) => {
      if (f.skipFirstRow && rows.length === 1) return true;

      if (f.type === "multi-number") {
        return f.options?.every((opt) => {
          const val = lastRow[opt.key || ""];
          return val !== undefined && val !== "";
        });
      }
      if (f.dependent) {
        const depVal = lastRow[f.dependent.key];
        if (
          (f.dependent.set && depVal === f.dependent.value) ||
          (!f.dependent.set && depVal !== f.dependent.value)
        ) {
          const val = lastRow[f.key];
          return val !== undefined && val !== "";
        }
        return true;
      }
      const val = lastRow[f.key];
      return val !== undefined && val !== "";
    });

    if (!isComplete && rows.length > 1) return;

    updateAndSave([...rows, {}]);
  }

  function removeRow(index: number) {
    if (!single) updateAndSave(rows.filter((_, i) => i !== index));
  }

  // Render field based on type
  function renderField(field: NestedField, row: Record<string, any>, rowIndex: number) {
    if (rowIndex === 0 && field.skipFirstRow) return null;
    if (rowIndex > 0 && field.firstRowOnly) return null;

    const value = row[field.key] ?? "";

    if (field.dependent) {
      const depVal = row[field.dependent.key];
      if (
        (field.dependent.set && depVal !== field.dependent.value) ||
        (!field.dependent.set && depVal === field.dependent.value)
      ) {
        return null;
      }
    }

    switch (field.type) {
      case "select":
        return (
          <div className="form-wrapper" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <div className="toggle-setting-container">
              <div className="toggle-setting-wrapper">
                {field.options?.map((opt) => (
                  <div
                    key={opt.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleChange(rowIndex, field.key, opt.value)}
                  >
                    <input
                      type="radio"
                      id={`${field.key}-${rowIndex}-${opt.value}`}
                      name={`${field.key}-${rowIndex}`}
                      value={opt.value}
                      checked={value === opt.value}
                      readOnly
                      className="toggle-setting-form-input"
                    />
                    <label htmlFor={`${field.key}-${rowIndex}-${opt.value}`}>{opt.label}</label>
                    {opt.proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "multi-number":
        return (
          <div className="form-wrapper" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <MultiInput
              inputType="multi-number"
              parentWrapperClass="settings-basic-input-class"
              childWrapperClass="settings-basic-child-wrap"
              inputWrapperClass="settings-basic-input-child-class"
              innerInputWrapperClass="setting-form-input"
              inputLabelClass="setting-form-basic-input"
              idPrefix="setting-integer-input"
              options={field.options || []}
              value={(field.options || []).map((opt) => ({
                key: opt.key || field.key,
                value: row[opt.key || field.key] || "",
              }))}
              onChange={(e, _, optKey) =>
                handleChange(rowIndex, optKey || field.key, e.target.value)
              }
            />
          </div>
        );

      case "number":
        return (
          <div className="form-wrapper" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <input
              type="number"
              value={value}
              placeholder={field.placeholder || ""}
              onChange={(e) => handleChange(rowIndex, field.key, e.target.value)}
              className="basic-input"
            />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="nested-wrapper" id={id}>
      {rows.map((row, rowIndex) => (
        <div key={`nested-row-${rowIndex}`} className="nested-row">
          {fields.map((field) => renderField(field, row, rowIndex))}
          {!single && rowIndex === rows.length - 1 && (
            <div className="buttons-wrapper">
              <button type="button" className="admin-btn btn-green" onClick={addRow}>
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
