// FreeFormCustomizer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FieldComponent } from './fieldUtils';
import '../styles/web/FreeFormCustomizer.scss';
import FormGroup from './UI/FormGroup';
import { BasicInputUI } from './BasicInput';

interface FormField {
    id: string;
    type: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    name?: string;
}

const FORM_FIELDS_CONFIG = [
    { id: '1', type: 'text', label: 'Name', name: 'name', placeholder: 'Enter your name here' },
    { id: '2', type: 'email', label: 'Email', name: 'email', placeholder: 'Enter your email here' },
    { id: '3', type: 'text', label: 'Phone', name: 'phone', placeholder: 'Enter your phone number here' },
    { id: '4', type: 'text', label: 'Address', name: 'address', placeholder: 'Enter your address here' },
    { id: '5', type: 'text', label: 'Subject', name: 'subject', placeholder: 'Enter the subject of your enquiry here' },
    { id: '6', type: 'text', label: 'Comment', name: 'comment', placeholder: 'Enter the details of your enquiry here' },
    { id: '7', type: 'attachment', label: 'Fileupload', name: 'File upload', placeholder: '' },
    { id: '8', type: 'recaptcha', label: 'Captcha', name: 'Captcha', placeholder: '' },
    { id: '9', type: 'button', label: 'Submit', placeholder: '' },
];

const SUBMIT_BUTTON_ID = '9';

const toArray = (val: unknown): FormField[] => (Array.isArray(val) ? val : []);

// Helper that returns a complete default submit button object
const getDefaultSubmitButton = (): FormField => ({
    id: SUBMIT_BUTTON_ID,
    type: 'button',
    label: 'Submit',
    placeholder: '',
    disabled: false,
    name: 'Submit',
});

// Ensures the submit button is always present in the fields array
const ensureSubmitPresent = (fields: FormField[]): FormField[] => {
    const hasSubmit = fields.some(f => f.id === SUBMIT_BUTTON_ID);
    if (hasSubmit) {
        // Make sure submit is always enabled
        return fields.map(f => f.id === SUBMIT_BUTTON_ID ? { ...f, disabled: false } : f);
    }
    return [...fields, getDefaultSubmitButton()];
};

const FreeFormCustomizerField: React.FC<{
    value?: FormField[];
    canAccess: boolean;
    onChange: (val: FormField[]) => void;
}> = ({ value, canAccess, onChange }) => {
    // Initialize fields: start with external value (if any), then ensure submit is present
    const [fields, setFields] = useState<FormField[]>(() => 
        ensureSubmitPresent(toArray(value))
    );
    const isDirty = useRef(false);

    // Sync external changes, but always preserve the submit button
    useEffect(() => {
        const newFields = toArray(value);
        // Merge: keep submit from existing fields (if any) or default, then add other fields
        const merged = ensureSubmitPresent(newFields);
        if (JSON.stringify(fields) !== JSON.stringify(merged)) {
            setFields(merged);
            isDirty.current = false;
        }
    }, [value]);

    // Auto-save: always include submit button
    useEffect(() => {
        if (isDirty.current) {
            // Ensure submit is always present and enabled before saving
            const toSave = ensureSubmitPresent(fields);
            onChange(toSave);
            isDirty.current = false;
        }
    }, [fields, onChange]);

    const getField = (id: string) => fields.find(f => f.id === id);

    const ensureFieldExists = (id: string): FormField => {
        const existing = getField(id);
        if (existing) return existing;
        const config = FORM_FIELDS_CONFIG.find(f => f.id === id);
        const isSubmit = id === SUBMIT_BUTTON_ID;
        return {
            id: config?.id || id,
            type: config?.type || 'text',
            label: config?.label || id,
            placeholder: config?.placeholder || '',
            disabled: isSubmit ? false : true,
            name: config?.name || '',
        };
    };

    const updateFieldLabel = (id: string, label: string) => {
        if (!canAccess) return;
        isDirty.current = true;
        setFields(prev => {
            const existing = prev.find(f => f.id === id);
            if (existing) {
                return prev.map(f => f.id === id ? { ...f, label } : f);
            }
            const newField = ensureFieldExists(id);
            return [...prev, { ...newField, label }];
        });
    };

    const updateFieldPlaceholder = (id: string, placeholder: string) => {
        if (!canAccess) return;
        isDirty.current = true;
        setFields(prev => {
            const existing = prev.find(f => f.id === id);
            if (existing) {
                return prev.map(f => f.id === id ? { ...f, placeholder } : f);
            }
            const newField = ensureFieldExists(id);
            return [...prev, { ...newField, placeholder }];
        });
    };

    const updateFieldActive = (id: string, disabled: boolean) => {
        if (id === SUBMIT_BUTTON_ID) return;
        if (!canAccess) return;
        isDirty.current = true;
        setFields(prev => {
            const existing = prev.find(f => f.id === id);
            if (existing) {
                return prev.map(f => f.id === id ? { ...f, disabled } : f);
            }
            const newField = ensureFieldExists(id);
            return [...prev, { ...newField, disabled }];
        });
    };

    const handleToggle = (id: string) => {
        if (id === SUBMIT_BUTTON_ID) return;
        const current = getField(id)?.disabled ?? true;
        updateFieldActive(id, !current);
    };

    return (
        <div className='free-form-customizer'>
            <div className='free-form-header'> 
                <div className="title">Field Label</div>
                <div className="title">Placeholder Text</div>
                {/* <div className="header-active">Active</div> */}
            </div>

            {FORM_FIELDS_CONFIG.map(fieldConfig => {
                const field = getField(fieldConfig.id);
                const currentLabel = field?.label ?? fieldConfig.label ?? '';
                const currentPlaceholder = field?.placeholder ?? fieldConfig.placeholder ?? '';
                const isSubmit = fieldConfig.id === SUBMIT_BUTTON_ID;
                const isActive = isSubmit ? true : !(field?.disabled ?? true);

                return (
                    <div key={fieldConfig.id} className="free-form-row">
                        <div className="free-form-input ">
                            <BasicInputUI
                                type="text"
                                value={currentLabel}
                                onChange={(val) => updateFieldLabel(fieldConfig.id, val)}
                                readOnly={!canAccess}
                            />
                            <label>Field Label <i className='adminfont-edit' /></label>
                        </div>
                        <div className="free-form-input ">
                            <BasicInputUI
                                type="text"
                                value={currentPlaceholder}
                                onChange={(val) => updateFieldPlaceholder(fieldConfig.id, val)}
                                readOnly={!canAccess}
                            />
                        </div>
                        <div className="free-form-active-toggle">
                            {!isSubmit ? (
                                <div
                                    className={`admin-btn button-visibility btn-${isActive ? 'purple' : 'red'}`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleToggle(fieldConfig.id)}
                                >
                                    <i className={`adminfont-${isActive ? 'eye' : 'eye-blocked enable-visibility'}`} />
                                </div>
                            ) : (
                                <div className="button-visibility always-active" title="Always active">
                                    <i className="adminfont-eye" />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const FreeFormCustomizer: FieldComponent = {
    render: ({ field, value, onChange, canAccess }) => (
        <FreeFormCustomizerField
            value={value as FormField[]}
            canAccess={canAccess}
            onChange={onChange}
        />
    ),
    validate: () => null,
};

export default FreeFormCustomizer;