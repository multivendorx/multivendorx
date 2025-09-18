import React, { useState, useEffect } from "react";
import "../styles/web/NestedComponent.scss";
import ToggleSetting from "./ToggleSetting";
import BasicInput from "./BasicInput";
import SelectInput from "./SelectInput";
import MultiCheckBox from "./MultiCheckbox";

interface NestedFieldOption {
  key?: string;
  value: string;
  label: string;
  proSetting?: boolean;
}

interface NestedField {
  look?: string;
  key: string;
  type: "number" | "select" | "text" | "url" | "dropdown" | "time" | "checkbox";
  label?: string;
  placeholder?: string;
  options?: NestedFieldOption[];
  dependent?: { key: string; set: boolean; value: string };
  firstRowOnly?: boolean;
  skipFirstRow?: boolean;
  skipLabel?: boolean;
  postInsideText?: string;
  preInsideText?: string;
  preText?: string;
  postText?: string;
  preTextFirstRow?:string;
  postTextFirstRow?:string;
  desc?: string;
  size?: string;
  min?: number;
  defaultValue?: string;
  className?: string;
  proSetting?: boolean;

  // for checkbox fields
  selectDeselect?: boolean;
  tour?: string;
  rightContent?: React.ReactNode;
  moduleEnabled?: string;
  dependentSetting?: string;
  dependentPlugin?: string;
}

declare const appLocalizer: { khali_dabba?: boolean };
declare function isProSetting(value: boolean): boolean;
declare function setModelOpen(value: boolean): void;

interface NestedComponentProps {
  id: string;
  label?: string;
  fields: NestedField[];
  value: Record<string, any>[];
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  onChange: (value: Record<string, any>[]) => void;
  single?: boolean;
  description?: string;
}

