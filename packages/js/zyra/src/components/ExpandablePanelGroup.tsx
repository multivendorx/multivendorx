import React, { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import '../styles/web/ExpandablePanelGroup.scss';
import { getApiLink } from '../utils/apiService';
import axios from 'axios';
import { FieldComponent } from './types';
import { FIELD_REGISTRY } from './FieldRegistry';
import FormGroup from './UI/FormGroup';
import { AdminButtonUI } from './AdminButton';
import FormGroupWrapper from './UI/FormGroupWrapper';

interface AppLocalizer {
    khali_dabba?: boolean;
    site_url?: string;
}

interface FieldOption {
    value: string | number;
    label: string;
    desc?: string;
    check?: boolean;
    action?: string;
    url?: string;
    redirect?: string;
}

interface PanelFormField {
    key: string;
    type:
    | 'text'
    | 'checkbox'
    | 'setting-toggle'
    | 'clickable-list'
    | 'blocktext'
    | 'multi-select'
    | 'button'
    | 'nested';

    label: string;
    placeholder?: string;
    des?: string;
    class?: string;
    desc?: string;
    rowNumber?: number;
    colNumber?: number;
    options?: FieldOption[];
    modal?: ExpandablePanelMethod[];
    look?: string;
    selectDeselect?: boolean;
    rightContent?: string;
    proSetting?: boolean;
    moduleEnabled?: string;
    dependentSetting?: string;
    dependentPlugin?: string;
    title?: string;
    link?: string;
    check?: boolean;
    hideCheckbox?: boolean;
    edit?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
    beforeElement?: string | ReactNode;
}

interface ExpandablePanelMethod {
    icon: string;
    id: string;
    label: string;
    connected: boolean;
    disableBtn?: boolean; // for enabled and disable show with settings btn
    hideDeleteBtn?: boolean; // hide delete btn and show error text
    countBtn?: boolean;
    desc: string;
    formFields?: PanelFormField[];
    wrapperClass?: string;
    openForm?: boolean;
    single?: boolean;
    rowClass?: string;
    edit?: boolean;
    isCustom?: boolean; // for show edit and delete btn
    required?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
}

interface AddNewTemplate {
    icon?: string;
    label?: string;
    desc?: string;
    formFields?: PanelFormField[];
    disableBtn?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
    editableFields?: {
        title?: boolean;
        description?: boolean;
        icon?: boolean;
    };
}

interface ExpandablePanelGroupProps {
    name: string;
    apilink?: string;
    appLocalizer?: AppLocalizer;
    methods: ExpandablePanelMethod[];
    value: Record<string, Record<string, unknown>>;
    onChange: (data: Record<string, Record<string, unknown>>) => void;
    isWizardMode?: boolean;
    canAccess: boolean;
    addNewBtn?: boolean;
    addNewTemplate?: AddNewTemplate;
    min?: number;
}

/** Fields that count toward wizard progress (excludes UI-only types). */
const isCountableField = (f: PanelFormField) =>
    f.type !== 'button' && f.type !== 'blocktext';

/**
 * Merge template formFields into a method without overwriting existing keys.
 * Used both in the initial state and in the value-sync effect.
 */
const mergeTemplateFormFields = (
    method: ExpandablePanelMethod,
    templateFields: PanelFormField[]
): ExpandablePanelMethod => {
    const methodFields = method.formFields ?? [];
    const existingKeys = new Set(methodFields.map((f) => f.key));
    return {
        ...method,
        formFields: [
            ...methodFields,
            ...templateFields.filter((f) => !existingKeys.has(f.key)),
        ],
    };
};

// Component
export const ExpandablePanelGroupUI: React.FC<ExpandablePanelGroupProps> = ({
    methods,
    value,
    onChange,
    appLocalizer,
    apilink,
    isWizardMode = false,
    canAccess,
    addNewBtn,
    addNewTemplate,
    min,
}) => {
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const [wizardIndex, setWizardIndex] = useState(0);
    const [fieldProgress, setFieldProgress] = useState(methods.map(() => 0));
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [iconDropdownOpen, setIconDropdownOpen] = useState<string | null>(null);

    // Inline-editing state
    const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDescription, setTempDescription] = useState('');

    const wrapperRef = useRef<HTMLDivElement>(null);
    const iconPickerRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const descTextareaRef = useRef<HTMLTextAreaElement>(null);

    const templateFields = addNewTemplate?.formFields ?? [];

    const [ExpandablePanelMethods, setExpandablePanelMethods] = useState<ExpandablePanelMethod[]>(
        () =>
            methods.map((method) =>
                method.isCustom ? mergeTemplateFormFields(method, templateFields) : method
            )
    );

    // Helpers
    const isFilled = (val: any): boolean => {
        if (val === undefined || val === null) return false;
        if (typeof val === 'string') return val.trim() !== '';
        if (Array.isArray(val)) return val.length > 0;
        return true; // number | boolean
    };

    /**
     * Whether a given header field (title / description / icon) is inline-editable.
     * Only custom items are editable; respects the optional editableFields config.
     */
    const getIsEditable = (
        method: ExpandablePanelMethod,
        field: 'title' | 'description' | 'icon'
    ): boolean => {
        if (!method.isCustom) return false;
        if (!addNewTemplate?.editableFields) return field !== 'icon';
        const fieldConfig = addNewTemplate.editableFields[field];
        if (fieldConfig === false) return false;
        return field !== 'icon';
    };

    // Effects 
    // Focus the correct input whenever inline editing begins
    useEffect(() => {
        if (editingMethodId && editingField === 'title') {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
        }
        if (editingMethodId && editingField === 'description') {
            descTextareaRef.current?.focus();
            descTextareaRef.current?.select();
        }
    }, [editingMethodId, editingField]);

    // Close inline edit on outside click or Escape / Ctrl+Enter
    useEffect(() => {
        const handleClickOutsideEdit = (event: MouseEvent) => {
            if (editingMethodId && editingField) {
                const isTitleInput = titleInputRef.current?.contains(event.target as Node);
                const isDescTextarea = descTextareaRef.current?.contains(event.target as Node);
                if (!isTitleInput && !isDescTextarea) saveEdit();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!editingMethodId || !editingField) return;
            if (event.key === 'Escape') cancelEdit();
            if (event.key === 'Enter' && event.ctrlKey) saveEdit();
        };

        document.addEventListener('mousedown', handleClickOutsideEdit);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideEdit);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editingMethodId, editingField, tempTitle, tempDescription]);

    // Close the right-section dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Close the icon picker on outside click or Escape
    useEffect(() => {
        if (!iconDropdownOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
                setIconDropdownOpen(null);
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIconDropdownOpen(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [iconDropdownOpen]);

    // Recalculate wizard field progress when value changes
    useEffect(() => {
        if (!isWizardMode && !methods?.length) return;

        const initialProgress = methods.map((method) => {
            const countableFields = method.formFields?.filter(isCountableField) || [];
            return countableFields.filter((field) => isFilled(value?.[method.id]?.[field.key])).length;
        });

        setFieldProgress(initialProgress);
    }, [methods, value, isWizardMode]);

    // Sync ExpandablePanelMethods whenever the persisted value or template changes
    useEffect(() => {
        const valueMethods: ExpandablePanelMethod[] = Object.entries(value).map(
            ([id, method]) => ({ id, ...(method as any) })
        );

        setExpandablePanelMethods((prev) => {
            const methodMap = new Map<string, ExpandablePanelMethod>();

            // Seed with current in-memory state
            prev.forEach((method) => methodMap.set(method.id, method));

            // Merge persisted value on top, restoring config-only props that are
            // never saved to the backend (disableBtn, iconEnable, iconOptions)
            valueMethods.forEach((method) => {
                const existingMethod = methodMap.get(method.id);
                methodMap.set(method.id, {
                    ...existingMethod,
                    ...method,
                    // Preserve disableBtn from original method or template
                    disableBtn: method.disableBtn ?? existingMethod?.disableBtn ?? false,
                    // iconEnable / iconOptions are not persisted to backend value,
                    // so after a refresh they must be restored from the template config
                    iconEnable: method.iconEnable ?? existingMethod?.iconEnable ?? (method.isCustom ? addNewTemplate?.iconEnable : undefined),
                    iconOptions: method.iconOptions ?? existingMethod?.iconOptions ?? (method.isCustom ? addNewTemplate?.iconOptions : undefined),
                });
            });

            // Merge template formFields into every custom method
            return Array.from(methodMap.values()).map((method) =>
                method.isCustom ? mergeTemplateFormFields(method, templateFields) : method
            );
        });
    }, [value, addNewTemplate]);

    // ── Inline-editing functions ──────────────────────────────────────────────

    const startEditing = (methodId: string, field: 'title' | 'description') => {
        const method = ExpandablePanelMethods.find((m) => m.id === methodId);
        if (!method?.isCustom) return;

        const methodValue = value[methodId] || {};
        setEditingMethodId(methodId);
        setEditingField(field);

        if (field === 'title') {
            setTempTitle((methodValue.title as string) || method.label || '');
        } else {
            setTempDescription((methodValue.description as string) || method.desc || '');
        }
    };

    const saveEdit = () => {
        if (editingMethodId && editingField) {
            if (editingField === 'title' && tempTitle.trim() !== '') {
                handleInputChange(editingMethodId, 'title', tempTitle.trim());
            } else if (editingField === 'description') {
                handleInputChange(editingMethodId, 'description', tempDescription);
            }
        }
        cancelEdit();
    };

    const cancelEdit = () => {
        setEditingMethodId(null);
        setEditingField(null);
        setTempTitle('');
        setTempDescription('');
    };

    // ── CRUD functions ────────────────────────────────────────────────────────

    const createNewExpandablePanelMethod = (): ExpandablePanelMethod => {
        if (!addNewTemplate) {
            throw new Error('addNewTemplate is required when addNewBtn is true');
        }

        const id =
            addNewTemplate.label.trim().toLowerCase().replace(/\s+/g, '_') +
            Math.floor(Math.random() * 10000);

        return {
            id,
            icon: addNewTemplate.icon || '',
            label: addNewTemplate.label || 'New Item',
            desc: addNewTemplate.desc || '',
            iconEnable: addNewTemplate.iconEnable || '',
            iconOptions: addNewTemplate.iconOptions || [],
            connected: false,
            isCustom: true,
            disableBtn: addNewTemplate.disableBtn || false,
            formFields: addNewTemplate.formFields
                ? addNewTemplate.formFields.map((field) => ({ ...field }))
                : [],
        };
    };

    const handleAddNewMethod = () => {
        if(!canAccess) { return;}
        const newMethod = createNewExpandablePanelMethod();
        setExpandablePanelMethods((prev) => [...prev, newMethod]);

        const initialValues: Record<string, unknown> = {
            isCustom: true,
            label: newMethod.label,
            desc: newMethod.desc,
            required: newMethod.required ?? false,
            title: newMethod.label,
            description: newMethod.desc,
        };

        if (newMethod.disableBtn) {
            initialValues.enable = false; // Default to disabled when disableBtn is true
            initialValues.disableBtn = true;
        }

        // Always include icon if it's in the template
        if (addNewTemplate?.icon) {
            initialValues.icon = addNewTemplate.icon;
        }

        // Handle additional form fields
        newMethod.formFields?.forEach((field) => {
            initialValues[field.key] = '';
        });

        onChange({ ...value, [newMethod.id]: initialValues });
        setActiveTabs((prev) => [...prev, newMethod.id]);
    };

    const handleDeleteMethod = (methodId: string) => {
        if (min !== undefined) {
            const customMethods = ExpandablePanelMethods.filter((m) => m.isCustom);
            if (customMethods.length <= min) return;
        }

        setExpandablePanelMethods((prev) => prev.filter((m) => m.id !== methodId));

        const updatedValue = { ...value };
        delete updatedValue[methodId];
        onChange(updatedValue);

        setActiveTabs((prev) => prev.filter((id) => id !== methodId));
    };

    const canDeleteMethod = (methodId: string): boolean => {
        if (min === undefined) return true;
        return ExpandablePanelMethods.filter((m) => m.isCustom).length > min;
    };

    // ── Core update function ──────────────────────────────────────────────────

    const handleInputChange = (
        methodKey: string,
        fieldKey: string,
        fieldValue: string | string[] | number | boolean | undefined
    ) => {
        if (fieldKey === 'wizardButtons') return;

        const updated = {
            ...value,
            [methodKey]: {
                ...(value[methodKey] as Record<string, unknown>),
                [fieldKey]: fieldValue,
            },
        };

        if (isWizardMode) {
            const prevValue = value?.[methodKey]?.[fieldKey];
            const wasFilled = isFilled(prevValue);
            const nowFilled = isFilled(fieldValue);

            // Only update progress if fill-state changed
            if (wasFilled !== nowFilled) {
                const methodIndex = methods.findIndex((m) => m.id === methodKey);

                if (methodIndex !== -1) {
                    setFieldProgress((prev) => {
                        const updatedProgress = [...prev];
                        const maxFields =
                            methods[methodIndex]?.formFields?.filter(isCountableField).length || 0;

                        updatedProgress[methodIndex] += nowFilled ? 1 : -1;

                        // Clamp value safely
                        if (updatedProgress[methodIndex] < 0) updatedProgress[methodIndex] = 0;
                        if (updatedProgress[methodIndex] > maxFields) updatedProgress[methodIndex] = maxFields;

                        return updatedProgress;
                    });
                }
            }
        }

        onChange(updated);
    };

    // Toggle helpers

    const toggleEnable = (methodId: string, enable: boolean) => {
        handleInputChange(methodId, 'enable', enable);
        if (enable) {
            setActiveTabs((prev) => prev.filter((id) => id !== methodId));
        }
    };

    const toggleActiveTab = (methodId: string) => {
        if (isWizardMode) {
            // In wizard mode, only allow one active tab at a time
            setActiveTabs([methodId]);
        } else {
            // In normal mode, toggle as before
            setActiveTabs((prev) => (prev[0] === methodId ? [] : [methodId]));
        }
    };

    const enableMethod = useCallback(
        (id: string) => toggleEnable(id, true),
        [toggleEnable]
    );

    const disableMethod = useCallback(
        (id: string) => toggleEnable(id, false),
        [toggleEnable]
    );

    const setTabActive = useCallback(
        (id: string) => toggleActiveTab(id),
        [toggleActiveTab]
    );

    // ── Wizard helpers ────────────────────────────────────────────────────────

    const handleSaveSetupWizard = () => {
        axios({
            url: getApiLink(appLocalizer, apilink),
            method: 'POST',
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { setupWizard: true, value },
        }).then((res) => {
            console.log(res);
        });
    };

    const renderWizardButtons = () => {
        const step = ExpandablePanelMethods[wizardIndex];
        const buttonField = step?.formFields?.find((f) => f.key === 'wizardButtons');
        if (!buttonField) return null;
        return renderField(step.id, buttonField);
    };

    // ── Dependent-field helpers ───────────────────────────────────────────────

    const isContain = (
        key: string,
        methodId: string,
        valuee: string | number | boolean | null = null
    ): boolean => {
        const settingValue = value[methodId]?.[key];

        if (Array.isArray(settingValue)) {
            if (valuee === null) return settingValue.length > 0;
            return settingValue.includes(valuee);
        }

        if (valuee === null) return Boolean(settingValue);
        return settingValue === valuee;
    };

    const shouldRender = (dependent: any, methodId: string): boolean => {
        if (dependent.set === true && !isContain(dependent.key, methodId)) return false;
        if (dependent.set === false && isContain(dependent.key, methodId)) return false;
        if (dependent.value !== undefined && !isContain(dependent.key, methodId, dependent.value)) return false;
        return true;
    };

    // ── Price display helper ──────────────────────────────────────────────────

    const getPriceFieldValue = (methodId: string) => {
        const methodValue = value[methodId] || {};
        const price = methodValue.price;
        const unit = methodValue.unit;

        if (price === undefined || price === null || price === '') return null;

        const priceDisplay = typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`;

        return { price: priceDisplay, unit: unit ? `${unit}` : '' };
    };

    // Field renderer

    const renderField = (methodId: string, field: PanelFormField): JSX.Element | null => {
        const fieldComponent = FIELD_REGISTRY[field.type];
        if (!fieldComponent) return null;

        const Render = fieldComponent.render;
        const fieldValue = value[methodId]?.[field.key];
        const handleInternalChange = (val: any) => handleInputChange(methodId, field.key, val);

        if (field.type === 'button' && isWizardMode && Array.isArray(field.options)) {
            const wizardSteps = methods.map((m, i) => ({ ...m, index: i })).filter((m) => m.isWizardMode);
            const isLastMethod = wizardIndex === wizardSteps.length - 1;
            const isFirstMethod = wizardIndex === 0;

            const resolvedButtons = field.options.map((btn) => {
                if (btn.action === 'back') {
                    return {
                        ...btn,
                        text: btn.label,
                        color: 'red',
                        onClick: () => {
                            if (isFirstMethod) return;
                            const prev = wizardSteps[wizardIndex - 1];
                            setWizardIndex(prev.index);
                            setActiveTabs([prev.id]);
                        },
                    };
                }

                if (btn.action === 'next') {
                    return {
                        ...btn,
                        text: btn.label,
                        color: 'purple',
                        onClick: () => {
                            handleSaveSetupWizard();
                            if (!isLastMethod) {
                                const next = wizardSteps[wizardIndex + 1];
                                setWizardIndex(next.index);
                                setActiveTabs([next.id]);
                                return;
                            }
                            if (btn.redirect) window.open(btn.redirect, '_self');
                        },
                    };
                }

                if (btn.action === 'skip') {
                    return {
                        ...btn,
                        text: btn.label,
                        color: 'blue',
                        onClick: () => {
                            setWizardIndex(methods.length);
                            window.open(appLocalizer.site_url, '_self');
                        },
                    };
                }

                return btn;
            });

            return (
                <Render
                    field={{ ...field, options: resolvedButtons }}
                    value={fieldValue}
                    onChange={handleInternalChange}
                    canAccess={canAccess}
                    appLocalizer={appLocalizer}
                />
            );
        }

        // NORMAL FIELDS
        return (
            <Render
                field={field}
                value={fieldValue}
                onChange={handleInternalChange}
                canAccess={canAccess}
                appLocalizer={appLocalizer}
            />
        );
    };

    // Render

    return (
        <>
            <div className="expandable-panel-group">
                {ExpandablePanelMethods.map((method, index) => {
                    if (isWizardMode && index > wizardIndex) return null;

                    const isEnabled = value?.[method.id]?.enable ?? false;
                    const isActive = activeTabs.includes(method.id);
                    const headerIcon = (value?.[method.id]?.icon as string) || method.icon;
                    const priceField = getPriceFieldValue(method.id);
                    const currentTitle = (value?.[method.id]?.title as string) || method.label;
                    const currentDescription = (value?.[method.id]?.description as string) || method.desc;
                    const isEditingThisMethod = editingMethodId === method.id;

                    return (
                        <div
                            key={method.id}
                            className={`expandable-item ${method.disableBtn && !isEnabled ? 'disable' : ''} ${method.openForm ? 'open' : ''} `}
                        >
                            {/* Header */}
                            <div className="expandable-header">
                                {method.formFields && method.formFields.length > 0 && (
                                    <div className="toggle-icon">
                                        <i
                                            className={`adminfont-${isActive && isEnabled
                                                    ? 'keyboard-arrow-down'
                                                    : isActive && method.isCustom && isWizardMode
                                                        ? 'keyboard-arrow-down'
                                                        : 'pagination-right-arrow'
                                                }`}
                                            onClick={() => canAccess && setTabActive(method.id)}
                                        />
                                    </div>
                                )}

                                <div
                                    className="details"
                                    onClick={() => canAccess && setTabActive(method.id)}
                                >
                                    <div className="details-wrapper">
                                        {headerIcon && (
                                            <div
                                                className={`expandable-header-icon`}
                                                ref={iconDropdownOpen === method.id ? iconPickerRef : null}
                                                onClick={(e) => {
                                                    if (!method.iconEnable || !canAccess) return;
                                                    e.stopPropagation();
                                                    setIconDropdownOpen((prev) =>
                                                        prev === method.id ? null : method.id
                                                    );
                                                }}
                                            >
                                                <i className={`adminfont-${headerIcon} icon`} />
                                                {method.iconEnable && iconDropdownOpen !== method.id && (
                                                    <i className="adminfont-edit edit-icon" />
                                                )}
                                                {method.iconEnable && iconDropdownOpen === method.id && (
                                                    <div
                                                        className="icon-options-list"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {(method.iconOptions ?? addNewTemplate?.iconOptions ?? []).map((iconClass) => (
                                                            <button
                                                                key={iconClass}
                                                                className={`icon-option ${headerIcon === iconClass ? 'selected' : ''}`}
                                                                onClick={() => {
                                                                    handleInputChange(method.id, 'icon', iconClass);
                                                                    setIconDropdownOpen(null);
                                                                }}
                                                                title={iconClass}
                                                                type="button"
                                                            >
                                                                <i className={`adminfont-${iconClass}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="expandable-header-info">
                                            <div className="title-wrapper">
                                                <span className="title">
                                                    {isEditingThisMethod && editingField === 'title' && getIsEditable(method, 'title') ? (
                                                        <input
                                                            ref={titleInputRef}
                                                            type="text"
                                                            className="inline-edit-input title-edit"
                                                            value={tempTitle}
                                                            onChange={(e) => setTempTitle(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    ) : (
                                                        <span
                                                            className={`title ${getIsEditable(method, 'title') ? 'editable-title' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (getIsEditable(method, 'title')) startEditing(method.id, 'title');
                                                            }}
                                                            title={getIsEditable(method, 'title') ? 'Click to edit' : ''}
                                                        >
                                                            {currentTitle}
                                                            {getIsEditable(method, 'title') && (
                                                                <i className="adminfont-edit inline-edit-icon" />
                                                            )}
                                                        </span>
                                                    )}
                                                    <div className="panel-badges">
                                                        {method.disableBtn && !method.isCustom && (
                                                            <div className={`admin-badge ${isEnabled ? 'green' : 'red'}`}>
                                                                {isEnabled ? 'Active' : 'Inactive'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </span>
                                            </div>

                                            <div className="panel-description">
                                                {isEditingThisMethod && editingField === 'description' && getIsEditable(method, 'description') ? (
                                                    <textarea
                                                        ref={descTextareaRef}
                                                        className="description-edit"
                                                        value={tempDescription}
                                                        onChange={(e) => setTempDescription(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) saveEdit(); }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <p
                                                        className={getIsEditable(method, 'description') ? 'editable-description' : ''}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (getIsEditable(method, 'description')) startEditing(method.id, 'description');
                                                        }}
                                                        title={getIsEditable(method, 'description') ? 'Click to edit' : ''}
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: currentDescription }} />
                                                        {getIsEditable(method, 'description') && (
                                                            <i className="adminfont-edit inline-edit-icon" />
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="right-section">
                                    {priceField && (
                                        <span className="price-field">
                                            {priceField.price}
                                            {priceField.unit && (
                                                <span className="desc">{priceField.unit}</span>
                                            )}
                                        </span>
                                    )}

                                    <ul className="settings-btn">
                                        {method.isCustom && (
                                            <>
                                                {!method.hideDeleteBtn && canDeleteMethod(method.id) ? (
                                                    <AdminButtonUI
                                                        buttons={[{
                                                            icon: 'delete',
                                                            text: 'Delete',
                                                            color: 'red-color',
                                                            onClick: () => handleDeleteMethod(method.id),
                                                        }]}
                                                    />
                                                ) : (
                                                    <span className="delete-text red-color">Not Deletable</span>
                                                )}
                                            </>
                                        )}

                                        {method.disableBtn ? (
                                            <>
                                                {isEnabled ? (
                                                    <>
                                                        {method.formFields && method.formFields.length > 0 && (
                                                            <AdminButtonUI
                                                                buttons={[{
                                                                    icon: 'setting',
                                                                    text: 'Settings',
                                                                    color: 'purple',
                                                                    onClick: () => canAccess && setTabActive(method.id),
                                                                }]}
                                                            />
                                                        )}
                                                    </>
                                                ) : (
                                                    <li onClick={() => canAccess && enableMethod(method.id)}>
                                                        <span className="admin-btn btn-purple-bg">
                                                            <i className="adminfont-eye" />{' '}
                                                            {method.isCustom ? 'Show' : 'Enable'}
                                                        </span>
                                                    </li>
                                                )}
                                            </>
                                        ) : (
                                            method.countBtn && method.formFields?.length > 0 && (() => {
                                                const countableFields = method.formFields.filter(isCountableField);
                                                return (
                                                    <div className="admin-badge red">
                                                        {fieldProgress[index] || 0}/{countableFields.length}
                                                    </div>
                                                );
                                            })()
                                        )}

                                        {isEnabled && method.isCustom && (
                                            <AdminButtonUI
                                                buttons={[{
                                                    icon: 'eye-blocked',
                                                    text: 'Hide',
                                                    color: 'purple',
                                                    onClick: () => canAccess && disableMethod(method.id),
                                                }]}
                                            />
                                        )}
                                    </ul>

                                    {/* Right-section dropdown (non-custom methods only) */}
                                    {isEnabled && !method.isCustom && (
                                        <div className="icon-wrapper" ref={wrapperRef}>
                                            <i
                                                className="admin-icon adminfont-more-vertical"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownId((prev) =>
                                                        prev === method.id ? null : method.id
                                                    );
                                                }}
                                            />
                                            {openDropdownId === method.id && (
                                                <div
                                                    className="dropdown"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="dropdown-body">
                                                        <ul>
                                                            {method.disableBtn && !method.isCustom && (
                                                                <>
                                                                    {isEnabled ? (
                                                                        <>
                                                                            {method.formFields && method.formFields.length > 0 && (
                                                                                <li onClick={() => canAccess && setTabActive(method.id)}>
                                                                                    <span className="item">
                                                                                        <i className="adminfont-setting" />
                                                                                        Settings
                                                                                    </span>
                                                                                </li>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <li onClick={() => canAccess && enableMethod(method.id)}>
                                                                            <span className="item">
                                                                                <i className="adminfont-eye" />{' '}
                                                                                Enable
                                                                            </span>
                                                                        </li>
                                                                    )}
                                                                </>
                                                            )}
                                                            {isEnabled && !method.isCustom && (
                                                                <li
                                                                    className="delete"
                                                                    onClick={() => canAccess && disableMethod(method.id)}
                                                                >
                                                                    <div className="item">
                                                                        <i className="adminfont-eye-blocked" />
                                                                        Disable
                                                                    </div>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {method.formFields && method.formFields.length > 0 && (
                                <div
                                    className={`${method.wrapperClass || ''} expandable-panel ${(isActive && isEnabled) || (isActive && (method.isCustom || method.openForm)) ? 'open' : ''
                                        } ${method.openForm ? 'open' : ''}`}
                                >
                                    <FormGroupWrapper>
                                        {method.formFields.map((field) => {
                                            if (isWizardMode && field.key === 'wizardButtons') return null;

                                            const shouldShowField = Array.isArray(field.dependent)
                                                ? field.dependent.every((dep) => shouldRender(dep, method.id))
                                                : field.dependent
                                                    ? shouldRender(field.dependent, method.id)
                                                    : true;

                                            if (!shouldShowField) return null;

                                            return (
                                                <FormGroup
                                                    row
                                                    key={field.key}
                                                    label={field.type !== 'blocktext' ? field.label : undefined}
                                                    desc={field.desc}
                                                    htmlFor={field.name}
                                                >
                                                    {field.beforeElement && renderField(method.id, field.beforeElement)}
                                                    {renderField(method.id, field)}
                                                </FormGroup>
                                            );
                                        })}
                                    </FormGroupWrapper>
                                </div>
                            )}
                        </div>
                    );
                })}

                {addNewBtn && (
                    <AdminButtonUI
                        buttons={[{
                            icon: 'plus',
                            text: 'Add New',
                            color: 'purple',
                            onClick: handleAddNewMethod,
                        }]}
                    />
                )}
            </div>

            {isWizardMode && ( renderWizardButtons() )}
        </>
    );
};

const ExpandablePanelGroup: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <ExpandablePanelGroupUI
            key={field.key}
            name={field.key}
            apilink={String(field.apiLink)} // API endpoint used for communication with backend.
            appLocalizer={appLocalizer}
            methods={field.modal ?? []} // Array of available payment methods/options.
            addNewBtn={field.addNewBtn}
            addNewTemplate={field.addNewTemplate ?? []}
            iconEnable={field.iconEnable}
            iconOptions={field.iconOptions || []}
            value={value || {}}
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val);
            }}
            canAccess={canAccess}
        />
    ),

    validate: (field, value) => {
        return null;
    },
};

export default ExpandablePanelGroup;