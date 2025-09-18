import React, { useState } from "react";
import "../styles/web/PaymentTabsComponent.scss";
import VerificationMethods from "./VerificationMethods";
import TextArea from "./TextArea";
import ToggleSetting from "./ToggleSetting";
import MultiCheckBox from "./MultiCheckbox";

interface PaymentFormField {
  key: string;
  type:
  | "text"
  | "password"
  | "number"
  | "checkbox"
  | "verification-methods"
  | "textarea"
  | "payment-tabs"
  | "setting-toggle";
  label: string;
  placeholder?: string;
  nestedFields?: any[];
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  class?: string;
  desc?: string;
  rowNumber?: number;
  colNumber?: number;
  options?: any;
  modal?: PaymentMethod[];
}

interface PaymentMethod {
  icon: string;
  id: string;
  label: string;
  connected: boolean;
  desc: string;
  formFields: PaymentFormField[];
  toggleType?: "icon" | "checkbox";
  wrapperClass?: string;
}

interface PaymentTabsComponentProps {
  name: string;
  proSetting?: boolean;
  proSettingChanged?: () => void;
  apilink?: string;
  appLocalizer?: Record<string, any>;
  methods: PaymentMethod[];
  value: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  buttonEnable?: boolean;
}

const PaymentTabsComponent: React.FC<PaymentTabsComponentProps> = ({
  methods,
  value,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const handleInputChange = (
    methodKey: string,
    fieldKey: string,
    fieldValue: any
  ) => {
    onChange({
      ...value,
      [methodKey]: {
        ...value[methodKey],
        [fieldKey]: fieldValue,
      },
    });
  };

  const toggleEnable = (methodId: string, enable: boolean, icon?: string) => {
    handleInputChange(methodId, "enable", enable);
    setActiveTab(enable ? icon || null : null);
  };

  const renderField = (methodId: string, field: PaymentFormField) => {
    const fieldValue = value[methodId]?.[field.key];

    switch (field.type) {
      case "verification-methods":
        return (
          <VerificationMethods
            value={fieldValue || []}
            nestedFields={field.nestedFields || []}
            addButtonLabel={field.addButtonLabel}
            deleteButtonLabel={field.deleteButtonLabel}
            onChange={(val) => handleInputChange(methodId, field.key, val)}
          />
        );

      case "payment-tabs":
        return (
          <PaymentTabsComponent
            name={field.key}
            methods={field.modal || []}
            value={fieldValue || {}}
            onChange={(val) => handleInputChange(methodId, field.key, val)}
          />
        );

      case "setting-toggle":
        return (
          <ToggleSetting
            key={field.key}
            description={field.desc}
            options={
              Array.isArray(field.options)
                ? field.options.map((opt) => ({
                  ...opt,
                  value: String(opt.value),
                }))
                : []
            }
            value={fieldValue || ""}
            onChange={(val) => handleInputChange(methodId, field.key, val)}
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!fieldValue}
            onChange={(e) =>
              handleInputChange(methodId, field.key, e.target.checked)
            }
          />
        );

      case "textarea":
        return (
          <TextArea
            wrapperClass="setting-from-textarea"
            inputClass={`${field.class || ""} textarea-input`}
            descClass="settings-metabox-description"
            description={field.desc || ""}
            key={field.key}
            id={field.key}
            name={field.key}
            placeholder={field.placeholder}
            rowNumber={field.rowNumber}
            colNumber={field.colNumber}
            value={fieldValue || ""}
            proSetting={false}
            onChange={(e) =>
              handleInputChange(methodId, field.key, e.target.value)
            }
          />
        );

      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={fieldValue || ""}
            className="basic-input"
            onChange={(e) =>
              handleInputChange(methodId, field.key, e.target.value)
            }
          />
        );
    }
  };

  return (
    <div className="payment-tabs-component">
      {methods.map((method) => {
        const isEnabled = !!value?.[method.id]?.enable;
        const isActive = activeTab === method.icon;

        return (
          <div key={method.id} className="payment-method-card">
            {/* Header */}
            <div
              className="payment-method"
            >
              <div className="toggle-icon">
                {isEnabled ? (
                  <i
                    className="adminlib-eye"
                    onClick={() => toggleEnable(method.id, false, method.icon)}
                  />
                ) : (
                  <i
                    className="adminlib-eye-blocked disable"
                    onClick={() => toggleEnable(method.id, true, method.icon)}
                  />
                )}
              </div>
              <div className="details" onClick={() => setActiveTab(isActive ? null : method.icon)}>
                <div className="details-wrapper">
                  <div className="payment-method-icon">
                    {/* <img src={method.icon} alt={method.label} /> */}
                    <i className={method.icon}></i>
                  </div>
                  <div className="payment-method-info">
                    <div className="title-wrapper">
                      <span className="title">{method.label}</span>
                      <div
                        className={`admin-badge ${isEnabled ? "green" : "red"}`}
                      >
                        {isEnabled ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div className="method-desc">{method.desc}</div>
                  </div>
                </div>
                {isEnabled && (
                  <div className="admin-btn btn-purple" onClick={() => setActiveTab(isActive ? null : method.icon)} >Manage</div>
                )}
              </div>

              <div className="right-section toggle-btn" onClick={() => toggleEnable(method.id, true, method.icon)}>
                <i className="adminlib-more-vertical"></i>                                
              </div>
            </div>

            <div
              className={`${method.wrapperClass || ""} payment-method-form
                 ${isEnabled && isActive ? "open" : ""
                }`}
            >
              {method.formFields.map((field) => (
                <div key={field.key} className="form-group">
                  {field.label && <label>{field.label}</label>}
                  <div className="input-content">
                    {renderField(method.id, field)}
                  </div>
                </div>
              ))}
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default PaymentTabsComponent;
