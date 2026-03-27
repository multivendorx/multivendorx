// External dependencies
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal dependencies
import StyleControls from './StyleControl';
import { BlockStyle } from './CanvasEditor/blockStyle';
import { BasicInputUI } from './BasicInput';
import { SelectInputUI } from './SelectInput';
import { MultiCheckBoxUI } from './MultiCheckbox';
import { ChoiceToggleUI } from './ChoiceToggle';
import { ButtonInputUI } from './ButtonInput';
import Card from './UI/Card';
import FormGroupWrapper from './UI/FormGroupWrapper';
import FormGroup from './UI/FormGroup';

// TYPES
type FormFieldValue =
    | string
    | number
    | boolean
    | Option[]
    | Record<string, string | number | boolean>;
type SettingFieldKey =
    | keyof FormField
    | 'value'
    | 'style'
    | 'layout'
    | 'text'
    | 'level'
    | 'src'
    | 'alt'
    | 'url'
    | 'html';

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
    style?: BlockStyle;
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
    { id: 'h4', value: 4, label: 'H4' },
    { id: 'h5', value: 5, label: 'H5' },
    { id: 'h6', value: 6, label: 'H6' },
];

// Blocks that have style controls
const STYLED_BLOCKS = new Set([
    'richtext',
    'heading',
    'image',
    'button',
    'divider',
    'columns',
]);

// Blocks that have text style controls
const TEXT_STYLED_BLOCKS = new Set(['richtext', 'heading', 'button']);

const InputField: React.FC<{
    label: string;
    type?: string;
    value: string | number;
    onChange: (value: string) => void;
    className?: string;
    readonly?: boolean;
    placeholder?: string;
}> = ({ label, value, onChange, readonly = false, placeholder }) => (
    <FormGroup label={label}>
        <BasicInputUI
            value={value || ''}
            onChange={(value) => onChange(value)}
            readOnly={readonly}
            placeholder={placeholder}
        />
    </FormGroup>
);

const FormFieldSelect: React.FC<{
    inputTypeList: InputType[];
    formField: FormField;
    onTypeChange: (value: string) => void;
}> = ({ inputTypeList, formField, onTypeChange }) => (
    <FormGroup label="Type">
        <SelectInputUI
            onChange={(value) => onTypeChange(value)}
            value={formField.type}
            options={inputTypeList}
        />
    </FormGroup>
);

const ContentGroup: React.FC<{
    title: string;
    children: React.ReactNode;
}> = ({ title, children }) => (
    <Card toggle defaultExpanded={false} title={title}>
        <FormGroupWrapper>{children}</FormGroupWrapper>
    </Card>
);

const VisibilityToggle: React.FC<{
    disabled?: boolean;
    onChange: (disabled: boolean) => void;
}> = ({ disabled = false, onChange }) => (
    <FormGroup label="Visibility">
        <ChoiceToggleUI
            options={[
                { key: 'visible', value: 'true', label: 'Visible' },
                { key: 'hidden', value: 'false', label: 'Hidden' },
            ]}
            value={disabled ? 'false' : 'true'} // sync UI with state
            onChange={(val) => onChange(val === 'false')} // convert properly
        />
    </FormGroup>
);

