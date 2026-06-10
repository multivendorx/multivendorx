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
    { id: '7', type: 'fileupload', label: 'Filesize Limit', name: 'File upload size limit' },
    { id: '8', type: 'attachment', label: 'Fileupload', name: 'File upload', placeholder: '' },
    { id: '9', type: 'custom-recaptcha', label: 'Captcha', name: 'Captcha', placeholder: '' },
    { id: '10', type: 'button', label: 'Submit' },
];

const toArray = (val: unknown): FormField[] => (Array.isArray(val) ? val : []);

const isSubmitButton = (field?: Partial<FormField>) => field?.name?.trim().toLowerCase() === 'submit';

// Helper that returns a complete default submit button object
const getDefaultSubmitButton = (): FormField => ({
    id: '10',
    type: 'button',
    label: 'Submit',
    placeholder: '',
    disabled: false,
    name: 'Submit',
});

// Ensures the submit button is always present in the fields array
const ensureSubmitPresent = (fields: FormField[]): FormField[] => {
    const hasSubmit = fields.some(field => isSubmitButton(field));

    if (hasSubmit) {
        return fields.map(field =>
            isSubmitButton(field)
                ? { ...field, disabled: false }
                : field
        );
    }
    return [...fields, getDefaultSubmitButton()];
};

const FreeFormCustomizerField: React.FC<{
    value?: FormField[];
    canAccess: boolean;
    onChange: (val: FormField[]) => void;
}> = ({ value, canAccess, onChange }) => {
    const [fields, setFields] = useState<FormField[]>(() =>
        ensureSubmitPresent(toArray(value))
    );
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const isDirty = useRef(false);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        const newFields = toArray(value);
        const merged = ensureSubmitPresent(newFields);
        if (JSON.stringify(fields) !== JSON.stringify(merged)) {
            setFields(merged);
            isDirty.current = false;
        }
    }, [value]);

    useEffect(() => {
        if (isDirty.current) {
            const toSave = ensureSubmitPresent(fields);
            onChange(toSave);
            isDirty.current = false;
        }
    }, [fields, onChange]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editingFieldId) {
                const inputElement = inputRefs.current[editingFieldId];
                if (inputElement && !inputElement.contains(event.target as Node)) {
                    setEditingFieldId(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingFieldId]);

    const getField = (id: string | number) => fields.find(f => String(f.id) === String(id));

    const ensureFieldExists = (id: string): FormField => {
        const existing = getField(id);
        if (existing) return existing;
        const config = FORM_FIELDS_CONFIG.find(f => f.id === id);
        const isSubmit = isSubmitButton(config);
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
            const existing = prev.find( f => String(f.id) === String(id) );
            if (existing) {
                return prev.map(f => String(f.id) === String(id) ? { ...f, label } : f);
            }
            const newField = ensureFieldExists(id);
            return [...prev, { ...newField, label }];
        });
    };

    const updateFieldPlaceholder = (id: string, placeholder: string) => {
        if (!canAccess) return;
        isDirty.current = true;
        setFields(prev => {
            const existing = prev.find( f => String(f.id) === String(id) );
            if (existing) {
                return prev.map(f => String(f.id) === String(id) ? { ...f, placeholder } : f);
            }
            const newField = ensureFieldExists(id);
            return [...prev, { ...newField, placeholder }];
        });
    };

    const updateFieldActive = (id: string, disabled: boolean) => {
        const targetField = fields.find(f => f.id === id) || FORM_FIELDS_CONFIG.find(f => f.id === id);

        if (isSubmitButton(targetField) || !canAccess) {
            return;
        }

        isDirty.current = true;
        setFields(prev => {
            const existing = prev.find( f => String(f.id) === String(id) );
            if (existing) {
                return prev.map(f => String(f.id) === String(id) ? { ...f, disabled } : f);
            }
            const newField = ensureFieldExists(id);
            return [...prev, { ...newField, disabled }];
        });
    };

    const handleToggle = (id: string) => {
        const targetField =
            fields.find(f => f.id === id) ||
            FORM_FIELDS_CONFIG.find(f => f.id === id);

        if (isSubmitButton(targetField)) {
            return;
        }

        const current = getField(id)?.disabled ?? true;
        updateFieldActive(id, !current);
    };

    const handleEditClick = (fieldId: string) => {
        if (!canAccess) return;
        setEditingFieldId(fieldId);
        // Focus the input after it's rendered
        setTimeout(() => {
            if (inputRefs.current[fieldId]) {
                inputRefs.current[fieldId]?.focus();
            }
        }, 0);
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
                const isSubmit = isSubmitButton(field) || isSubmitButton(fieldConfig);
                const isActive = isSubmit ? true : !(field?.disabled ?? true);
                const isEditing = editingFieldId === fieldConfig.id;

                return (
                    <div key={fieldConfig.id} className={`free-form-row ${isActive ? '' : 'enable-visibility'}`} >
                        <div className="free-form-input">
                            {isEditing ? (
                                <BasicInputUI
                                    type="text"
                                    value={currentLabel}
                                    onChange={(val) => updateFieldLabel(fieldConfig.id, val)}
                                    readOnly={!canAccess}
                                    ref={(el) => inputRefs.current[fieldConfig.id] = el}
                                />
                            ) : (
                                <label onClick={() => handleEditClick(fieldConfig.id)}>
                                    {currentLabel}
                                    <i className='adminfont-edit' />
                                </label>
                            )}
                        </div>
                        <div className="free-form-input">
                            {!isSubmit && (
                                <BasicInputUI
                                    type="text"
                                    value={currentPlaceholder}
                                    onChange={(val) => updateFieldPlaceholder(fieldConfig.id, val)}
                                    readOnly={!canAccess}
                                />
                            )}
                        </div>
                        {!isSubmit && (
                            <i onClick={() => handleToggle(fieldConfig.id)} className={`visibility-icon adminfont-${isActive ? 'eye' : 'eye-blocked'}`} />
                        )}
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