// External dependencies
import React, { useState } from 'react';
import { FieldComponent } from './types';

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
    onChange: (val: any) => void;
    onOptionsChange?: (option: any) => void;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
    modules: string[];
    canAccess?: boolean;
    appLocalizer?: any;
}

export const MultiCheckBoxUI: React.FC<MultiCheckBoxProps> = (props) => {
    const [localOptions, setLocalOptions] = useState<Option[]>(
        props.options
    );
    const [showNewInput, setShowNewInput] = useState(false);
    const [newOptionValue, setNewOptionValue] = useState('');
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const allSelected = props.value?.length === localOptions.length;
    const selectedCount = props.value?.length ?? 0;

    const block = (opt: Option) => {
        if (opt.proSetting && !props.appLocalizer.khali_dabba) {
            props.onBlocked?.('pro');
            return true;
        }

        if (
            opt.moduleEnabled &&
            !props.modules.includes(opt.moduleEnabled)
        ) {
            props.onBlocked?.('module', opt.moduleEnabled);
            return true;
        }

        return false;
    };

    const toggle = (val: string) => {
        const current = props.value ?? [];

        const updated = current.includes(val)
            ? current.filter(v => v !== val)
            : [...current, val];

        props.onChange(updated);
    };

    const getSelectedValues = (options: Option[]) =>
        options
            .filter(opt => opt.checked !== false)
            .map(opt => opt.value);

    const handleAddNewClick = () => {
        setShowNewInput(true);
    };

    const handleSaveNewOption = () => {
        if (!newOptionValue.trim()) {
            return;
        }

        const value = newOptionValue
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
        const newOption: Option = {
            key: value,
            value: value,
            label: newOptionValue.trim(),
            edit: true,
        };

        const updatedOptions = [...localOptions, newOption];
        props.onOptionsChange?.(updatedOptions);

        setLocalOptions(updatedOptions);
        setNewOptionValue('');
        setShowNewInput(false);

        const selectedValues = getSelectedValues(updatedOptions);
        props.onChange?.(selectedValues);
    };

    const saveEditedOption = (index: number) => {
        if (!editValue.trim()) {
            return;
        }

        const updatedOptions = [...localOptions];
        updatedOptions[index] = {
            ...updatedOptions[index],
            label: editValue.trim(),
        };

        setLocalOptions(updatedOptions);
        setEditIndex(null);
        setEditValue('');

        props.onOptionsChange?.(updatedOptions);
    };

    const deleteOption = (index: number) => {
        const option = localOptions[index];

       if (block(option)) return;

        const updatedOptions = localOptions.filter((_, i) => i !== index);
        setLocalOptions(updatedOptions);

        const selectedValues = getSelectedValues(updatedOptions);
        props.onChange?.(selectedValues);

        props.onOptionsChange?.(updatedOptions);
    };

    return (
        <>
            <div className={props.wrapperClass}>
                {props.selectDeselect && (
                    <div className="checkbox-list-header">
                        <div className="checkbox">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => {
                                    const blocked = localOptions.some(opt => block(opt));
                                    if (blocked) return;

                                    const allValues = allSelected ? []
                                        : localOptions.map(opt => opt.value);

                                    props.onMultiSelectDeselectChange?.(allValues);
                                }}
                                className={
                                    !allSelected && selectedCount > 0
                                        ? 'minus-icon'
                                        : ''
                                }
                            />
                            <span>{selectedCount} items</span>
                        </div>
                    </div>
                )}

                {localOptions.map((option, index) => {
                    const checked =
                        props.value?.includes(option.value) ?? false;

                    return (
                        <>
                            <div
                                key={option.key}
                                className="toggle-checkbox-header"
                            >
                                {props.rightContent && (
                                    <p
                                        className="settings-metabox-description"
                                        dangerouslySetInnerHTML={{ __html: option.label ?? '' }}
                                    ></p>
                                )}

                                <div
                                    className={props.inputInnerWrapperClass}
                                    data-tour={props.tour}
                                >
                                    <input
                                        className={props.inputClass}
                                        id={`toggle-switch-${option.key}`}
                                        type={props.type?.split('-')[0] ||'checkbox'}
                                        name={option.name || 'basic-input'}
                                        value={option.value}
                                        checked={checked}
                                        onChange={() => {
                                            if (block(option)) return;
                                            toggle(option.value);
                                        }}
                                    />

                                    {editIndex === index ? (
                                        <div className="edit-option-wrapper">
                                            <div className="edit-option">
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) =>
                                                        setEditValue(e.target.value)
                                                    }
                                                    onKeyDown={(e) => {
                                                        if ( e.key === 'Enter' ) {
                                                            e.preventDefault();
                                                            saveEditedOption(index);
                                                        }
                                                    }}
                                                    className="basic-input"
                                                />
                                                <div className="edit-icon">
                                                    <span
                                                        className="admin-badge green border adminfont-check"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (block(localOptions[index])) return;
                                                            saveEditedOption(index);
                                                        }}
                                                    ></span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <label
                                                className="checkbox-label"
                                                htmlFor={`toggle-switch-${option.key}`}
                                            >
                                                {option.label}
                                                {option.proSetting &&
                                                    !props.appLocalizer.khali_dabba && (
                                                        <span className="admin-pro-tag">
                                                            <i className="adminfont-pro-tag"></i>
                                                            Pro
                                                        </span>
                                                    )}
                                                {(!option.proSetting) && option.moduleEnabled &&
                                                    !props.modules.includes(option.moduleEnabled) && (
                                                        <span className="admin-pro-tag module">
                                                            <i
                                                                className={`adminfont-${option.moduleEnabled}`}
                                                            ></i>
                                                            {String(option.moduleEnabled)
                                                                .split('-')
                                                                .map((word: string) =>
                                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                                ).join(' ')}
                                                            <i className="adminfont-lock"></i>
                                                        </span>
                                                    )}
                                                <div className="label-des">
                                                    {option.desc}
                                                </div>
                                            </label>
                                            {option.edit && (
                                                <div className="edit-icon">
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditIndex( index );
                                                            setEditValue( option.label || option.value );
                                                        }}
                                                        className="admin-badge blue border adminfont-edit"
                                                    ></span>
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteOption( index );
                                                        }}
                                                        className="admin-badge red border adminfont-delete"
                                                    ></span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    );
                })}
            </div>

            { /* Add New Section */}
            {props.addNewBtn &&
                (showNewInput ? (
                    <div className="add-new-option">
                        <input
                            type="text"
                            value={newOptionValue}
                            onChange={(e) =>
                                setNewOptionValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveNewOption();
                                }
                            }}
                            placeholder="Enter new option"
                            className="basic-input"
                        />
                        <button
                            className="admin-btn btn-green"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSaveNewOption();
                            }}
                        >
                            <i className="adminfont-active"></i> Save
                        </button>
                    </div>
                ) : (
                    <div className="add-new-option">
                        <div
                            className="admin-btn btn-purple"
                            onClick={handleAddNewClick}
                        >
                            <i className="adminfont-plus"></i>{' '}
                            {props.addNewBtn}
                        </div>
                    </div>
                ))}
        </>
    );
};

