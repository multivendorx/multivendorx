/**
 * External dependencies
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ReactSortable } from 'react-sortablejs';

import '../styles/web/SettingMetaBox.scss';
import StyleControls from './StyleControl';
import ToggleSetting from './ToggleSetting';

// TYPES
type FormFieldValue = string | number | boolean | Option[] | Record<string, any>;
type SettingFieldKey = keyof FormField | 'value' | 'style' | 'layout' | 'text' | 'level' | 'src' | 'alt' | 'url';

interface Option {
    id: string;
    label: string;
    value: string;
    isdefault?: boolean;
}

interface FormField {
    id: number;
    type: string;
    name: string;
    placeholder?: string;
    charlimit?: number;
    row?: number;
    column?: number;
    label?: string;
    sitekey?: string;
    filesize?: number;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    options?: Option[];
    html?: string;
    text?: string;
    level?: 1 | 2 | 3;
    src?: string;
    alt?: string;
    url?: string;
    style?: Record<string, any>;
    layout?: '1' | '2-50' | '2-66' | '3' | '4';
}

interface InputType {
    value: string;
    label: string;
}

interface SettingMetaBoxProps {
    formField?: FormField;
    inputTypeList?: InputType[];
    onChange: (field: SettingFieldKey, value: FormFieldValue) => void;
    onTypeChange?: (value: string) => void;
    opened: { click: boolean };
    metaType?: string;
    option?: Option;
    setDefaultValue?: () => void;
}

// CONSTANTS
const RECAPTCHA_PATTERN = /^6[0-9A-Za-z_-]{39}$/;

const LAYOUT_OPTIONS = [
    { value: '1', label: '1 Column' },
    { value: '2-50', label: '50 / 50' },
    { value: '2-66', label: '66 / 34' },
    { value: '3', label: '3 Columns' },
    { value: '4', label: '4 Columns' },
];

const HEADING_LEVELS = [
    { id: 'h1', value: 1, label: 'H1' },
    { id: 'h2', value: 2, label: 'H2' },
    { id: 'h3', value: 3, label: 'H3' },
];

const BLOCK_TYPES = new Set(['richtext', 'heading', 'image', 'button', 'divider', 'columns']);

const DEFAULT_EXPANDED_GROUPS = {
    heading: true,
    image: true,
    button: true,
    layout: false,
    text: false,
    background: false,
    spacing: false,
    border: false,
};

// REUSABLE COMPONENTS
const FieldWrapper: React.FC<{ label: string; className?: string; children: React.ReactNode }> = 
    ({ label, children, className }) => (
        <div className={`edit-field-wrapper ${className || ''}`} onClick={(e) => e.stopPropagation()}>
            <label>{label}</label>
            {children}
        </div>
    );

const InputField: React.FC<{
    label: string;
    type?: string;
    value: string | number;
    onChange: (value: string) => void;
    className?: string;
    readonly?: boolean;
    placeholder?: string;
}> = ({ label, type = 'text', value, onChange, className, readonly = false, placeholder }) => (
    <FieldWrapper label={label} className={className}>
        <input
            type={type}
            value={value || ''}
            className="basic-input"
            onChange={(e) => onChange(e.target.value)}
            readOnly={readonly}
            placeholder={placeholder}
        />
    </FieldWrapper>
);

const FormFieldSelect: React.FC<{
    inputTypeList: InputType[];
    formField: FormField;
    onTypeChange: (value: string) => void;
}> = ({ inputTypeList, formField, onTypeChange }) => (
    <FieldWrapper label="Type">
        <select onChange={(e) => onTypeChange(e.target.value)} value={formField.type} className="basic-select">
            {inputTypeList.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
            ))}
        </select>
    </FieldWrapper>
);

const ContentGroup: React.FC<{ title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }> = 
    ({ title, expanded, onToggle, children }) => (
        <div className="setting-group" onClick={(e) => e.stopPropagation()}>
            <div className="setting-group-header" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                <h4>{title}</h4>
                <i className={`adminfont-${expanded ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
            </div>
            {expanded && <div className="setting-group-content">{children}</div>}
        </div>
    );

const VisibilityToggle: React.FC<{ disabled?: boolean; onChange: (disabled: boolean) => void }> = 
    ({ disabled = false, onChange }) => (
        <FieldWrapper label="Visibility">
            <div className="toggle-setting-container">
                <div className="toggle-setting-wrapper">
                    {[
                        { id: 'visible', label: 'Visible', checked: !disabled, value: false },
                        { id: 'hidden', label: 'Hidden', checked: disabled, value: true },
                    ].map(({ id, label, checked, value }) => (
                        <div key={id}>
                            <input
                                type="radio"
                                id={id}
                                name="tabs"
                                checked={checked}
                                onChange={() => onChange(value)}
                                className="toggle-setting-form-input"
                            />
                            <label htmlFor={id}>{label}</label>
                        </div>
                    ))}
                </div>
            </div>
        </FieldWrapper>
    );

const RadioGroup: React.FC<{
    name: string;
    options: readonly { id: string; value: number; label: string }[];
    value: number;
    onChange: (value: number) => void;
}> = ({ name, options, value, onChange }) => (
    <div className="toggle-setting-container">
        <div className="toggle-setting-wrapper">
            {options.map(({ id, value: optionValue, label }) => (
                <div key={id}>
                    <input
                        type="radio"
                        id={id}
                        name={name}
                        value={optionValue}
                        checked={value === optionValue}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="toggle-setting-form-input"
                    />
                    <label htmlFor={id}>{label}</label>
                </div>
            ))}
        </div>
    </div>
);

// OPTION EDITOR COMPONENT
const OptionEditor: React.FC<{ options: Option[]; onChange: (options: Option[]) => void }> = 
    ({ options, onChange }) => {
        const addOption = useCallback(() => {
            onChange([
                ...options,
                { id: crypto.randomUUID(), label: 'Option value', value: 'value' },
            ]);
        }, [options, onChange]);

        const updateOption = useCallback((index: number, updates: Partial<Option>) => {
            const newOptions = [...options];
            newOptions[index] = { ...newOptions[index], ...updates };
            onChange(newOptions);
        }, [options, onChange]);

        const deleteOption = useCallback((index: number) => {
            onChange(options.filter((_, i) => i !== index));
        }, [options, onChange]);

        return (
            <div className="multioption-wrapper" onClick={(e) => e.stopPropagation()}>
                <label>Set option</label>
                <ReactSortable list={options} setList={onChange} handle=".drag-handle-option">
                    {options.map((opt, index) => (
                        <div className="option-list-wrapper drag-handle-option" key={opt.id || index}>
                            <div className="option-icon admin-badge blue">
                                <i className="adminfont-drag" />
                            </div>
                            <div className="option-label">
                                <input
                                    type="text"
                                    className="basic-input"
                                    value={opt.label}
                                    onChange={(e) => updateOption(index, { label: e.target.value })}
                                />
                            </div>
                            <div className="option-icon admin-badge red">
                                <div
                                    role="button"
                                    className="delete-btn adminfont-delete"
                                    tabIndex={0}
                                    onClick={() => deleteOption(index)}
                                />
                            </div>
                        </div>
                    ))}
                </ReactSortable>
                <div className="buttons-wrapper">
                    <div className="add-more-option-section admin-btn btn-purple" onClick={addOption}>
                        Add new <span><i className="admin-font adminfont-plus" /></span>
                    </div>
                </div>
            </div>
        );
    };

// FIELD RENDERER FACTORY
const createFieldRenderers = (): Record<string, React.FC<{
    formField: FormField;
    onChange: (key: SettingFieldKey, value: FormFieldValue) => void;
    expandedGroups: Record<string, boolean>;
    toggleGroup: (group: string) => void;
}>> => ({
    // Basic inputs
    text: ({ formField, onChange }) => (
        <>
            <InputField label="Placeholder" value={formField.placeholder || ''} onChange={(v) => onChange('placeholder', v)} />
            <InputField label="Character limit" type="number" value={formField.charlimit?.toString() || ''} onChange={(v) => onChange('charlimit', Number(v))} />
        </>
    ),
    
    email: ({ formField, onChange }) => (
        <>
            <InputField label="Placeholder" value={formField.placeholder || ''} onChange={(v) => onChange('placeholder', v)} />
            <InputField label="Character limit" type="number" value={formField.charlimit?.toString() || ''} onChange={(v) => onChange('charlimit', Number(v))} />
        </>
    ),
    
    textarea: ({ formField, onChange }) => (
        <>
            <InputField label="Placeholder" value={formField.placeholder || ''} onChange={(v) => onChange('placeholder', v)} />
            <InputField label="Character limit" type="number" value={formField.charlimit?.toString() || ''} onChange={(v) => onChange('charlimit', Number(v))} />
            <InputField label="Row" type="number" value={formField.row?.toString() || ''} onChange={(v) => onChange('row', Number(v))} />
            <InputField label="Column" type="number" value={formField.column?.toString() || ''} onChange={(v) => onChange('column', Number(v))} />
        </>
    ),
    
    // Content blocks
    richtext: ({ formField, onChange }) => (
        <div onClick={(e) => e.stopPropagation()}>
            <StyleControls style={formField.style || {}} onChange={(s) => onChange('style', s)} includeTextStyles />
        </div>
    ),
    
    heading: ({ formField, onChange, expandedGroups, toggleGroup }) => (
        <>
            <ContentGroup title="Heading Content" expanded={expandedGroups.heading} onToggle={() => toggleGroup('heading')}>
                <InputField 
                    label="Heading Text" 
                    value={formField.text || ''} 
                    onChange={(v) => onChange('text', v)} 
                    placeholder="Enter heading text"
                />
                <div className="field-wrapper">
                    <label>Heading Level</label>
                    <RadioGroup 
                        name="heading-level" 
                        options={HEADING_LEVELS} 
                        value={formField.level || 2} 
                        onChange={(v) => onChange('level', v as 1 | 2 | 3)} 
                    />
                </div>
            </ContentGroup>
            <div onClick={(e) => e.stopPropagation()}>
                <StyleControls style={formField.style || {}} onChange={(s) => onChange('style', s)} includeTextStyles />
            </div>
        </>
    ),
    
    image: ({ formField, onChange, expandedGroups, toggleGroup }) => (
        <>
            <ContentGroup title="Image" expanded={expandedGroups.image} onToggle={() => toggleGroup('image')}>
                <InputField label="Image URL" value={formField.src || ''} onChange={(v) => onChange('src', v)} />
                <InputField label="Alt Text" value={formField.alt || ''} onChange={(v) => onChange('alt', v)} />
            </ContentGroup>
            <div onClick={(e) => e.stopPropagation()}>
                <StyleControls style={formField.style || {}} onChange={(s) => onChange('style', s)} includeTextStyles={false} />
            </div>
        </>
    ),
    
    button: ({ formField, onChange, expandedGroups, toggleGroup }) => (
        <>
            <ContentGroup title="Button Content" expanded={expandedGroups.button} onToggle={() => toggleGroup('button')}>
                <InputField label="Button Text" value={formField.text || ''} onChange={(v) => onChange('text', v)} />
                <InputField label="Button URL" value={formField.url || ''} onChange={(v) => onChange('url', v)} />
            </ContentGroup>
            <div onClick={(e) => e.stopPropagation()}>
                <StyleControls style={formField.style || {}} onChange={(s) => onChange('style', s)} includeTextStyles />
            </div>
        </>
    ),
    
    divider: ({ formField, onChange }) => (
        <div onClick={(e) => e.stopPropagation()}>
            <StyleControls style={formField.style || {}} onChange={(s) => onChange('style', s)} includeTextStyles={false} />
        </div>
    ),
    
    columns: ({ formField, onChange, expandedGroups, toggleGroup }) => (
        <>
            <ContentGroup title="Layout" expanded={expandedGroups.layout} onToggle={() => toggleGroup('layout')}>
                <div className="field-wrapper">
                    <label>Column Layout</label>
                    <select value={formField.layout || '2-50'} className="basic-input" onChange={(e) => onChange('layout', e.target.value)}>
                        {LAYOUT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </ContentGroup>
            <div onClick={(e) => e.stopPropagation()}>
                <StyleControls style={formField.style || {}} onChange={(s) => onChange('style', s)} includeTextStyles={false} />
            </div>
        </>
    ),
    
    // Selection fields
    multiselect: ({ formField, onChange }) => (
        <OptionEditor options={formField.options || []} onChange={(o) => onChange('options', o)} />
    ),
    dropdown: ({ formField, onChange }) => (
        <OptionEditor options={formField.options || []} onChange={(o) => onChange('options', o)} />
    ),
    checkboxes: ({ formField, onChange }) => (
        <OptionEditor options={formField.options || []} onChange={(o) => onChange('options', o)} />
    ),
    radio: ({ formField, onChange }) => (
        <OptionEditor options={formField.options || []} onChange={(o) => onChange('options', o)} />
    ),
    
    // Special fields
    recaptcha: ({ formField, onChange }) => {
        const [isValid, setIsValid] = useState(() => RECAPTCHA_PATTERN.test(formField.sitekey || ''));
        
        const handleChange = useCallback((value: string) => {
            onChange('sitekey', value);
            setIsValid(RECAPTCHA_PATTERN.test(value));
        }, [onChange]);
        
        return (
            <>
                <InputField 
                    label="Site key" 
                    value={formField.sitekey || ''} 
                    onChange={handleChange} 
                    className={!isValid ? 'highlight' : ''} 
                />
                <p>
                    Register your site with Google to obtain the{' '}
                    <a href="https://www.google.com/recaptcha" target="_blank" rel="noopener noreferrer">
                        reCAPTCHA script
                    </a>.
                </p>
            </>
        );
    },
    
    attachment: ({ formField, onChange }) => (
        <InputField 
            label="Max File Size" 
            type="number" 
            value={formField.filesize?.toString() || ''} 
            onChange={(v) => onChange('filesize', Number(v))} 
        />
    ),
    
    default: () => null,
});

// MAIN COMPONENT
const SettingMetaBox: React.FC<SettingMetaBoxProps> = ({
    formField,
    inputTypeList = [],
    onChange,
    onTypeChange,
    opened,
    option,
    metaType = 'setting-meta',
}) => {
    const [hasOpened, setHasOpened] = useState(opened.click);
    const [expandedGroups, setExpandedGroups] = useState(DEFAULT_EXPANDED_GROUPS);
    
    const fieldRenderers = useMemo(() => createFieldRenderers(), []);
    const FieldRenderer = useMemo(
        () => fieldRenderers[formField?.type || 'default'] || fieldRenderers.default,
        [fieldRenderers, formField?.type]
    );
    
    useEffect(() => {
        setHasOpened(opened.click);
    }, [opened]);
    
    const toggleGroup = useCallback((groupName: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    }, []);
    
    const isBlockType = useMemo(() => 
        BLOCK_TYPES.has(formField?.type || ''), 
        [formField?.type]
    );
    
    const handleLabelChange = useCallback((value: string) => {
        onChange('label', value);
    }, [onChange]);
    
    const handleNameChange = useCallback((value: string) => {
        if (metaType === 'setting-meta') {
            onChange('name', value);
        } else {
            onChange('label', value);
        }
    }, [metaType, onChange]);
    
    const handlePlaceholderChange = useCallback((value: string) => {
        onChange('placeholder', value);
    }, [onChange]);
    
    const handleDisabledChange = useCallback((disabled: boolean) => {
        onChange('disabled', disabled);
    }, [onChange]);
    
    const handleRequiredChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange('required', e.target.checked);
    }, [onChange]);
    
    const handleValueChange = useCallback((value: string) => {
        onChange('value', value);
    }, [onChange]);
    
    if (!hasOpened || !formField) return null;
    
    return (
        <main className="meta-setting-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="settings-title">
                {formField.type 
                    ? `${formField.type.charAt(0).toUpperCase() + formField.type.slice(1)} field settings`
                    : 'Input field settings'}
            </div>
            
            {/* Always show label */}
            <InputField label="Field label" value={formField.label || ''} onChange={handleLabelChange} />
            
            {formField.readonly ? (
                // Readonly mode
                <>
                    <InputField label="Placeholder" value={formField.placeholder || ''} onChange={handlePlaceholderChange} />
                    <VisibilityToggle disabled={formField.disabled} onChange={handleDisabledChange} />
                </>
            ) : (
                // Edit mode
                <>
                    {metaType === 'setting-meta' ? (
                        <FormFieldSelect
                            inputTypeList={inputTypeList}
                            formField={formField}
                            onTypeChange={(type) => onTypeChange?.(type)}
                        />
                    ) : (
                        <InputField label="Value" value={option?.value || ''} onChange={handleValueChange} />
                    )}
                    
                    <InputField
                        label={metaType === 'setting-meta' ? 'Name' : 'Label'}
                        value={metaType === 'setting-meta' ? formField.name || '' : option?.label || ''}
                        readonly={metaType === 'setting-meta' && formField.readonly}
                        onChange={handleNameChange}
                    />
                    
                    {metaType === 'setting-meta' && formField.type && (
                        <FieldRenderer
                            formField={formField}
                            onChange={onChange}
                            expandedGroups={expandedGroups}
                            toggleGroup={toggleGroup}
                        />
                    )}
                    
                    {metaType === 'setting-meta' && !isBlockType && (
                        <>
                            <VisibilityToggle disabled={formField.disabled} onChange={handleDisabledChange} />
                            <FieldWrapper label="Required">
                                <div className="input-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={formField.required || false}
                                        onChange={handleRequiredChange}
                                    />
                                </div>
                            </FieldWrapper>
                        </>
                    )}
                </>
            )}
        </main>
    );
};

export default SettingMetaBox;