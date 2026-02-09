import React, { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import '../styles/web/ExpandablePanelGroup.scss';
import { getApiLink } from '../utils/apiService';
import axios from 'axios';
import { FieldComponent } from './types';
import { FIELD_REGISTRY } from './FieldRegistry';

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
    btnClass?: string;
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
    | 'nested'
    | 'iconlibrary';

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
    selectType?: string;
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
    isCustom?: boolean;  // for show edit and delete btn 
    required?: boolean;
}
interface AddNewTemplate {
    icon?: string;
    label?: string;
    desc?: string;
    formFields?: PanelFormField[];
    disableBtn?: boolean;
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
    setWizardIndex?: (index: number) => void;
    canAccess: boolean;
    addNewBtn?: boolean;
    addNewTemplate?: AddNewTemplate;
    min?: number;
}

const ExpandablePanelGroupUI: React.FC<ExpandablePanelGroupProps> = ({
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
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);
    const [wizardIndex, setWizardIndex] = useState(0);
    const [fieldProgress, setFieldProgress] = useState(
        methods.map(() => 0)
    );
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(
        null
    );
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [iconDropdownOpen, setIconDropdownOpen] = useState<string | null>(
        null
    );
    // State for inline editing
    const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDescription, setTempDescription] = useState('');
    const titleInputRef = useRef<HTMLInputElement>(null);
    const descTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [ExpandablePanelMethods, setExpandablePanelMethods] = useState<
        ExpandablePanelMethod[]
    >(() =>
        methods.map((method) => {
            if (!method.isCustom) {
                return method;
            }

            const templateFields = addNewTemplate?.formFields ?? [];
            const methodFields = method.formFields ?? [];

            const existingKeys = new Set(methodFields.map((f) => f.key));

            return {
                ...method,
                formFields: [
                    ...methodFields,
                    ...templateFields.filter(
                        (f) => !existingKeys.has(f.key)
                    ),
                ],
            };
        })
    );

    // Effect to focus input when editing starts
    useEffect(() => {
        if (editingMethodId && editingField === 'title' && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
        if (editingMethodId && editingField === 'description' && descTextareaRef.current) {
            descTextareaRef.current.focus();
            descTextareaRef.current.select();
        }
    }, [editingMethodId, editingField]);
    // Effect to handle click outside for inline editing
    useEffect(() => {
        const handleClickOutsideEdit = (event: MouseEvent) => {
            if (editingMethodId && editingField) {
                const isTitleInput = titleInputRef.current?.contains(event.target as Node);
                const isDescTextarea = descTextareaRef.current?.contains(event.target as Node);

                if (!isTitleInput && !isDescTextarea) {
                    saveEdit();
                }
            }
        };

        // Effect to handle Escape key
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && editingMethodId && editingField) {
                cancelEdit();
            }
            if (event.key === 'Enter' && editingMethodId && editingField && event.ctrlKey) {
                saveEdit();
            }
        };

        document.addEventListener('mousedown', handleClickOutsideEdit);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideEdit);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editingMethodId, editingField, tempTitle, tempDescription]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const isFilled = (val: any): boolean => {
        if (val === undefined || val === null) return false;
        if (typeof val === 'string') return val.trim() !== '';
        if (Array.isArray(val)) return val.length > 0;
        return true; // number | boolean
    };

    useEffect(() => {
        if (!isWizardMode && !methods?.length) return;

        const initialProgress = methods.map((method) => {
            const countableFields =
                method.formFields?.filter(
                    (f) => f.type !== 'button' && f.type !== 'blocktext'
                ) || [];

            let filledCount = 0;

            countableFields.forEach((field) => {
                const fieldValue = value?.[method.id]?.[field.key];
                if (isFilled(fieldValue)) {
                    filledCount += 1;
                }
            });

            return filledCount;
        });

        setFieldProgress(initialProgress);
    }, [methods, value, isWizardMode]);


    useEffect(() => {
        const updated: Record<string, Record<string, unknown>> = {
            ...value,
        };

        const valueMethods: ExpandablePanelMethod[] = Object.entries(updated).map(
            ([id, method]) => ({
                id,
                ...(method as any),
            })
        );

        setExpandablePanelMethods((prev) => {
            const methodMap = new Map<string, ExpandablePanelMethod>();

            // existing state
            prev.forEach((method) => {
                methodMap.set(method.id, method);
            });

            // override / add from value
            valueMethods.forEach((method) => {
                const existingMethod = methodMap.get(method.id);
                methodMap.set(method.id, {
                    ...existingMethod,
                    ...method,
                    // Preserve disableBtn from original method or template
                    disableBtn: method.disableBtn ?? existingMethod?.disableBtn ?? false,
                });
            });

            // merge formFields
            return Array.from(methodMap.values()).map((method) => {
                if (!method.isCustom) {
                    return method;
                }

                const templateFields = addNewTemplate?.formFields ?? [];
                const methodFields = method.formFields ?? [];

                const existingKeys = new Set(
                    methodFields.map((f) => f.key)
                );

                return {
                    ...method,
                    formFields: [
                        ...methodFields,
                        ...templateFields.filter(
                            (f) => !existingKeys.has(f.key)
                        ),
                    ],
                };
            });
        });
    }, [value, addNewTemplate]);

    // Inline editing functions
    const startEditing = (methodId: string, field: 'title' | 'description') => {
        const method = ExpandablePanelMethods.find(m => m.id === methodId);

        // Only allow editing for custom items
        if (!method?.isCustom) {
            return;
        }

        setEditingMethodId(methodId);
        setEditingField(field);

        const methodValue = value[methodId] || {};

        if (field === 'title') {
            setTempTitle((methodValue.title as string) || method.label || '');
        } else if (field === 'description') {
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
    // add new
    const createNewExpandablePanelMethod = (): ExpandablePanelMethod => {
        if (!addNewTemplate) {
            throw new Error(
                'addNewTemplate is required when addNewBtn is true'
            );
        }

        const id = addNewTemplate.label
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_') +
            Math.floor(Math.random() * 10000);

        return {
            id,
            icon: addNewTemplate.icon || '',
            label: addNewTemplate.label || 'New Item',
            desc: addNewTemplate.desc || '',
            connected: false,
            isCustom: true,
            disableBtn: addNewTemplate.disableBtn || false, // Add disableBtn
            formFields: addNewTemplate.formFields ? addNewTemplate.formFields.map((field) => ({
                ...field,
            })) : [],
        };
    };

    const handleAddNewMethod = () => {
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
        }

        // Always include icon if it's in the template
        if (addNewTemplate?.icon) {
            initialValues.icon = newMethod.icon;
        }

        // Handle additional form fields
        newMethod.formFields?.forEach((field) => {
            if (field.type === 'iconlibrary') {
                initialValues[field.key] = '';
            } else {
                // Set default empty value for other field types
                initialValues[field.key] = '';
            }
        });

        onChange({
            ...value,
            [newMethod.id]: initialValues,
        });

        setActiveTabs((prev) => [...prev, newMethod.id]);
    };
    const handleDeleteMethod = (methodId: string) => {
        if (min !== undefined) {
            const customMethods = ExpandablePanelMethods.filter(m => m.isCustom);
            const currentCount = customMethods.length;

            if (currentCount <= min) {
                return;
            }
        }

        setExpandablePanelMethods((prev) =>
            prev.filter((m) => m.id !== methodId)
        );

        const updatedValue = { ...value };
        delete updatedValue[methodId];

        onChange(updatedValue);

        setActiveTabs((prev) => prev.filter((id) => id !== methodId));
    };
    const canDeleteMethod = (methodId: string): boolean => {
        if (min === undefined) {
            return true;
        }

        const customMethods = ExpandablePanelMethods.filter(m => m.isCustom);
        const currentCount = customMethods.length;
        return currentCount > min;
    };

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
                const methodIndex = methods.findIndex(
                    (m) => m.id === methodKey
                );

                if (methodIndex !== -1) {
                    setFieldProgress((prev) => {
                        const updatedProgress = [...prev];

                        // Count ONLY real fields (exclude buttons)
                        const countableFields =
                            methods[methodIndex]?.formFields?.filter(
                                (f) => f.type !== 'button' && f.type !== 'blocktext'
                            ) || [];

                        const maxFields = countableFields.length;

                        updatedProgress[methodIndex] += nowFilled ? 1 : -1;

                        // Clamp value safely
                        if (updatedProgress[methodIndex] < 0) {
                            updatedProgress[methodIndex] = 0;
                        }

                        if (updatedProgress[methodIndex] > maxFields) {
                            updatedProgress[methodIndex] = maxFields;
                        }

                        return updatedProgress;
                    });
                }
            }
        }

        onChange(updated);
    };

    const toggleEnable = (methodId: string, enable: boolean) => {
        handleInputChange(methodId, 'enable', enable);
        if (enable) {
            setActiveTabs((prev) =>
                prev.filter((id) => id !== methodId)
            );
        }
    };

    const toggleActiveTab = (methodId: string) => {
        setActiveTabs((prev) =>
            prev[0] === methodId ? [] : [methodId]
        );
    };

    const renderWizardButtons = () => {
        const step = ExpandablePanelMethods[wizardIndex];
        const buttonField = step?.formFields?.find(
            (f) => f.type === 'button'
        );
        if (!buttonField) {
            return null;
        }

        return renderField(step.id, buttonField);
    };

    const handleSaveSetupWizard = () => {
        axios({
            url: getApiLink(appLocalizer, apilink),
            method: 'POST',
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                setupWizard: true,
                value: value
            },
        }).then((res) => {
            console.log(res)
        });
    };

    const isContain = (
        key: string,
        methodId: string,
        valuee: string | number | boolean | null = null
    ): boolean => {
        const settingValue = value[methodId]?.[key];

        // If settingValue is an array
        if (Array.isArray(settingValue)) {
            // If value is null and settingValue has elements, return true
            if (valuee === null && settingValue.length > 0) {
                return true;
            }

            return settingValue.includes(valuee);
        }

        // If settingValue is not an array
        if (valuee === null && Boolean(settingValue)) {
            return true;
        }

        return settingValue === valuee;
    };

    const shouldRender = (dependent: any, methodId: string): boolean => {
        if (dependent.set === true && !isContain(dependent.key, methodId)) {
            return false;
        }
        if (dependent.set === false && isContain(dependent.key, methodId)) {
            return false;
        }
        if (
            dependent.value !== undefined &&
            !isContain(dependent.key, methodId, dependent.value)
        ) {
            return false;
        }
        return true;
    };
    // price field editable 
    const getPriceFieldValue = (methodId: string) => {
        const methodValue = value[methodId] || {};
        const price = methodValue.price;
        const unit = methodValue.unit;

        // Return null if no price field exists or price is empty
        if (price === undefined || price === null || price === '') {
            return null;
        }

        // Format the price display
        const priceDisplay = typeof price === 'number'
            ? `$${price.toFixed(2)}`
            : `$${price}`;

        const unitDisplay = unit ? `${unit}` : '';

        return { price: priceDisplay, unit: unitDisplay };
    };

    // const renderField = (
    //     methodId: string, 
    //     field: PanelFormField
    //     ): JSX.Element | null => {

    //     const fieldComponent = FIELD_REGISTRY[field.type];
    //     if (!fieldComponent) return null;

    //     const Render = fieldComponent.render;
    //     const fieldValue = value[methodId]?.[field.key];
            
    //     const handleInternalChange = (val: any) => {
    //         handleInputChange(methodId, field.key, val);
    //         return;            
    //     };

    //     return (
    //         <Render
    //             field={field}
    //             value={fieldValue}
    //             onChange={handleInternalChange}
    //             canAccess={canAccess}
    //             appLocalizer={appLocalizer}
    //         />
    //     );
    // };

    const renderField = (
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


        if (field.type === 'button' && isWizardMode) {
            const wizardSteps = ExpandablePanelMethods
                .map((m, i) => ({ ...m, index: i }))
                .filter((m) => m.isWizardMode);

            const isLastMethod = wizardIndex === wizardSteps.length - 1;
            const isFirstMethod = wizardIndex === 0;

            const resolvedButtons = field.options.map((btn) => {
                if (btn.action === 'back') {
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
                }

                if (btn.action === 'next') {
                    return {
                        ...btn,
                        text: btn.label,
                        onClick: () => {
                            handleSaveSetupWizard();

                            if (!isLastMethod) {
                                const next = wizardSteps[wizardIndex + 1];
                                setWizardIndex(next.index);
                                setActiveTabs([next.id]);
                                return;
                            }

                            if (btn.redirect) {
                                window.open(btn.redirect, '_self');
                            }
                        },
                    };
                }

                if (btn.action === 'skip') {
                    return {
                        ...btn,
                        text: btn.label,
                        onClick: () => {
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

        // 👇 NORMAL FIELDS
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

    return (
        <>
            <div className="expandable-panel-group">
                {ExpandablePanelMethods.map((method, index) => {
                    const isEnabled = value?.[method.id]?.enable ?? false;
                    const isActive = activeTabs.includes(method.id);
                    const headerIcon =
                        (value?.[method.id]?.icon as string) || method.icon;

                    if (isWizardMode && index > wizardIndex) {
                        return null;
                    }
                    const priceField = getPriceFieldValue(method.id);
                    const currentTitle = (value?.[method.id]?.title as string) || method.label;
                    const currentDescription = (value?.[method.id]?.description as string) || method.desc;
                    const isEditingThisMethod = editingMethodId === method.id;
                    const getIsEditable = (field: 'title' | 'description' | 'icon'): boolean => {
                        if (!method.isCustom) return false;

                        if (!addNewTemplate?.editableFields) {
                            return field !== 'icon';
                        }

                        const fieldConfig = addNewTemplate.editableFields[field];
                        if (fieldConfig === false) return false;
                        return field !== 'icon';
                    };
                    return (
                        <div
                            key={method.id}
                            className={`expandable-item ${method.disableBtn && !isEnabled
                                ? 'disable'
                                : ''
                                } ${method.openForm ? 'open' : ''} `}
                        >
                            { /* Header */}
                            <div className="expandable-header">
                                {method.formFields &&
                                    method.formFields.length > 0 &&
                                    <div className="toggle-icon">
                                        <i
                                            className={`adminfont-${isActive && isEnabled ? 'keyboard-arrow-down' : ((isActive && method.isCustom && isWizardMode) ? 'keyboard-arrow-down' : 'pagination-right-arrow')
                                                }`}
                                            onClick={() => {
                                                canAccess &&
                                                setTabActive(method.id)
                                            }}
                                        />
                                    </div>
                                }

                                <div
                                    className="details"
                                    onClick={() => {
                                        canAccess &&
                                        setTabActive(method.id)
                                    }}
                                >
                                    <div className="details-wrapper">
                                        {headerIcon && (
                                            <div className="expandable-header-icon">
                                                <i className={headerIcon}></i>
                                            </div>
                                        )}
                                        <div className="expandable-header-info">
                                            <div className="title-wrapper">
                                                <span className="title">
                                                    {isEditingThisMethod && editingField === 'title' && getIsEditable('title') ? (
                                                        <input
                                                            ref={titleInputRef}
                                                            type="text"
                                                            className="inline-edit-input title-edit"
                                                            value={tempTitle}
                                                            onChange={(e) => setTempTitle(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    saveEdit();
                                                                }
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    ) : (
                                                        <span
                                                            className={`title ${getIsEditable('title') ? 'editable-title' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (getIsEditable('title')) {
                                                                    startEditing(method.id, 'title');
                                                                }
                                                            }}
                                                            title={getIsEditable('title') ? "Click to edit" : ""}
                                                        >
                                                            {currentTitle}
                                                            {getIsEditable('title') && <i className="adminfont-edit inline-edit-icon"></i>}
                                                        </span>
                                                    )}
                                                    <div className="panel-badges">
                                                        {method.disableBtn && !method.isCustom && (
                                                            <div
                                                                className={`admin-badge ${isEnabled
                                                                    ? 'green'
                                                                    : 'red'
                                                                    }`}
                                                            >
                                                                {isEnabled
                                                                    ? 'Active'
                                                                    : 'Inactive'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </span>
                                            </div>
                                            <div className="panel-description">
                                                {isEditingThisMethod && editingField === 'description' && getIsEditable('description') ? (
                                                    <textarea
                                                        ref={descTextareaRef}
                                                        className="inline-edit-textarea description-edit"
                                                        value={tempDescription}
                                                        onChange={(e) => setTempDescription(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.ctrlKey) {
                                                                saveEdit();
                                                            }
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <p
                                                        className={getIsEditable('description') ? "editable-description" : ""}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (getIsEditable('description')) {
                                                                startEditing(method.id, 'description');
                                                            }
                                                        }}
                                                        title={getIsEditable('description') ? "Click to edit" : ""}
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: currentDescription }} />
                                                        {getIsEditable('description') && <i className="adminfont-edit inline-edit-icon"></i>}
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
                                            {priceField.unit && (
                                                <span className="desc">{priceField.unit}</span>
                                            )}
                                        </span>
                                    )}
                                    <ul className="settings-btn">
                                        {method.isCustom && (
                                            <>
                                                {!method.hideDeleteBtn && canDeleteMethod(method.id) ? (
                                                    <li
                                                        onClick={() => {
                                                            handleDeleteMethod(method.id);
                                                        }}
                                                    >
                                                        <span className="admin-btn red-color">
                                                            <i className="adminfont-delete"></i>
                                                            Delete
                                                        </span>
                                                    </li>
                                                ) : (
                                                    <span className="delete-text red-color">Not Deletable</span>
                                                )}
                                            </>
                                        )}
                                        {method.disableBtn ? (
                                            <>
                                                {isEnabled ? (
                                                    <>
                                                        {method.formFields &&
                                                            method.formFields
                                                                .length > 0 && (
                                                                <li
                                                                    onClick={() => {
                                                                        canAccess &&
                                                                        setTabActive(method.id)
                                                                    }}
                                                                >
                                                                    <span className="admin-btn btn-purple">
                                                                        <i className="adminfont-setting"></i>
                                                                        Settings
                                                                    </span>
                                                                </li>
                                                            )}
                                                    </>
                                                ) : (
                                                    <li
                                                        onClick={() => {
                                                            canAccess &&
                                                            enableMethod(method.id)
                                                        }}
                                                    >
                                                        <span className="admin-btn btn-purple-bg">
                                                            <i className="adminfont-eye"></i>{' '}
                                                            {method.isCustom ? 'Show' : 'Enable'}
                                                        </span>
                                                    </li>
                                                )}
                                            </>
                                        ) : method.countBtn && method.formFields?.length > 0 && (() => {
                                            const countableFields = method.formFields.filter(
                                                (field) => field.type !== 'button' && field.type !== 'blocktext'
                                            );

                                            return (
                                                <div className="admin-badge red">
                                                    {fieldProgress[index] || 0}/{countableFields.length}
                                                </div>
                                            );
                                        })()}
                                        {isEnabled &&
                                            method.isCustom && (
                                                <li
                                                    onClick={() => {
                                                        canAccess &&
                                                        disableMethod(method.id)
                                                    }}
                                                >
                                                    <div className="admin-btn btn-purple">
                                                        <i className="adminfont-eye-blocked"></i>
                                                        Hide
                                                    </div>
                                                </li>
                                            )}
                                    </ul>
                                    { /* show dropdown */}
                                    {isEnabled && !method.isCustom && (
                                        <div
                                            className="icon-wrapper"
                                            ref={wrapperRef}
                                        >
                                            <i
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownId(
                                                        (prev) =>
                                                            prev === method.id
                                                                ? null
                                                                : method.id
                                                    );
                                                }}
                                                className="admin-icon adminfont-more-vertical"
                                            ></i>
                                            {openDropdownId === method.id && (
                                                <div
                                                    className="dropdown"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <div className="dropdown-body">
                                                        <ul>
                                                            {method.disableBtn && !method.isCustom && (
                                                                <>
                                                                    {isEnabled ? (
                                                                        <>
                                                                            {method.formFields &&
                                                                                method
                                                                                    .formFields
                                                                                    .length >
                                                                                0 && (
                                                                                    <li
                                                                                        onClick={() => {
                                                                                            canAccess &&
                                                                                            setTabActive(method.id)
                                                                                        }}
                                                                                    >
                                                                                        <span className="item">
                                                                                            <i className="adminfont-setting"></i>
                                                                                            Settings
                                                                                        </span>
                                                                                    </li>
                                                                                )}
                                                                        </>
                                                                    ) : (
                                                                        <li
                                                                            onClick={() => {
                                                                                canAccess &&
                                                                                enableMethod(method.id)
                                                                            }}
                                                                        >
                                                                            <span className="item">
                                                                                <i className="adminfont-eye"></i>{' '}
                                                                                Enable
                                                                            </span>
                                                                        </li>
                                                                    )}
                                                                </>
                                                            )}
                                                            {isEnabled &&
                                                                !method.isCustom && (
                                                                    <li
                                                                        className="delete"
                                                                        onClick={() => {
                                                                            canAccess &&
                                                                            disableMethod(method.id)
                                                                        }}
                                                                    >
                                                                        <div className="item">
                                                                            <i className="adminfont-eye-blocked"></i>
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

                            {method.formFields &&
                                method.formFields.length > 0 && (
                                    <div
                                        className={`${method.wrapperClass || ''
                                            } expandable-panel ${isActive && isEnabled ? 'open' : ((isActive && (method.isCustom || method.openForm)) ? 'open' : '')
                                            } ${method.openForm ? 'open' : ''}`}
                                    >
                                        {method.formFields.map((field) => {
                                            if (
                                                isWizardMode &&
                                                field.type === 'button'
                                            ) {
                                                return null;
                                            }

                                            const shouldShowField = (() => {
                                                if (Array.isArray(field.dependent)) {
                                                    return field.dependent.every((dependent) =>
                                                        shouldRender(dependent, method.id)
                                                    );
                                                }

                                                if (field.dependent) {
                                                    return shouldRender(field.dependent, method.id);
                                                }

                                                return true;
                                            })();

                                            if (!shouldShowField) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={field.key}
                                                    className="form-group"
                                                >
                                                    {field.type !== 'blocktext' && field.label && (
                                                        <label>
                                                            {field.label}
                                                        </label>
                                                    )}
                                                    <div className="input-content">
                                                        {field.beforeElement &&
                                                            renderField(
                                                            method.id,
                                                            field.beforeElement
                                                        )}
                                                        {renderField(
                                                            method.id,
                                                            field
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                        </div>
                    );
                })}
                { /* {addNewBtn && ( */}
                {addNewBtn && (
                    <div className="buttons-wrapper">
                        <div
                            className="admin-btn btn-purple"
                            onClick={handleAddNewMethod}
                        >
                            <i className="adminfont-plus"></i> Add New
                        </div>
                    </div>
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
            apilink={ String( field.apiLink ) } //API endpoint used for communication with backend.
            appLocalizer={ appLocalizer }
            methods={ field.modal ?? [] } //Array of available payment methods/options.
            addNewBtn={ field.addNewBtn }
            addNewTemplate={ field.addNewTemplate ?? [] }
            iconEnable={ field.iconEnable }
            iconOptions={ field.iconOptions || [] }
            value={ value || {} }
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val)
            }}
            canAccess={canAccess}
        />
    ),

    validate: (field, value) => {
        if (field.required && !value?.[field.key]) {
            return `${field.label} is required`;
        }

        return null;
    },

};

export default ExpandablePanelGroup;