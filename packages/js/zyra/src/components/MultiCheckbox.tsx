import React, { useState } from 'react';
import { FieldComponent, ZyraVariable } from './fieldUtils';

// Types
interface Option {
    key?: string;
    value: string;
    label?: string;
    name?: string;
    proSetting?: boolean;
    moduleEnabled?: string;
    desc?: string;
    edit?: boolean;
    dependent?: string;
}

interface FieldContext {
    rowKey?: string;
}

interface MultiCheckBoxProps {
    wrapperClass?: string;
    selectDeselect?: boolean;
    addNewBtn?: string;
    selectDeselectValue?: string;
    onMultiSelectDeselectChange?: (values: string[]) => void;
    options: Option[];
    value?: string[];
    rightContent?: boolean;
    inputInnerWrapperClass?: string;
    tour?: string;
    inputClass?: string;
    type?: 'checkbox' | 'radio';
    onChange: (val: string[]) => void;
    onOptionsChange?: (options: Option[]) => void;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
    modules: string[];
    field?: FieldContext;
}

function isBlocked(
    opt: Option,
    modules: string[],
    onBlocked?: MultiCheckBoxProps['onBlocked']
): boolean {
    if (opt.proSetting && !ZyraVariable?.khali_dabba) {
        onBlocked?.('pro');
        return true;
    }
    if (opt.moduleEnabled && !modules.includes(opt.moduleEnabled)) {
        onBlocked?.('module', opt.moduleEnabled);
        return true;
    }
    return false;
}

function formatModuleLabel(moduleKey: string): string {
    return moduleKey
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

interface EditRowProps {
    value: string;
    onChange: (v: string) => void;
    onSave: () => void;
}

const EditRow: React.FC<EditRowProps> = ({ value, onChange, onSave }) => (
    <div className="edit-option-wrapper">
        <div className="edit-option">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        onSave();
                    }
                }}
                className="basic-input"
                autoFocus
            />
            <div className="edit-icon">
                <span
                    className="admin-badge green border adminfont-check"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave();
                    }}
                />
            </div>
        </div>
    </div>
);