const MultiCheckBox: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer, modules, settings, onOptionsChange, onBlocked }) => {
        let normalizedValue: string[] = [];

        if (Array.isArray(value)) {
            normalizedValue = value.filter(
                (v) => v && v.trim() !== ''
            );
        } else if (typeof value === 'string' && value.trim() !== '') {
            normalizedValue = [value];
        }

        const normalizedOptions = Array.isArray(
            settings?.[`${field.key}_options`]
        )
            ? settings[`${field.key}_options`].map((opt) => ({
                  ...opt,
                  value: String(opt.value),
              }))
            : Array.isArray(field.options)
            ? field.options.map((opt) => ({
                  ...opt,
                  value: String(opt.value),
              }))
            : [];

        return (
            <MultiCheckBoxUI
                wrapperClass={field.look === 'toggle' ? 'toggle-btn' : field.selectDeselect === true ? 'checkbox-list-side-by-side' : 'simple-checkbox' }
                inputInnerWrapperClass={ field.look === 'toggle' ? 'toggle-checkbox' : 'default-checkbox'}
                inputClass={field.class}
                tour={field.tour}
                selectDeselect={field.selectDeselect}
                selectDeselectValue="Select / Deselect All"
                rightContent={field.rightContent}
                addNewBtn={field.addNewBtnText}
                options={normalizedOptions}
                value={normalizedValue}
                canAccess={canAccess}
                appLocalizer={appLocalizer}
                modules={modules}
                onChange={(val) => {
                    if (!canAccess) return;
                    onChange(val); 
                }}
                onOptionsChange={(opts) => {
                    if (!canAccess) return;
                    onOptionsChange?.(opts);
                }}
                onBlocked={onBlocked}
                onMultiSelectDeselectChange={(allValues) => {
                    if (!canAccess) return;
                    onChange(allValues);
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