import React, { useState } from 'react';

import "../styles/web/PaymentTabsComponent.scss";
import VerificationMethods from './VerificationMethods';
import TextArea from './TextArea';
import ToggleSetting from './ToggleSetting';

interface PaymentFormField {
    key: string;
    type: 'text' | 'password' | 'number' | 'checkbox' | 'verification-methods' | 'textarea' | 'payment-tabs' | 'setting-toggle';
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
    toggleType?: 'icon' | 'checkbox';
    wrapperClass?: string
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
    buttonEnable?: boolean
}

const PaymentTabsComponent: React.FC<PaymentTabsComponentProps> = ({
    methods,
    value,
    onChange,
}) => {
    const [activeTab, setActiveTab] = useState<string | null>(null);

    const handleInputChange = (methodKey: string, fieldKey: string, fieldValue: any) => {
        const updated = {
            ...value,
            [methodKey]: {
                ...value[methodKey],
                [fieldKey]: fieldValue,
            },
        };
        onChange(updated);
    };

    const toggleEnable = (methodId: string, enable: boolean) => {
        handleInputChange(methodId, 'enable', enable);
        if (!enable) setActiveTab(null); // close tab if disabling
    };

    return (
        <div className="payment-tabs-component">
            {methods.map((method) => {
                const isEnabled = !!value?.[method.id]?.enable;

                return (
                    <div key={method.id} className={`${method.wrapperClass || ""} payment-method-card`}>

                        {/* Header */}
                        <div className="payment-method" style={{ cursor: 'pointer' }}>
                            <div className="details">
                                <div className="payment-method-icon"><img src={method.icon} /></div>
                                <div className="payment-method-info">
                                    <div className="title-wrapper">
                                        <span className="title">{method.label}</span>

                                        {/* Enable / Disable */}
                                        {!isEnabled ? (
                                            <span
                                                className="admin-badge green"
                                                onClick={() => toggleEnable(method.id, true)}
                                            >
                                                Enable
                                            </span>
                                        ) : (
                                            <span
                                                className="admin-badge red"
                                                onClick={() => toggleEnable(method.id, false)}
                                            >
                                                Disable
                                            </span>
                                        )}
                                    </div>
                                    <div className="method-desc">{method.desc}</div>
                                </div>
                            </div>

                            {/* Arrow only shows when enabled */}
                            {isEnabled && (
                                <div
                                    className="payment-method-arrow"
                                    onClick={() =>
                                        setActiveTab(activeTab === method.icon ? null : method.icon)
                                    }
                                >
                                    <i className="adminlib-pagination-right-arrow"></i>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        {isEnabled && activeTab === method.icon && (
                            <div className="payment-method-form">
                                {method.formFields.map((field) => (
                                    <div key={field.key} className="form-group">
                                        <label>{field.label}</label>
                                        <div className="input-content">
                                            {field.type === 'verification-methods' ? (
                                                <VerificationMethods
                                                    value={value[method.id]?.[field.key] || []}
                                                    nestedFields={field.nestedFields || []}
                                                    addButtonLabel={field.addButtonLabel}
                                                    deleteButtonLabel={field.deleteButtonLabel}
                                                    onChange={(val) =>
                                                        handleInputChange(method.id, field.key, val)
                                                    }
                                                />
                                            ) : field.type === 'payment-tabs' && Array.isArray(field.modal) ? (
                                                <PaymentTabsComponent
                                                    name={field.key}
                                                    methods={field.modal || []}
                                                    value={value[method.id]?.[field.key] || {}}
                                                    onChange={(val) =>
                                                        handleInputChange(method.id, field.key, val)
                                                    }
                                                />
                                            ) : field.type === 'setting-toggle' ? (
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
                                                    value={value[method.id]?.[field.key] || ''}
                                                    onChange={(val) => {
                                                        handleInputChange(method.id, field.key, val)
                                                    }}
                                                />
                                            ) : field.type === 'checkbox' ? (
                                                <input
                                                    type="checkbox"
                                                    checked={!!value[method.id]?.[field.key]}
                                                    onChange={(e) =>
                                                        handleInputChange(method.id, field.key, e.target.checked)
                                                    }
                                                />
                                            ) : field.type === 'textarea' ? (
                                                <TextArea
                                                    wrapperClass="setting-from-textarea"
                                                    inputClass={`${field.class || ''} textarea-input`}
                                                    descClass="settings-metabox-description"
                                                    description={field.desc || ''}
                                                    key={field.key}
                                                    id={field.key}
                                                    name={field.key}
                                                    placeholder={field.placeholder}
                                                    rowNumber={field.rowNumber}
                                                    colNumber={field.colNumber}
                                                    value={value[method.id]?.[field.key] || ''}
                                                    proSetting={false}
                                                    onChange={(e) =>
                                                        handleInputChange(method.id, field.key, e.target.value)
                                                    }
                                                />
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    placeholder={field.placeholder}
                                                    value={value[method.id]?.[field.key] || ''}
                                                    className="basic-input"
                                                    onChange={(e) =>
                                                        handleInputChange(method.id, field.key, e.target.value)
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PaymentTabsComponent;