export const MultiCheckBoxUI: React.FC<MultiCheckBoxProps> = (props) => {
    const {
        options,
        value = [],
        modules,
        onBlocked,
        onChange,
        onOptionsChange,
        field,
    } = props;

    const [showNewInput, setShowNewInput] = useState(false);
    const [newOptionValue, setNewOptionValue] = useState('');
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const allSelected = value.length === options.length;

    const turnOffSiblings = (
        selected: string[],
        options: Option[],
        parent: string
    ): string[] => {
        let updated = [...selected];

        const children = options.filter((opt) => opt.dependent === parent);

        children.forEach((child) => {
            updated = updated.filter((v) => v !== child.value);
            updated = turnOffSiblings(updated, options, child.value);
        });

        return updated;
    };

    const turnOnSiblings = (
        selected: string[],
        options: Option[],
        childValue: string
    ): string[] => {
        let updated = [...selected];

        const option = options.find((opt) => opt.value === childValue);

        if (option?.dependent) {
            if (!updated.includes(option.dependent)) {
                updated.push(option.dependent);
            }
            updated = turnOnParents(updated, options, option.dependent);
        }

        return updated;
    };

    const toggle = (val: string) => {
        let updated: string[];

        if (value.includes(val)) {
            // turning OFF.
            updated = value.filter((v) => v !== val);
            updated = turnOffSiblings(updated, options, val);
        } else {
            // turning ON.
            updated = [...value, val];
            updated = turnOnSiblings(updated, options, val);
        }

        onChange(updated);
    };

    const handleSelectDeselect = () => {
        const blocked = options.some((opt) =>
            isBlocked(opt, modules, onBlocked)
        );
        if (blocked) {
            return;
        }
        props.onMultiSelectDeselectChange?.(
            allSelected ? [] : options.map((o) => o.value)
        );
    };

    const handleSaveNewOption = () => {
        const trimmed = newOptionValue.trim();
        if (!trimmed) {
            return;
        }

        const slug = trimmed.toLowerCase().replace(/\s+/g, '_');
        const newOption: Option = {
            key: slug,
            value: slug,
            label: trimmed,
            edit: true,
        };

        onOptionsChange?.([...options, newOption]);
        setNewOptionValue('');
        setShowNewInput(false);
    };

    const handleSaveEdit = (index: number) => {
        const trimmed = editValue.trim();
        if (!trimmed) {
            return;
        }

        const updated = options.map((opt, i) =>
            i === index ? { ...opt, label: trimmed } : opt
        );
        onOptionsChange?.(updated);
        setEditIndex(null);
        setEditValue('');
    };

    const handleDelete = (index: number) => {
        const opt = options[index];
        if (isBlocked(opt, modules, onBlocked)) {
            return;
        }

        const updated = options.filter((_, i) => i !== index);
        onOptionsChange?.(updated);
        // Remove deleted option's value from selection
        onChange(value.filter((v) => v !== opt.value));
    };

    const inputType = props.type === 'radio' ? 'radio' : 'checkbox';

    return (
        <>
            {!options || options.length === 0 ? (
                <input
                    type="checkbox"
                    checked={value.includes(field.rowKey)}
                    onChange={(e) => {
                        if (!isBlocked(field, modules, onBlocked)) {
                            onChange(e.target.checked);
                        }
                    }}
                />
            ) : (
                <div className={props.wrapperClass}>
                    {props.selectDeselect && (
                        <div className="checkbox-list-header">
                            <div className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={handleSelectDeselect}
                                    className={
                                        !allSelected && value.length > 0
                                            ? 'minus-icon'
                                            : ''
                                    }
                                />
                                <span>{value.length} items</span>
                            </div>
                        </div>
                    )}

                    {/* Option rows */}
                    {options.map((option, index) => {
                        const checked = value.includes(option.value);
                        const rowKey = option.key ?? index;
                        const inputId = `toggle-switch-${rowKey}`;
                        const isEditing = editIndex === index;

                        return (
                            <div
                                key={rowKey}
                                className="toggle-checkbox-header"
                            >
                                {props.rightContent && (
                                    <p
                                        className="settings-metabox-description"
                                        dangerouslySetInnerHTML={{
                                            __html: option.label ?? '',
                                        }}
                                    />
                                )}

                                <div
                                    className={props.inputInnerWrapperClass}
                                    data-tour={props.tour}
                                >
                                    {isEditing ? (
                                        <EditRow
                                            value={editValue}
                                            onChange={setEditValue}
                                            onSave={() => {
                                                if (
                                                    !isBlocked(
                                                        option,
                                                        modules,
                                                        onBlocked
                                                    )
                                                ) {
                                                    handleSaveEdit(index);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <input
                                                className={props.inputClass}
                                                id={inputId}
                                                type={inputType}
                                                name={
                                                    option.name ?? 'basic-input'
                                                }
                                                value={option.value}
                                                checked={checked}
                                                onChange={() => {
                                                    if (
                                                        !isBlocked(
                                                            option,
                                                            modules,
                                                            onBlocked
                                                        )
                                                    ) {
                                                        toggle(option.value);
                                                    }
                                                }}
                                            />

                                            <label
                                                className="checkbox-label"
                                                htmlFor={inputId}
                                            >
                                                {option.label}

                                                {/* Pro badge */}
                                                {option.proSetting &&
                                                    !ZyraVariable?.khali_dabba && (
                                                        <span className="admin-pro-tag">
                                                            <i className="adminfont-pro-tag" />{' '}
                                                            Pro
                                                        </span>
                                                    )}

                                                {/* Module-locked badge */}
                                                {!option.proSetting &&
                                                    option.moduleEnabled &&
                                                    !modules.includes(
                                                        option.moduleEnabled
                                                    ) && (
                                                        <span className="admin-pro-tag module">
                                                            <i
                                                                className={`adminfont-${option.moduleEnabled}`}
                                                            />
                                                            {formatModuleLabel(
                                                                option.moduleEnabled
                                                            )}
                                                            <i className="adminfont-lock" />
                                                        </span>
                                                    )}

                                                <div className="label-des">
                                                    {option.desc}
                                                </div>
                                            </label>

                                            {/* Edit / Delete controls */}
                                            {option.edit && (
                                                <div className="edit-icon">
                                                    <span
                                                        className="admin-badge blue border adminfont-edit"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditIndex(index);
                                                            setEditValue(
                                                                option.label ??
                                                                option.value
                                                            );
                                                        }}
                                                    />
                                                    <span
                                                        className="admin-badge red border adminfont-delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(index);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Add-new section */}
            {props.addNewBtn &&
                (showNewInput ? (
                    <div className="add-new-option">
                        <input
                            type="text"
                            value={newOptionValue}
                            onChange={(e) => setNewOptionValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveNewOption();
                                }
                            }}
                            placeholder="Enter new option"
                            className="basic-input"
                            autoFocus
                        />
                        <button
                            className="admin-btn btn-green"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSaveNewOption();
                            }}
                        >
                            <i className="adminfont-active" /> Save
                        </button>
                    </div>
                ) : (
                    <div className="add-new-option">
                        <div
                            className="admin-btn btn-purple"
                            onClick={() => setShowNewInput(true)}
                        >
                            <i className="adminfont-plus" /> {props.addNewBtn}
                        </div>
                    </div>
                ))}
        </>
    );
};

const MultiCheckBox: FieldComponent = {
    render: ({
        field,
        value,
        onChange,
        canAccess,
        modules,
        settings,
        onOptionsChange,
        onBlocked,
    }) => {
        // Normalize value to a clean string array
        const normalizedValue: string[] = Array.isArray(value)
            ? value.filter((v) => v?.trim())
            : typeof value === 'string' && value.trim()
                ? [value]
                : [];

        // Prefer live options from settings over static field definition
        const sourceOptions =
            settings?.[`${field.key}_options`] ?? field.options;
        const normalizedOptions: Option[] = Array.isArray(sourceOptions)
            ? sourceOptions.map((opt) => ({
                ...opt,
                value: String(opt.value),
                edit: opt.edit ?? !!field.addNewBtnText,
            }))
            : [];

        return (
            <MultiCheckBoxUI
                wrapperClass={
                    field.look === 'toggle'
                        ? 'toggle-btn'
                        : field.selectDeselect === true
                            ? 'checkbox-list-side-by-side'
                            : 'simple-checkbox'
                }
                inputInnerWrapperClass={
                    field.look === 'toggle'
                        ? 'toggle-checkbox'
                        : 'default-checkbox'
                }
                inputClass={field.class}
                tour={field.tour}
                selectDeselect={field.selectDeselect}
                selectDeselectValue="Select / Deselect All"
                rightContent={field.rightContent}
                addNewBtn={field.addNewBtnText}
                options={normalizedOptions}
                value={normalizedValue}
                modules={modules}
                field={field}
                onChange={(val) => {
                    if (canAccess) {
                        onChange(val);
                    }
                }}
                onOptionsChange={(opts) => {
                    if (canAccess) {
                        onOptionsChange?.(opts);
                    }
                }}
                onBlocked={onBlocked}
                onMultiSelectDeselectChange={(allValues) => {
                    if (canAccess) {
                        onChange(allValues);
                    }
                }}
            />
        );
    },

    validate: (field, value) => {
        if (field.required && (!value || value.length === 0)) {
            return `${field.label} is required`;
        }
        return null;
    },
};

export default MultiCheckBox;
