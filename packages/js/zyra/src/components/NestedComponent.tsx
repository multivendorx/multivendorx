import React, { useState, useEffect } from 'react';
import "../styles/web/NestedComponent.scss"
import MultiNumInput from './MultiNumInput'; // adjust path accordingly
interface NestedFieldOption {
  value: string;
  label: string;
  proSetting?: boolean;
}
interface NestedField {
  key: string;
  type: 'number' | 'select' | 'multi-number';
  label: string;
  placeholder?: string;
  options?: NestedFieldOption[];
  dependent?: { key: string; set: boolean; value: string }; // optional dependency
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
  label,
  fields,
  value = [],
  onChange,
  addButtonLabel = 'Add',
  deleteButtonLabel = 'Delete',
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
  const handleFieldChange = (index: number, key: string, val: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: val };
    setRows(updated);
    onChange(updated);
  };
  // Special handler for multi-number nested input change
  const handleMultiNumChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    parentKey: string,
    optionKey: string,
    rowIndex: number
  ) => {
    const updated = [...rows];
    const parentValue = updated[rowIndex][parentKey] || [];
    const newVal = e.target.value;
    // Update or add key in the nested array of key/value pairs
    const existingIndex = parentValue.findIndex((v: any) => v.key === optionKey);
    if (existingIndex > -1) {
      parentValue[existingIndex].value = newVal;
    } else {
      parentValue.push({ key: optionKey, value: newVal });
    }
    updated[rowIndex][parentKey] = parentValue;
    setRows(updated);
    onChange(updated);
  };
  const addRow = () => {
    if (!single) {
      const updated = [...rows, {}];
      setRows(updated);
      onChange(updated);
    }
  };
  const removeRow = (index: number) => {
    if (!single) {
      const updated = rows.filter((_, i) => i !== index);
      setRows(updated);
      onChange(updated);
    }
  };
  return (
    <div className="nested-wrapper">
      {rows.map((row, rowIndex) => (
        <div key={`nested-row-${rowIndex}`} className="nested-row">
          {fields.map((field) => {
            const inputValue = row[field.key] ?? '';
            // Check dependency (optional)
            if (field.dependent) {
              const depVal = row[field.dependent.key];
              if (
                (field.dependent.set && depVal !== field.dependent.value) ||
                (!field.dependent.set && depVal === field.dependent.value)
              ) {
                return null; // skip rendering this field if dependency not met
              }
            }
            if (field.type === 'select') {
              return (
                <>
                  <label>{field.label}</label>
                  <div className="toggle-setting-container">
                    <div className="toggle-setting-wrapper">
                      {field.options?.map((opt) => (
                        <div
                          key={opt.value}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleFieldChange(rowIndex, field.key, opt.value)}
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
                          <label htmlFor={`${field.key}-${rowIndex}-${opt.value}`}>
                            {opt.label}
                          </label>
                          {opt.proSetting && <span className="admin-pro-tag">pro</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            }
            if (field.type === 'multi-number') {
              return (
                <>
                  <label>{field.label}</label>
                  <MultiNumInput
                    parentWrapperClass="settings-basic-input-class"
                    childWrapperClass="settings-basic-child-wrap"
                    inputWrapperClass="settings-basic-input-child-class"
                    innerInputWrapperClass="setting-form-input"
                    inputLabelClass="setting-form-basic-input"
                    idPrefix="setting-integer-input"
                    options={field.options || []}
                    value={row[field.key] || []}
                    onChange={(e, k, optKey) => handleMultiNumChange(e, field.key, optKey || '', rowIndex)}
                  />
                </>
              );
            }
            // number input default
            return (
              <>
                <label>{field.label}</label>
                <input
                  type="number"
                  value={inputValue}
                  placeholder={field.placeholder || ''}
                  onChange={(e) => handleFieldChange(rowIndex, field.key, e.target.value)}
                  className="basic-input"
                />
              </>
            );
          })}
          {!single && (
            <div className="buttons-wrapper">
              {rowIndex === rows.length - 1 && (
                <button type="button" className="admin-btn btn-green" onClick={addRow}>
                  + {addButtonLabel}
                </button>
              )}
              {rows.length > 1 && (
                <button type="button" className="admin-btn btn-red" onClick={() => removeRow(rowIndex)}>
                  &times; {deleteButtonLabel}
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