const NestedComponent: React.FC<NestedComponentProps> = ({
  id,
  fields,
  value = [],
  onChange,
  addButtonLabel = "Add",
  deleteButtonLabel = "Delete",
  single = false,
  description,
}) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);

  // sync value → state
  useEffect(() => {
    setRows(single ? (value.length ? [value[0]] : [{}]) : value.length ? value : [{}]);
  }, [value, single]);

  function updateAndSave(updated: Record<string, any>[]) {
    setRows(updated);
    onChange(updated);
  }

  function handleChange(rowIndex: number, key: string, value: any) {
    updateAndSave(rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)));
  }

  function isLastRowComplete() {
    if (rows.length === 0) return true;
    const lastRowIndex = rows.length - 1;
    const lastRow = rows[lastRowIndex] || {};

    // ✅ Skip validation for row 0
    if (lastRowIndex === 0) return true;

    return fields.every((f) => {
      if (f.skipFirstRow && lastRowIndex === 0) return true;
      if (f.firstRowOnly && lastRowIndex > 0) return true;

      const val = lastRow[f.key];

      // dependency check
      if (f.dependent) {
        const depVal = lastRow[f.dependent.key];
        const depActive = Array.isArray(depVal)
          ? depVal.includes(f.dependent.value)
          : depVal === f.dependent.value;

        if ((f.dependent.set && !depActive) || (!f.dependent.set && depActive)) {
          return true;
        }
      }

      return val !== undefined && val !== "";
    });
  }


  function addRow() {
    if (single) return;
    if (!isLastRowComplete()) return;
    updateAndSave([...rows, {}]);
  }

  function removeRow(index: number) {
    if (!single) updateAndSave(rows.filter((_, i) => i !== index));
  }

  function renderField(field: NestedField, row: Record<string, any>, rowIndex: number) {
    if (rowIndex === 0 && field.skipFirstRow) return null;
    if (rowIndex > 0 && field.firstRowOnly) return null;

    const val = row[field.key] ?? "";

    // dependency check (works for single & multi-row, checkboxes included)
    if (field.dependent) {
      const depVal = row[field.dependent.key];
      const depActive = Array.isArray(depVal)
        ? depVal.includes(field.dependent.value)
        : depVal === field.dependent.value;

      if ((field.dependent.set && !depActive) || (!field.dependent.set && depActive)) {
        return null;
      }
    }

    switch (field.type) {
      case "select":
        return (
          <div className="settings-input-content" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <ToggleSetting
              key={field.key}
              options={field.options || []}
              value={val}
              onChange={(newVal) => handleChange(rowIndex, field.key, newVal)}
              preText={field.preText}
              postText={field.postText}  
            />
          </div>
        );

      case "number":
      case "text":
      case "url":
      case "time":
        return (
          <div className="settings-input-content" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <BasicInput
              type={field.type}
              descClass="settings-metabox-description"
              id={`${field.key}-${rowIndex}`}
              name={field.key}
              value={val}
              preInsideText={field.preInsideText}
              postInsideText={field.postInsideText}
              preText={
                rowIndex === 0
                  ? field.preTextFirstRow ?? field.preText
                  : field.preText
              }
              postText={
                rowIndex === 0
                  ? field.postTextFirstRow ?? field.postText
                  : field.postText
              }
              min={field.min ?? 0}
              description={field.desc}
              size={field.size}
              placeholder={field.placeholder}
              onChange={(e) => handleChange(rowIndex, field.key, e.target.value)}
              wrapperClass="setting-form-input"
            />
          </div>
        );

      case "dropdown":
        return (
          <div className="settings-input-content" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}
            <SelectInput
              wrapperClass="form-select-field-wrapper"
              descClass="settings-metabox-description"
              name={field.key}
              description={field.desc}
              inputClass={field.className}
              preText={field.preText}
              postText={field.postText}
              options={
                Array.isArray(field.options)
                  ? field.options.map((opt) => ({
                    value: String(opt.value),
                    label: opt.label ?? String(opt.value),
                  }))
                  : []
              }
              value={typeof val === "object" ? val.value : val}
              onChange={(newVal: any) => {
                if (!newVal) {
                  handleChange(rowIndex, field.key, "");
                } else if (Array.isArray(newVal)) {
                  handleChange(rowIndex, field.key, newVal.map((v) => v.value));
                } else {
                  handleChange(rowIndex, field.key, newVal.value);
                }
              }}
            />
          </div>
        );

      case "checkbox": {
        const look = (field.look || (field as any).lock) ?? "";
        let normalizedValue: string[] = [];

        if (Array.isArray(val)) {
          normalizedValue = val.filter((v: string) => v && v.trim() !== "");
        } else if (typeof val === "string" && val.trim() !== "") {
          normalizedValue = [val];
        } else {
          normalizedValue = [];
        }

        return (
          <div className="settings-input-content" key={field.key}>
            {!(rowIndex === 0 && field.skipLabel) && field.label && <label>{field.label}</label>}

            <MultiCheckBox
              khali_dabba={appLocalizer?.khali_dabba ?? false}
              wrapperClass={
                look === "toggle"
                  ? "toggle-btn"
                  : field.selectDeselect === true
                    ? "checkbox-list-side-by-side"
                    : "simple-checkbox"
              }
              descClass="settings-metabox-description"
              description={field.desc}
              selectDeselectClass="admin-btn btn-purple select-deselect-trigger"
              inputWrapperClass="toggle-checkbox-header"
              inputInnerWrapperClass={look === "toggle" ? "toggle-checkbox" : "default-checkbox"}
              inputClass={look}
              tour={(field as any).tour}
              hintOuterClass="settings-metabox-description"
              hintInnerClass="hover-tooltip"
              idPrefix={`${field.key}-${rowIndex}`}
              selectDeselect={field.selectDeselect}
              selectDeselectValue="Select / Deselect All"
              rightContentClass="settings-metabox-description"
              rightContent={(field as any).rightContent}
              options={
                Array.isArray(field.options)
                  ? field.options.map((opt) => ({ ...opt, value: String(opt.value) }))
                  : []
              }
              value={normalizedValue}
              onChange={(e) => {
                if (Array.isArray(e)) {
                  handleChange(rowIndex, field.key, e.length > 0 ? e : []);
                } else if ("target" in e) {
                  const target = e.target as HTMLInputElement;
                  handleChange(rowIndex, field.key, target.checked ? [target.value] : []);
                }
              }}
              onMultiSelectDeselectChange={() =>
                handleChange(
                  rowIndex,
                  field.key,
                  Array.isArray(field.options)
                    ? field.options.map((opt) => String(opt.value))
                    : []
                )
              }
              proChanged={() => setModelOpen(true)}
            />
          </div>
        );
      }

      default:
        return null;
    }
  }

  return (
    <div className="nested-wrapper" id={id}>
      {rows.map((row, rowIndex) => (
        <div key={`nested-row-${rowIndex}`} className={`nested-row ${single ? "" : "multiple"}`}>
          {fields.map((field) => renderField(field, row, rowIndex))}
          {!single && (
            <div className="buttons-wrapper">
              {/* Add button only on last row */}
              {rowIndex === rows.length - 1 && (
                <button
                  type="button"
                  className="admin-btn btn-purple"
                  onClick={addRow}
                  disabled={!isLastRowComplete()}
                >
                  <i className="adminlib-plus-circle-o"></i> {addButtonLabel}
                </button>
              )}

              {/* Delete button on all rows except row 0 */}
              {rows.length > 1 && rowIndex > 0 && (
                <button
                  type="button"
                  className="admin-btn btn-red"
                  onClick={() => removeRow(rowIndex)}
                >
                  <i className="adminlib-close"></i> {deleteButtonLabel}
                </button>
              )}

            </div>
          )}

        </div>
      ))}
      {description && (
        <p
          className={`settings-metabox-description`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
};

export default NestedComponent;
