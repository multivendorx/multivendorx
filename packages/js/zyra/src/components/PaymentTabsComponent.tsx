import React, { useState } from 'react';

import "../styles/web/PaymentTabsComponent.scss";
import VerificationMethods from './VerificationMethods'; // adjust the path as needed
import TextArea from './TextArea'; // import your TextArea component

interface PaymentFormField {
    key: string;
    type: 'text' | 'password' | 'number' | 'checkbox' | 'verification-methods' | 'textarea' | 'payment-tabs';
    label: string;
    placeholder?: string;
    nestedFields?: any[]; // for verification-methods
    addButtonLabel?: string;
    deleteButtonLabel?: string;
    class?: string;
    desc?: string;
    rowNumber?: number;
    colNumber?: number;
    modal?: PaymentMethod[]; // for payment-tabs
}

interface PaymentMethod {
    icon: string;
    label: string;
    connected: boolean;
    desc: string;
    formFields: PaymentFormField[];
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
}

const PaymentTabsComponent: React.FC<PaymentTabsComponentProps> = ({
    name,
    proSetting,
    proSettingChanged,
    apilink,
    appLocalizer,
    methods,
    value,
    onChange
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

    return (
        <div className="payment-tabs-component">
            {methods.map((method) => (
                <div key={method.icon} className="payment-method-card">
                    {/* Header */}
                    <div
                        className="payment-method-header"
                        onClick={() =>
                            setActiveTab(activeTab === method.icon ? null : method.icon)
                        }
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="payment-method-icon">{method.icon}</div>
                        <div className="payment-method-info">
                            <div className="title">
                                <span>{method.label}</span>
                                <div className={method.connected ? 'admin-badge green' : 'admin-badge red'}>
                                    {method.connected ? 'Connected' : 'Not Connected'}
                                </div>
                            </div>
                            <div className="method-desc">{method.desc}</div>
                        </div>
                    </div>

                    {/* Form */}
                    {activeTab === method.icon && (
                        <div className="payment-method-form">
                            {method.formFields.map((field) => (
                                <div key={field.key} className="form-group">
                                    <label>{field.label}</label>

                                    {field.type === 'verification-methods' ? (
                                        <VerificationMethods
                                            value={value[method.icon]?.[field.key] || []}
                                            nestedFields={field.nestedFields || []}
                                            addButtonLabel={field.addButtonLabel}
                                            deleteButtonLabel={field.deleteButtonLabel}
                                            onChange={(val) =>
                                                handleInputChange(method.icon, field.key, val)
                                            }
                                        />
                                    ) : field.type === 'payment-tabs' ? (
                                        <PaymentTabsComponent
                                            name={field.key}
                                            methods={field.modal || []}
                                            value={value[method.icon]?.[field.key] || {}}
                                            onChange={(val) =>
                                                handleInputChange(method.icon, field.key, val)
                                            }
                                        />
                                    ) : field.type === 'checkbox' ? (
                                        <input
                                            type="checkbox"
                                            checked={!!value[method.icon]?.[field.key]}
                                            onChange={(e) =>
                                                handleInputChange(method.icon, field.key, e.target.checked)
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
                                            value={value[method.icon]?.[field.key] || ''}
                                            proSetting={false}
                                            onChange={(e) =>
                                                handleInputChange(method.icon, field.key, e.target.value)
                                            }
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={value[method.icon]?.[field.key] || ''}
                                            onChange={(e) =>
                                                handleInputChange(method.icon, field.key, e.target.value)
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PaymentTabsComponent;
