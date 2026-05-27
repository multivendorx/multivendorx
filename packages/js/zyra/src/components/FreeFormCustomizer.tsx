// FreeFormCustomizer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FieldComponent } from './fieldUtils';

// Types
interface FormField {
    id: string;
    type: string;
    label?: string;
    disabled?: boolean;
    name?: string;
    placeholder?: string;
}

// Field configuration
const FORM_FIELDS_CONFIG = [
    { id: '1', type: 'text', label: 'Name', name: 'name', placeholder: 'Enter your name here', },
    { id: '2', type: 'email', label: 'Email', name: 'email', placeholder: 'Enter your email here', },
    { id: '3', type: 'number', label: 'Phone', name: 'phone', placeholder: 'Enter your phone number here', },
    { id: '4', type: 'text', label: 'Address', name: 'address', placeholder: 'Enter your address here', },
    { id: '5', type: 'text', label: 'Subject', name: 'subject', placeholder: 'Enter the subject of your enquiry here', },
    { id: '6', type: 'text', label: 'Comment', name: 'comment', placeholder: 'Enter the details of your enquiry here', },
    { id: '7', type: 'file', label: 'fileupload', name: 'File upload' },
    { id: '8', type: 'number', label: 'filesize-limit', name: 'File upload size limit (in MB)' },
    { id: '9', type: 'recaptcha', label: 'captcha', name: 'Captcha' },
    { id: '10', type: 'button', label: 'submit'},

];

// Helper to ensure we always have an array
const toArray = (val: unknown): FormField[] => (Array.isArray(val) ? val : []);

// Internal component that uses the props from RenderComponent
const FreeFormCustomizerField: React.FC<{
    value?: FormField[];
    canAccess: boolean;
    onChange: (val: FormField[]) => void;
}> = ({ value, canAccess, onChange }) => {
    const [fields, setFields] = useState<FormField[]>(() => toArray(value));
    const isDirty = useRef(false);

    // Sync when external value changes (e.g., after DB load)
    useEffect(() => {
        const newFields = toArray(value);
        if (JSON.stringify(fields) !== JSON.stringify(newFields)) {
            setFields(newFields);
            isDirty.current = false;
        }
    }, [value]);

    // Auto-save when user makes a change
    useEffect(() => {
        if (isDirty.current) {
            onChange(fields);
            isDirty.current = false;
        }
    }, [fields, onChange]);

    const getField = (id: string) => fields.find(f => f.id === id);

    const updateFieldActive = (id: string, disabled: boolean) => {
        if (!canAccess) return;

        isDirty.current = true;

        setFields(prev => {
            const existing = prev.find(f => f.id === id);

            if (existing) {
                return prev.map(f =>
                    f.id === id
                        ? { ...f, disabled }
                        : f
                );
            }

            const config = FORM_FIELDS_CONFIG.find(f => f.id === id);

            return [
                ...prev,
                {
                    id: config?.id || id,
                    type: config?.type,
                    label: config?.label || id,
                    disabled,
                    placeholder: config?.placeholder || '',
                    name: config?.name || '',
                },
            ];
        });
    };

    const updateFieldLabel = (id: string, label: string) => {
        if (!canAccess) return;
        isDirty.current = true;
        setFields(prev => {
            const existing = prev.find(f => f.id === id);
            if (existing) {
                return prev.map(f => f.id === id ? { ...f, label } : f);
            }
            const config = FORM_FIELDS_CONFIG.find(f => f.id === id);
            return [...prev, { id: config?.id || id, type: config?.type, label, name: config?.name || '', disabled: false }];
        });
    };

    const handleToggle = (id: string) => {
        const current = getField(id)?.disabled ?? true;
        updateFieldActive(id, !current);
    };

    return (
        <div className="form-field">
            <div className="edit-form-wrapper free-form">
                <h3 className="form-label">Field Name</h3>
                <h3 className="set-name">Set new field name</h3>
            </div>
            {FORM_FIELDS_CONFIG.map(fieldConfig => {
                const field = getField(fieldConfig.id);
                const isReadonly = field?.disabled ?? true;

                return (
                    <div className="edit-form-wrapper free-form" key={fieldConfig.type}>
                        <div className="form-label" style={{ opacity: isReadonly ? '0.3' : '1' }}>
                            {fieldConfig.name}
                        </div>
                        <div className="settings-form-group-radio">
                            <input
                                className="basic-input"
                                type="text"
                                onChange={e => updateFieldLabel(fieldConfig.id, e.target.value)}
                                value={field?.placeholder || ''}
                                readOnly={isReadonly || !canAccess}
                                style={{ opacity: isReadonly ? '0.3' : '1' }}
                            />
                        </div>
                        <div
                            className="button-visibility"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleToggle(fieldConfig.id)}
                        >
                            <i className={`admin-font ${isReadonly ? 'adminfont-eye-blocked enable-visibility' : 'adminfont-eye'}`} />
                        </div>
                        
                    </div>
                );
            })}
        </div>
    );
};

// FieldComponent export – matches the pattern of TextArea
const FreeFormCustomizer: FieldComponent = {
    render: ({ field, value, onChange, canAccess }) => (
        <FreeFormCustomizerField
            value={value as FormField[]}
            canAccess={canAccess}
            onChange={onChange}
        />
    ),
    validate: () => null, // no validation needed
};

export default FreeFormCustomizer;