// OPTION EDITOR COMPONENT
const OptionEditor: React.FC<{
    options: Option[];
    onChange: (options: Option[]) => void;
}> = ({ options, onChange }) => {
    const addOption = useCallback(() => {
        onChange([
            ...options,
            { id: crypto.randomUUID(), label: 'Option value', value: 'value' },
        ]);
    }, [options, onChange]);

    const updateOption = useCallback(
        (index: number, updates: Partial<Option>) => {
            const newOptions = [...options];
            newOptions[index] = { ...newOptions[index], ...updates };
            onChange(newOptions);
        },
        [options, onChange]
    );

    const deleteOption = useCallback(
        (index: number) => {
            onChange(options.filter((_, i) => i !== index));
        },
        [options, onChange]
    );

    return (
        <div
            className="multioption-wrapper"
            onClick={(e) => e.stopPropagation()}
        >
            <label>Set option</label>
            <ReactSortable
                list={options}
                setList={onChange}
                handle=".drag-handle-option"
            >
                {options.map((opt, index) => (
                    <div
                        className="option-list-wrapper drag-handle-option"
                        key={opt.id || index}
                    >
                        <div className="option-icon admin-badge blue">
                            <i className="adminfont-drag" />
                        </div>
                        <div className="option-label">
                            <BasicInputUI
                                value={opt.label}
                                onChange={(value) =>
                                    updateOption(index, { label: value })
                                }
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
            <ButtonInputUI
                buttons={[
                    {
                        text: 'Add new',
                        icon: 'plus',
                        color: 'purple',
                        onClick: addOption,
                    },
                ]}
            />
        </div>
    );
};

const textFieldSettingsRenderer: React.FC<{
    formField: FormField;
    onChange: (key: SettingFieldKey, value: FormFieldValue) => void;
}> = ({ formField, onChange }) => (
    <>
        <InputField
            label="Placeholder"
            value={formField.placeholder || ''}
            onChange={(v) => onChange('placeholder', v)}
        />
        <InputField
            label="Character limit"
            type="number"
            value={formField.charlimit?.toString() || ''}
            onChange={(v) => onChange('charlimit', Number(v))}
        />
    </>
);

// FIELD RENDERER FACTORY
const createFieldRenderers = (): Record<
    string,
    React.FC<{
        formField: FormField;
        onChange: (key: SettingFieldKey, value: FormFieldValue) => void;
    }>
> => ({
    // Basic inputs
    text: textFieldSettingsRenderer,

    email: textFieldSettingsRenderer,

    textarea: ({ formField, onChange }) => (
        <>
            <InputField
                label="Placeholder"
                value={formField.placeholder || ''}
                onChange={(v) => onChange('placeholder', v)}
            />
            <InputField
                label="Character limit"
                type="number"
                value={formField.charlimit?.toString() || ''}
                onChange={(v) => onChange('charlimit', Number(v))}
            />
            <InputField
                label="Row"
                type="number"
                value={formField.row?.toString() || ''}
                onChange={(v) => onChange('row', Number(v))}
            />
            <InputField
                label="Column"
                type="number"
                value={formField.column?.toString() || ''}
                onChange={(v) => onChange('column', Number(v))}
            />
        </>
    ),

    // Content blocks
    richtext: ({ formField, onChange }) => (
        <>
            <ContentGroup title="Content">
                <FormGroup label="HTML Content">
                    <textarea
                        value={formField.html || ''}
                        onChange={(e) => onChange('html', e.target.value)}
                        className="basic-input"
                        placeholder="Enter HTML content"
                        rows={6}
                        style={{ fontFamily: 'monospace', width: '100%' }}
                    />
                </FormGroup>
            </ContentGroup>
        </>
    ),

    heading: ({ formField, onChange }) => (
        <ContentGroup title="Heading Content">
            <InputField
                label="Heading Text"
                value={formField.text || ''}
                onChange={(v) => onChange('text', v)}
                placeholder="Enter heading text"
            />
            <FormGroup label="Heading Level">
                <ChoiceToggleUI
                    options={HEADING_LEVELS}
                    value={formField.level || 2}
                    onChange={(val) =>
                        onChange('level', Number(val) as 1 | 2 | 3 | 4 | 5 | 6)
                    }
                />
            </FormGroup>
        </ContentGroup>
    ),

    image: ({ formField, onChange }) => (
        <>
            <ContentGroup title="Image">
                <InputField
                    label="Image URL"
                    value={formField.src || ''}
                    onChange={(v) => onChange('src', v)}
                />
                <InputField
                    label="Alt Text"
                    value={formField.alt || ''}
                    onChange={(v) => onChange('alt', v)}
                />
            </ContentGroup>
        </>
    ),

    button: ({ formField, onChange }) => (
        <>
            <ContentGroup title="Button Content">
                <InputField
                    label="Button Text"
                    value={formField.text || formField.placeholder || ''}
                    onChange={(v) => onChange('text', v)}
                />
                <InputField
                    label="Button URL"
                    value={formField.url || ''}
                    onChange={(v) => onChange('url', v)}
                />
            </ContentGroup>
        </>
    ),

    columns: ({ formField, onChange }) => (
        <>
            <ContentGroup title="Layout">
                <FormGroup label="Column Layout">
                    <select
                        value={formField.layout || '2-50'}
                        className="basic-input"
                        onChange={(e) => onChange('layout', e.target.value)}
                    >
                        {LAYOUT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </FormGroup>
            </ContentGroup>
        </>
    ),

    // Selection fields
    'multi-select': ({ formField, onChange }) => (
        <OptionEditor
            options={formField.options || []}
            onChange={(o) => {
                onChange('options', o);
            }}
        />
    ),
    dropdown: ({ formField, onChange }) => (
        <OptionEditor
            options={formField.options || []}
            onChange={(o) => onChange('options', o)}
        />
    ),
    checkboxes: ({ formField, onChange }) => (
        <OptionEditor
            options={formField.options || []}
            onChange={(o) => onChange('options', o)}
        />
    ),
    radio: ({ formField, onChange }) => (
        <OptionEditor
            options={formField.options || []}
            onChange={(o) => onChange('options', o)}
        />
    ),

    // Special fields
    recaptcha: ({ formField, onChange }) => {
        const [isValid, setIsValid] = useState(() =>
            RECAPTCHA_PATTERN.test(formField.sitekey || '')
        );

        const handleChange = useCallback(
            (value: string) => {
                onChange('sitekey', value);
                setIsValid(RECAPTCHA_PATTERN.test(value));
            },
            [onChange]
        );

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
                    <a
                        href="https://www.google.com/recaptcha"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        reCAPTCHA script
                    </a>
                    .
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

    const fieldRenderers = createFieldRenderers();
    const FieldRenderer =
        fieldRenderers[formField?.type || 'default'] || fieldRenderers.default;

    useEffect(() => {
        setHasOpened(opened.click);
    }, [opened]);

    const hasStyleControls = useMemo(
        () => STYLED_BLOCKS.has(formField?.type || ''),
        [formField?.type]
    );

    const hasTextStyles = useMemo(
        () => TEXT_STYLED_BLOCKS.has(formField?.type || ''),
        [formField?.type]
    );

    const handleLabelChange = (value: string) => {
        onChange('label', value);
    };

    const handleNameChange = (value: string) => {
        if (metaType === 'setting-meta') {
            onChange('name', value);
        } else {
            onChange('label', value);
        }
    };

    const handlePlaceholderChange = (value: string) => {
        onChange('placeholder', value);
    };

    const handleDisabledChange = useCallback(
        (disabled: boolean) => {
            onChange('disabled', disabled);
        },
        [onChange]
    );

    const handleRequiredChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange('required', e.target.checked);
        },
        [onChange]
    );

    const handleValueChange = useCallback(
        (value: string) => {
            onChange('value', value);
        },
        [onChange]
    );

    const handleStyleChange = useCallback(
        (style: BlockStyle) => {
            onChange('style', style);
        },
        [onChange]
    );

    if (!hasOpened || !formField) {
        return null;
    }

    return (
        <div className="setting-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-title">
                {formField.type
                    ? `${
                          formField.type.charAt(0).toUpperCase() +
                          formField.type.slice(1)
                      } settings`
                    : 'Input settings'}
            </div>
            <FormGroupWrapper>
                {/* Always show label */}
                <InputField
                    label="Field label"
                    value={formField.label || ''}
                    onChange={handleLabelChange}
                />

                {formField.readonly ? (
                    // Readonly mode
                    <>
                        <InputField
                            label="Placeholder"
                            value={formField.placeholder || ''}
                            onChange={handlePlaceholderChange}
                        />
                        <VisibilityToggle
                            disabled={formField.disabled}
                            onChange={handleDisabledChange}
                        />
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
                            <InputField
                                label="Value"
                                value={option?.value || ''}
                                onChange={handleValueChange}
                            />
                        )}

                        <InputField
                            label={metaType === 'setting-meta' ? 'Name' : 'Label'}
                            value={
                                metaType === 'setting-meta'
                                    ? formField.name || ''
                                    : option?.label || ''
                            }
                            readonly={
                                metaType === 'setting-meta' && formField.readonly
                            }
                            onChange={handleNameChange}
                        />

                        {metaType === 'setting-meta' && (
                            <>
                                {/* Block-specific content settings */}
                                {formField.type && (
                                    <FieldRenderer
                                        formField={formField}
                                        onChange={onChange}
                                    />
                                )}

                                {/* Centralized Style Controls for styled blocks */}
                                {hasStyleControls && (
                                    <StyleControls
                                        style={formField.style || {}}
                                        onChange={handleStyleChange}
                                        includeTextStyles={hasTextStyles}
                                    />
                                )}

                                {/* Visibility and Required for non-styled blocks */}
                                {!hasStyleControls && (
                                    <>
                                        <VisibilityToggle
                                            disabled={formField.disabled}
                                            onChange={handleDisabledChange}
                                        />
                                        <FormGroup label="Required">
                                            <div className="input-wrapper">
                                                <MultiCheckBoxUI
                                                    options={[
                                                        {
                                                            key: 'required',
                                                            value: 'required',
                                                            label: 'Required',
                                                        },
                                                    ]}
                                                    value={
                                                        formField.required
                                                            ? ['required']
                                                            : []
                                                    }
                                                    onChange={(vals) => {
                                                        const next =
                                                            vals.includes(
                                                                'required'
                                                            );

                                                        if (
                                                            next ===
                                                            formField.required
                                                        ) {
                                                            return; // prevent unnecessary update
                                                        }

                                                        handleRequiredChange({
                                                            target: {
                                                                checked: next,
                                                            },
                                                        } as React.ChangeEvent<HTMLInputElement>);
                                                    }}
                                                />
                                            </div>
                                        </FormGroup>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </FormGroupWrapper>
        </div>
    );
};

export default SettingMetaBox;
