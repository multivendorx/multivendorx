import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import '../styles/web/ExpandablePanelGroup.scss';
import { getApiLink } from '../utils/apiService';
import axios from 'axios';
import { FieldComponent } from './types';
import { FIELD_REGISTRY } from './FieldRegistry';
import FormGroup from './UI/FormGroup';
import { AdminButtonUI } from './AdminButton';
import FormGroupWrapper from './UI/FormGroupWrapper';

// Types
interface AppLocalizer {
    khali_dabba?: boolean;
    site_url?: string;
    nonce?: string;
}

interface FieldOption {
    value: string | number;
    label: string;
    desc?: string;
    check?: boolean;
    action?: string;
    btnClass?: string;
    url?: string;
    redirect?: string;
}

interface PanelFormField {
    key: string;
    type: string;
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
    btnClass?: string;
    edit?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
    beforeElement?: string | React.ReactNode;
    dependent?: any | any[];
    name?: string;
}

interface ExpandablePanelMethod {
    icon: string;
    id: string;
    label: string;
    connected: boolean;
    disableBtn?: boolean;
    hideDeleteBtn?: boolean;
    countBtn?: boolean;
    desc: string;
    formFields?: PanelFormField[];
    wrapperClass?: string;
    openForm?: boolean;
    single?: boolean;
    rowClass?: string;
    edit?: boolean;
    isCustom?: boolean;
    required?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
    isWizardMode?: boolean;
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

// Constants
const NON_COUNTABLE_FIELD_TYPES = new Set(['button', 'blocktext']);
const PROGRESS_CLAMP = { min: 0 };

// Utility functions
const isFieldFilled = (val: unknown): boolean => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'string') return val.trim() !== '';
    if (Array.isArray(val)) return val.length > 0;
    return true;
};

const generateUniqueId = (base: string): string => {
    return `${base.trim().toLowerCase().replace(/\s+/g, '_')}${Math.floor(Math.random() * 10000)}`;
};

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
    min
}) => {
    // State
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const [wizardIndex, setWizardIndex] = useState(0);
    const [fieldProgress, setFieldProgress] = useState<number[]>([]);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [editingState, setEditingState] = useState<{
        methodId: string | null;
        field: 'title' | 'description' | null;
        tempTitle: string;
        tempDescription: string;
    }>({
        methodId: null,
        field: null,
        tempTitle: '',
        tempDescription: '',
    });
    const [iconDropdownOpen, setIconDropdownOpen] = useState<string | null>(null);
    const [panelMethods, setPanelMethods] = useState<ExpandablePanelMethod[]>([]);

    // Refs
    const wrapperRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const descTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Memoized values
    const countableFieldsMap = useMemo(() => {
        const map = new Map<string, PanelFormField[]>();
        methods.forEach(method => {
            const fields = method.formFields?.filter(
                f => !NON_COUNTABLE_FIELD_TYPES.has(f.type)
            ) || [];
            map.set(method.id, fields);
        });
        return map;
    }, [methods]);

    const customMethodsCount = useMemo(() => 
        panelMethods.filter(m => m.isCustom).length,
    [panelMethods]);

    // Effects
    useEffect(() => {
        if (!isWizardMode) return;

        const initialProgress = methods.map(method => {
            const fields = countableFieldsMap.get(method.id) || [];
            return fields.reduce((count, field) => 
                isFieldFilled(value?.[method.id]?.[field.key]) ? count + 1 : count, 0
            );
        });

        setFieldProgress(initialProgress);
    }, [methods, value, isWizardMode, countableFieldsMap]);

    useEffect(() => {
        const updated = { ...value };
        const valueMethods: ExpandablePanelMethod[] = Object.entries(updated).map(
            ([id, method]) => ({ id, ...(method as any) })
        );

        setPanelMethods(prev => {
            const methodMap = new Map<string, ExpandablePanelMethod>();
            
            // Merge existing and new methods
            [...prev, ...valueMethods].forEach(method => {
                if (!methodMap.has(method.id)) {
                    methodMap.set(method.id, method);
                }
            });

            return Array.from(methodMap.values()).map(method => {
                if (!method.isCustom || !addNewTemplate?.formFields) return method;

                const existingKeys = new Set(method.formFields?.map(f => f.key) || []);
                const newFields = addNewTemplate.formFields.filter(
                    f => !existingKeys.has(f.key)
                );

                return {
                    ...method,
                    formFields: [...(method.formFields || []), ...newFields],
                };
            });
        });
    }, [value, addNewTemplate]);

    // Focus management for editing
    useEffect(() => {
        if (editingState.methodId) {
            if (editingState.field === 'title' && titleInputRef.current) {
                titleInputRef.current.focus();
                titleInputRef.current.select();
            } else if (editingState.field === 'description' && descTextareaRef.current) {
                descTextareaRef.current.focus();
                descTextareaRef.current.select();
            }
        }
    }, [editingState.methodId, editingState.field]);

    // Click outside handler for editing
    useEffect(() => {
        const handleClickOutsideEdit = (event: MouseEvent) => {
            if (!editingState.methodId || !editingState.field) return;

            const isTitleInput = titleInputRef.current?.contains(event.target as Node);
            const isDescTextarea = descTextareaRef.current?.contains(event.target as Node);

            if (!isTitleInput && !isDescTextarea) {
                saveEdit();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!editingState.methodId || !editingState.field) return;

            if (event.key === 'Escape') {
                cancelEdit();
            } else if (event.key === 'Enter' && event.ctrlKey) {
                saveEdit();
            }
        };

        document.addEventListener('mousedown', handleClickOutsideEdit);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideEdit);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editingState]);

    // Click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Callbacks
    const startEditing = useCallback((methodId: string, field: 'title' | 'description') => {
        const method = panelMethods.find(m => m.id === methodId);
        if (!method?.isCustom) return;

        const methodValue = value[methodId] || {};
        
        setEditingState({
            methodId,
            field,
            tempTitle: (methodValue.title as string) || method.label || '',
            tempDescription: (methodValue.description as string) || method.desc || '',
        });
    }, [panelMethods, value]);

    const saveEdit = useCallback(() => {
        const { methodId, field, tempTitle, tempDescription } = editingState;
        
        if (methodId && field) {
            if (field === 'title' && tempTitle.trim()) {
                handleInputChange(methodId, 'title', tempTitle.trim());
            } else if (field === 'description') {
                handleInputChange(methodId, 'description', tempDescription);
            }
        }
        
        cancelEdit();
    }, [editingState]);

    const cancelEdit = useCallback(() => {
        setEditingState({
            methodId: null,
            field: null,
            tempTitle: '',
            tempDescription: '',
        });
    }, []);

    const createNewMethod = useCallback((): ExpandablePanelMethod => {
        if (!addNewTemplate) {
            throw new Error('addNewTemplate is required when addNewBtn is true');
        }

        return {
            id: generateUniqueId(addNewTemplate.label || 'new_item'),
            icon: addNewTemplate.icon || '',
            label: addNewTemplate.label || 'New Item',
            desc: addNewTemplate.desc || '',
            iconEnable: addNewTemplate.iconEnable || false,
            iconOptions: addNewTemplate.iconOptions || [],
            connected: false,
            isCustom: true,
            disableBtn: addNewTemplate.disableBtn || false,
            formFields: addNewTemplate.formFields?.map(field => ({ ...field })) || [],
        };
    }, [addNewTemplate]);

    const handleAddNewMethod = useCallback(() => {
        const newMethod = createNewMethod();

        setPanelMethods(prev => [...prev, newMethod]);

        const initialValues: Record<string, unknown> = {
            isCustom: true,
            label: newMethod.label,
            desc: newMethod.desc,
            required: newMethod.required ?? false,
            title: newMethod.label,
            description: newMethod.desc,
            enable: newMethod.disableBtn ? false : undefined,
            ...(addNewTemplate?.icon && { icon: addNewTemplate.icon }),
        };

        newMethod.formFields?.forEach(field => {
            initialValues[field.key] = '';
        });

        onChange({ ...value, [newMethod.id]: initialValues });
        setActiveTabs(prev => [...prev, newMethod.id]);
    }, [createNewMethod, addNewTemplate, value, onChange]);

    const handleDeleteMethod = useCallback((methodId: string) => {
        if (min !== undefined && customMethodsCount <= min) return;

        setPanelMethods(prev => prev.filter(m => m.id !== methodId));

        const updatedValue = { ...value };
        delete updatedValue[methodId];
        
        onChange(updatedValue);
        setActiveTabs(prev => prev.filter(id => id !== methodId));
    }, [min, customMethodsCount, value, onChange]);

    const canDeleteMethod = useCallback((): boolean => {
        return min === undefined || customMethodsCount > min;
    }, [min, customMethodsCount]);

    const handleInputChange = useCallback((
        methodKey: string,
        fieldKey: string,
        fieldValue: string | string[] | number | boolean | undefined
    ) => {
        if (fieldKey === 'wizardButtons') return;

        const updated = {
            ...value,
            [methodKey]: {
                ...(value[methodKey] || {}),
                [fieldKey]: fieldValue,
            },
        };

        if (isWizardMode) {
            const prevValue = value?.[methodKey]?.[fieldKey];
            const wasFilled = isFieldFilled(prevValue);
            const nowFilled = isFieldFilled(fieldValue);

            if (wasFilled !== nowFilled) {
                const methodIndex = methods.findIndex(m => m.id === methodKey);
                if (methodIndex !== -1) {
                    setFieldProgress(prev => {
                        const updatedProgress = [...prev];
                        const maxFields = (countableFieldsMap.get(methodKey) || []).length;
                        
                        updatedProgress[methodIndex] = Math.max(
                            PROGRESS_CLAMP.min,
                            Math.min(maxFields, updatedProgress[methodIndex] + (nowFilled ? 1 : -1))
                        );
                        
                        return updatedProgress;
                    });
                }
            }
        }

        onChange(updated);
    }, [value, isWizardMode, methods, countableFieldsMap, onChange]);

    const toggleEnable = useCallback((methodId: string, enable: boolean) => {
        handleInputChange(methodId, 'enable', enable);
        if (enable) {
            setActiveTabs(prev => prev.filter(id => id !== methodId));
        }
    }, [handleInputChange]);

    const toggleActiveTab = useCallback((methodId: string) => {
        setActiveTabs(prev => prev[0] === methodId ? [] : [methodId]);
    }, []);

    const isValueEqual = useCallback((
        key: string,
        methodId: string,
        compareValue: string | number | boolean | null = null
    ): boolean => {
        const settingValue = value[methodId]?.[key];

        if (Array.isArray(settingValue)) {
            return compareValue === null 
                ? settingValue.length > 0
                : settingValue.includes(compareValue);
        }

        return compareValue === null 
            ? Boolean(settingValue)
            : settingValue === compareValue;
    }, [value]);

    const shouldRenderField = useCallback((
        dependent: any,
        methodId: string
    ): boolean => {
        if (dependent.set === true && !isValueEqual(dependent.key, methodId)) return false;
        if (dependent.set === false && isValueEqual(dependent.key, methodId)) return false;
        if (dependent.value !== undefined && !isValueEqual(dependent.key, methodId, dependent.value)) return false;
        return true;
    }, [isValueEqual]);

    const getPriceFieldValue = useCallback((methodId: string) => {
        const methodValue = value[methodId] || {};
        const { price, unit } = methodValue;

        if (price === undefined || price === null || price === '') return null;

        const priceDisplay = typeof price === 'number' 
            ? `$${price.toFixed(2)}`
            : `$${price}`;

        return { price: priceDisplay, unit: unit || '' };
    }, [value]);

    const renderField = useCallback((
        methodId: string,
        field: PanelFormField
    ): JSX.Element | null => {
        const fieldComponent = FIELD_REGISTRY[field.type];
        if (!fieldComponent) return null;

        const Render = fieldComponent.render;
        const fieldValue = value[methodId]?.[field.key];

        const handleInternalChange = (val: any) => {
            handleInputChange(methodId, field.key, val);
        };

        // Special handling for wizard mode buttons
        if (field.type === 'button' && isWizardMode) {
            const wizardSteps = methods
                .map((m, i) => ({ ...m, index: i }))
                .filter(m => m.isWizardMode);

            const isLastMethod = wizardIndex === wizardSteps.length - 1;
            const isFirstMethod = wizardIndex === 0;

            const resolvedButtons = field.options?.map(btn => {
                switch (btn.action) {
                    case 'back':
                        return {
                            ...btn,
                            text: btn.label,
                            onClick: () => {
                                if (isFirstMethod) return;
                                const prev = wizardSteps[wizardIndex - 1];
                                setWizardIndex(prev.index);
                                setActiveTabs([prev.id]);
                            },
                        };
                    case 'next':
                        return {
                            ...btn,
                            text: btn.label,
                            onClick: async () => {
                                await handleSaveSetupWizard();
                                
                                if (!isLastMethod) {
                                    const next = wizardSteps[wizardIndex + 1];
                                    setWizardIndex(next.index);
                                    setActiveTabs([next.id]);
                                } else if (btn.redirect) {
                                    window.open(btn.redirect, '_self');
                                }
                            },
                        };
                    case 'skip':
                        return {
                            ...btn,
                            text: btn.label,
                            onClick: () => {
                                setWizardIndex(methods.length);
                                if (appLocalizer?.site_url) {
                                    window.open(appLocalizer.site_url, '_self');
                                }
                            },
                        };
                    default:
                        return btn;
                }
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

        return (
            <Render
                field={field}
                value={fieldValue}
                onChange={handleInternalChange}
                canAccess={canAccess}
                appLocalizer={appLocalizer}
            />
        );
    }, [value, handleInputChange, isWizardMode, methods, wizardIndex, canAccess, appLocalizer]);

    const handleSaveSetupWizard = useCallback(async () => {
        if (!apilink || !appLocalizer) return;

        try {
            await axios({
                url: getApiLink(appLocalizer, apilink),
                method: 'POST',
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                data: { setupWizard: true, value }
            });
        } catch (error) {
            console.error('Failed to save wizard data:', error);
        }
    }, [apilink, appLocalizer, value]);

    const renderWizardButtons = useCallback(() => {
        const step = panelMethods[wizardIndex];
        const buttonField = step?.formFields?.find(f => f.type === 'button');
        
        return buttonField ? renderField(step.id, buttonField) : null;
    }, [panelMethods, wizardIndex, renderField]);

    // Early return for empty state
    if (!panelMethods.length && !addNewBtn) return null;

    return (
        <>
            <div className="expandable-panel-group">
                {panelMethods.map((method, index) => {
                    if (isWizardMode && index > wizardIndex) return null;

                    const isEnabled = value?.[method.id]?.enable ?? false;
                    const isActive = activeTabs.includes(method.id);
                    const headerIcon = (value?.[method.id]?.icon as string) || method.icon;
                    const priceField = getPriceFieldValue(method.id);
                    const currentTitle = (value?.[method.id]?.title as string) || method.label;
                    const currentDescription = (value?.[method.id]?.description as string) || method.desc;
                    const isEditingThisMethod = editingState.methodId === method.id;
                    
                    const getIsEditable = (field: 'title' | 'description'): boolean => {
                        if (!method.isCustom) return false;
                        return addNewTemplate?.editableFields?.[field] !== false;
                    };

                    return (
                        <div
                            key={method.id}
                            className={`expandable-item ${method.disableBtn && !isEnabled ? 'disable' : ''} ${method.openForm ? 'open' : ''}`}
                        >
                            {/* Header */}
                            <div className="expandable-header">
                                {method.formFields?.length > 0 && (
                                    <div className="toggle-icon">
                                        <i
                                            className={`adminfont-${isActive && isEnabled ? 'keyboard-arrow-down' : 
                                                (isActive && method.isCustom && isWizardMode) ? 'keyboard-arrow-down' : 'pagination-right-arrow'}`}
                                            onClick={() => canAccess && toggleActiveTab(method.id)}
                                        />
                                    </div>
                                )}

                                <div
                                    className="details"
                                    onClick={() => canAccess && toggleActiveTab(method.id)}
                                >
                                    <div className="details-wrapper">
                                        {headerIcon && (
                                            <div className="expandable-header-icon">
                                                <i 
                                                    className={`${headerIcon} inline-edit-icon`}
                                                    onClick={() => method.iconEnable && console.log('icon click')}
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="expandable-header-info">
                                            <div className="title-wrapper">
                                                <span className="title">
                                                    {isEditingThisMethod && editingState.field === 'title' && getIsEditable('title') ? (
                                                        <input
                                                            ref={titleInputRef}
                                                            type="text"
                                                            className="inline-edit-input title-edit"
                                                            value={editingState.tempTitle}
                                                            onChange={(e) => setEditingState(prev => ({ ...prev, tempTitle: e.target.value }))}
                                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    ) : (
                                                        <span
                                                            className={`title ${getIsEditable('title') ? 'editable-title' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (getIsEditable('title')) startEditing(method.id, 'title');
                                                            }}
                                                            title={getIsEditable('title') ? "Click to edit" : ""}
                                                        >
                                                            {currentTitle}
                                                            {getIsEditable('title') && <i className="adminfont-edit inline-edit-icon" />}
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
                                                {isEditingThisMethod && editingState.field === 'description' && getIsEditable('description') ? (
                                                    <textarea
                                                        ref={descTextareaRef}
                                                        className="description-edit"
                                                        value={editingState.tempDescription}
                                                        onChange={(e) => setEditingState(prev => ({ ...prev, tempDescription: e.target.value }))}
                                                        onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && saveEdit()}
                                                        onClick={(e) => e.stopPropagation()}
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <p
                                                        className={getIsEditable('description') ? "editable-description" : ""}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (getIsEditable('description')) startEditing(method.id, 'description');
                                                        }}
                                                        title={getIsEditable('description') ? "Click to edit" : ""}
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: currentDescription }} />
                                                        {getIsEditable('description') && <i className="adminfont-edit inline-edit-icon" />}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="right-section" ref={menuRef}>
                                    {priceField && (
                                        <span className="price-field">
                                            {priceField.price}
                                            {priceField.unit && <span className="desc">{priceField.unit}</span>}
                                        </span>
                                    )}

                                    <ul className="settings-btn">
                                        {method.isCustom && (
                                            <>
                                                {!method.hideDeleteBtn && canDeleteMethod() ? (
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
                                                    method.formFields?.length > 0 && (
                                                        <AdminButtonUI
                                                            buttons={[{
                                                                icon: 'setting',
                                                                text: 'Settings',
                                                                color: 'purple',
                                                                onClick: () => canAccess && toggleActiveTab(method.id),
                                                            }]}
                                                        />
                                                    )
                                                ) : (
                                                    <li onClick={() => canAccess && toggleEnable(method.id, true)}>
                                                        <span className="admin-btn btn-purple-bg">
                                                            <i className="adminfont-eye" /> {method.isCustom ? 'Show' : 'Enable'}
                                                        </span>
                                                    </li>
                                                )}
                                            </>
                                        ) : method.countBtn && method.formFields?.length > 0 && (
                                            <div className="admin-badge red">
                                                {fieldProgress[index] || 0}/{countableFieldsMap.get(method.id)?.length || 0}
                                            </div>
                                        )}

                                        {isEnabled && method.isCustom && (
                                            <AdminButtonUI
                                                buttons={[{
                                                    icon: 'eye-blocked',
                                                    text: 'Hide',
                                                    color: 'purple',
                                                    onClick: () => canAccess && toggleEnable(method.id, false),
                                                }]}
                                            />
                                        )}
                                    </ul>

                                    {/* Dropdown for non-custom methods */}
                                    {isEnabled && !method.isCustom && (
                                        <div className="icon-wrapper" ref={wrapperRef}>
                                            <i
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownId(prev => prev === method.id ? null : method.id);
                                                }}
                                                className="admin-icon adminfont-more-vertical"
                                            />
                                            
                                            {openDropdownId === method.id && (
                                                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                                                    <div className="dropdown-body">
                                                        <ul>
                                                            {method.disableBtn && !method.isCustom && (
                                                                <>
                                                                    {isEnabled ? (
                                                                        method.formFields?.length > 0 && (
                                                                            <li onClick={() => canAccess && toggleActiveTab(method.id)}>
                                                                                <span className="item">
                                                                                    <i className="adminfont-setting" /> Settings
                                                                                </span>
                                                                            </li>
                                                                        )
                                                                    ) : (
                                                                        <li onClick={() => canAccess && toggleEnable(method.id, true)}>
                                                                            <span className="item">
                                                                                <i className="adminfont-eye" /> Enable
                                                                            </span>
                                                                        </li>
                                                                    )}
                                                                </>
                                                            )}
                                                            
                                                            {isEnabled && !method.isCustom && (
                                                                <li className="delete" onClick={() => canAccess && toggleEnable(method.id, false)}>
                                                                    <div className="item">
                                                                        <i className="adminfont-eye-blocked" /> Disable
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

                            {/* Panel Content */}
                            {method.formFields?.length > 0 && (
                                <div
                                    className={`${method.wrapperClass || ''} expandable-panel ${
                                        (isActive && isEnabled) || (isActive && (method.isCustom || method.openForm)) || method.openForm ? 'open' : ''
                                    }`}
                                >
                                    <FormGroupWrapper>
                                        {method.formFields.map(field => {
                                            if (isWizardMode && field.type === 'button') return null;

                                            const shouldShow = (() => {
                                                if (!field.dependent) return true;
                                                
                                                if (Array.isArray(field.dependent)) {
                                                    return field.dependent.every(dep => shouldRenderField(dep, method.id));
                                                }
                                                
                                                return shouldRenderField(field.dependent, method.id);
                                            })();

                                            if (!shouldShow) return null;

                                            return (
                                                <FormGroup
                                                    key={field.key}
                                                    row
                                                    label={field.type !== 'blocktext' ? field.label : undefined}
                                                    desc={field.desc}
                                                    htmlFor={field.name}
                                                >
                                                    {field.beforeElement && renderField(method.id, field.beforeElement as PanelFormField)}
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

            {isWizardMode && (
                <div className="buttons-wrapper">{renderWizardButtons()}</div>
            )}
        </>
    );
};

const ExpandablePanelGroup: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <ExpandablePanelGroupUI
            key={field.key}
            name={field.key}
            apilink={String(field.apiLink)} //API endpoint used for communication with backend.
            appLocalizer={appLocalizer}
            methods={field.modal ?? []} //Array of available payment methods/options.
            addNewBtn={field.addNewBtn}
            addNewTemplate={field.addNewTemplate}
            value={value || {}}
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val);
            }}
            canAccess={canAccess}
        />
    ),

    validate: () => null,
};

export default ExpandablePanelGroup;