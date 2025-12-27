import React, { useEffect, useRef, useState } from 'react';
import '../styles/web/ExpandablePanelGroup.scss';
import TextArea from './TextArea';
import ToggleSetting from './ToggleSetting';
import MultiCheckBox from './MultiCheckbox';
import NestedComponent from './NestedComponent';

interface ClickableItem {
    name: string;
    url?: string;
}

interface ButtonItem {
    label: string;
    url?: string;
}

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
}

interface PanelFormField {
    key: string;
    type:
    | 'text'
    | 'password'
    | 'number'
    | 'checkbox'
    | 'textarea'
    | 'expandable-panel'
    | 'multi-checkbox'
    | 'check-list'
    | 'description'
    | 'setup'
    | 'setting-toggle'
    | 'buttons'
    | 'nested'
    | 'clickable-list'
    | 'iconlibrary'
    | 'copy-text';

    label: string;
    placeholder?: string;
    nestedFields?: PanelFormField[];
    des?: string;
    addButtonLabel?: string;
    deleteButtonLabel?: string;
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
    items?: ClickableItem[];
    button?: ButtonItem;
    edit?: boolean;
    iconEnable?: boolean;
    iconOptions?: string[];
}

interface ExpandablePanelMethod {
    icon: string;
    id: string;
    label: string;
    connected: boolean;
    disableBtn?: boolean;
    countBtn?: boolean;
    desc: string;
    formFields?: PanelFormField[];
    wrapperClass?: string;
    openForm?: boolean;
    single?: boolean;
    rowClass?: string;
    nestedFields?: PanelFormField[];
    proSetting?: boolean;
    moduleEnabled?: string;
    edit?: boolean;
    isCustom?: boolean;
    required?: boolean;
}
interface AddNewTemplate {
    icon?: string;
    label?: string;
    desc?: string;
    formFields: PanelFormField[];
}
interface ExpandablePanelGroupProps {
    name: string;
    proSetting?: boolean;
    proSettingChanged?: () => void;
    apilink?: string;
    appLocalizer?: AppLocalizer;
    methods: ExpandablePanelMethod[];
    value: Record<string, Record<string, unknown>>;
    onChange: (data: Record<string, Record<string, unknown>>) => void;
    isWizardMode?: boolean;
    setWizardIndex?: (index: number) => void;
    moduleEnabled?: boolean;
    proChanged?: () => void;
    moduleChange: (module: string) => void;
    modules: string[];
    addNewBtn?: boolean;
    addNewTemplate?: AddNewTemplate;
    requiredEnable?: boolean;
}
const BASIC_RATING_FIELDS: PanelFormField[] = [
    {
        key: 'title',
        type: 'text',
        label: 'Parameters',
        placeholder: 'Enter parameters',
    },
];

const REQUIRED_RATING_FIELDS: PanelFormField[] = [
    ...BASIC_RATING_FIELDS,
    {
        key: 'required',
        type: 'checkbox',
        label: 'Required',
    },
];

const ExpandablePanelGroup: React.FC<ExpandablePanelGroupProps> = ({
    methods,
    value,
    onChange,
    appLocalizer,
    isWizardMode = false,
    proSetting,
    moduleEnabled,
    proChanged,
    moduleChange,
    modules,
    addNewBtn,
    addNewTemplate
}) => {
    const [activeTabs, setActiveTabs] = useState<string[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);
    const [wizardIndex, setWizardIndex] = useState(0);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [iconDropdownOpen, setIconDropdownOpen] = useState<string | null>(null);

    const [ExpandablePanelMethods, setExpandablePanelMethods] = useState<
        ExpandablePanelMethod[]
    >(() =>
        methods.map((method) => {
            if (!method.isCustom) return method;

            const templateFields = addNewTemplate?.formFields ?? [];
            const methodFields = method.formFields ?? [];

            const existingKeys = new Set(methodFields.map(f => f.key));

            return {
                ...method,
                formFields: [
                    ...methodFields,
                    ...templateFields.filter(f => !existingKeys.has(f.key)),
                ],
            };
        })
    );


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    useEffect(() => {
        const updated: Record<string, Record<string, unknown>> = { ...value };

        methods.forEach((method) => {
            if (!updated[method.id]) {
                updated[method.id] = {
                    enable: true,
                    title: method.label ?? '',
                    description: method.desc ?? '',
                    icon: method.icon ?? '',
                    required: method.required ?? false,
                };
            }
        });

        onChange(updated);
    }, []);



    // add new
    const createNewExpandablePanelMethod = (): ExpandablePanelMethod => {
        if (!addNewTemplate) {
            throw new Error('addNewTemplate is required when addNewBtn is true');
        }

        const id = `custom_${Date.now()}`;

        return {
            id,
            icon: addNewTemplate.icon || '',
            label: addNewTemplate.label || 'New Item',
            desc: addNewTemplate.desc || '',
            connected: false,
            isCustom: true,
            formFields: addNewTemplate.formFields.map(field => ({ ...field })),
        };
    };

    const handleAddNewMethod = () => {
        const newMethod = createNewExpandablePanelMethod();

        setExpandablePanelMethods(prev => [...prev, newMethod]);

        const initialValues: Record<string, unknown> = {
            enable: true,
            title: newMethod.label,
            description: '',
            required: false,
        };

        newMethod.formFields?.forEach(field => {
            if (field.type === 'iconlibrary') {
                initialValues[field.key] = '';
            }
        });

        onChange({
            ...value,
            [newMethod.id]: initialValues,
        });

        setActiveTabs(prev => [...prev, newMethod.id]);
    };

    const handleDeleteMethod = (methodId: string) => {
        setExpandablePanelMethods((prev) =>
            prev.filter((m) => m.id !== methodId)
        );

        const updatedValue = { ...value };
        delete updatedValue[methodId];

        onChange(updatedValue);

        setActiveTabs((prev) =>
            prev.filter((id) => id !== methodId)
        );
    };

    const canEdit = () => {
        // You cannot edit if Pro is enabled (locked) OR if module is disabled
        return !proSetting && moduleEnabled;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleInputChange = (
        methodKey: string,
        fieldKey: string,
        fieldValue: string | string[] | number | boolean | undefined
    ) => {
        if (!canEdit()) {
            return;
        }

        const updated = {
            ...value,
            [methodKey]: {
                ...(value[methodKey] as Record<string, unknown>),
                [fieldKey]: fieldValue,
            },
        };

        onChange(updated);
    };

    const toggleEnable = (methodId: string, enable: boolean) => {
        if (!canEdit()) {
            return;
        }
        handleInputChange(methodId, 'enable', enable);
        if (enable) {
            setActiveTabs((prev) =>
                prev.filter((id) => id !== methodId)
            );
        }
    };

    const toggleActiveTab = (methodId: string) => {
        if (!canEdit()) {
            return;
        }
        setActiveTabs(
            (prev) =>
                prev.includes(methodId)
                    ? prev.filter((id) => id !== methodId) // close
                    : [...prev, methodId] // open
        );
    };

    const isProSetting = (val: boolean) => val;

    const handleMultiSelectDeselect = (
        methodId: string,
        field: PanelFormField
    ) => {
        const allValues = Array.isArray(field.options)
            ? field.options.map((opt) => String(opt.value))
            : [];

        const current = value?.[methodId]?.[field.key] || [];

        const currentArray = Array.isArray(current)
            ? current
            : typeof current === 'string' && current.trim() !== ''
                ? [current]
                : [];

        const isAllSelected = currentArray.length === allValues.length;

        const result = isAllSelected ? [] : allValues;

        handleInputChange(methodId, field.key, result);
    };

    const renderWizardButtons = () => {
        const step = ExpandablePanelMethods[wizardIndex];
        const buttonField = step?.formFields?.find(
            (f) => f.type === 'buttons'
        );
        if (!buttonField) {
            return null;
        }

        return renderField(step.id, buttonField);
    };
    const renderField = (methodId: string, field: PanelFormField) => {
        const fieldValue = value[methodId]?.[field.key];

        switch (field.type) {
            case 'setting-toggle':
                return (
                    <ToggleSetting
                        key={field.key}
                        description={field.desc}
                        options={
                            Array.isArray(field.options)
                                ? field.options.map((opt) => ({
                                    ...opt,
                                    value: String(opt.value),
                                }))
                                : []
                        }
                        value={fieldValue || ''}
                        onChange={(val) =>
                            handleInputChange(methodId, field.key, val)
                        }
                    />
                );

            case 'checkbox':
                return (
                    <>
                        <input
                            type="checkbox"
                            checked={!!fieldValue}
                            onChange={(e) =>
                                handleInputChange(
                                    methodId,
                                    field.key,
                                    e.target.checked
                                )
                            }
                        />
                        <div className="settings-metabox-description">
                            {field.desc}
                        </div>
                    </>
                );
            case 'clickable-list':
                return (
                    <div className="clickable-list-wrapper">
                        { /* Render items */}
                        <ul className="clickable-items">
                            {Array.isArray(field.items) &&
                                field.items.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className={`clickable-item ${item.url ? 'has-link' : ''
                                            }`}
                                        onClick={() => {
                                            if (item.url) {
                                                let url = item.url;
                                                window.open(url, '_self');
                                            }
                                        }}
                                    >
                                        {item.name}
                                    </li>
                                ))}
                        </ul>

                        { /* Render bottom button */}
                        {field.button?.label && (
                            <button
                                className="admin-btn btn-purple"
                                onClick={(e) => {
                                    if (field.button.url) {
                                        e.preventDefault();
                                        window.open(
                                            field.button.url,
                                            '_blank'
                                        );
                                    }
                                }}
                            >
                                {field.button.label}
                            </button>
                        )}

                        {field.desc && (
                            <div className="settings-metabox-description">
                                {field.desc}
                            </div>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <TextArea
                        wrapperClass="setting-from-textarea"
                        inputClass={`${field.class || ''} textarea-input`}
                        descClass="settings-metabox-description"
                        description={field.desc || ''}
                        key={field.key}
                        id={field.key}
                        name={field.key}
                        placeholder={field.placeholder}
                        rowNumber={field.rowNumber}
                        colNumber={field.colNumber}
                        value={fieldValue || ''}
                        proSetting={false}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            handleInputChange(methodId, field.key, e.target.value)
                        }
                    />
                );
            case 'multi-checkbox': {
                let normalizedValue: string[] = [];

                if (Array.isArray(fieldValue)) {
                    normalizedValue = fieldValue.filter(
                        (v) => v && v.trim() !== ''
                    );
                } else if (
                    typeof fieldValue === 'string' &&
                    fieldValue.trim() !== ''
                ) {
                    normalizedValue = [fieldValue];
                }

                return (
                    <MultiCheckBox
                        khali_dabba={appLocalizer?.khali_dabba ?? false}
                        wrapperClass={
                            field.look === 'toggle'
                                ? 'toggle-btn'
                                : field.selectDeselect === true
                                    ? 'checkbox-list-side-by-side'
                                    : 'simple-checkbox'
                        }
                        descClass="settings-metabox-description"
                        description={field.desc}
                        selectDeselectClass="admin-btn btn-purple select-deselect-trigger"
                        inputWrapperClass="toggle-checkbox-header"
                        inputInnerWrapperClass={
                            field.look === 'toggle'
                                ? 'toggle-checkbox'
                                : 'default-checkbox'
                        }
                        inputClass={field.class}
                        idPrefix="toggle-switch"
                        selectDeselect={field.selectDeselect}
                        selectDeselectValue="Select / Deselect All"
                        rightContentClass="settings-metabox-description"
                        options={
                            Array.isArray(field.options)
                                ? field.options.map((opt) => ({
                                    ...opt,
                                    value: String(opt.value),
                                }))
                                : []
                        }
                        /* THIS IS THE FIX */
                        value={normalizedValue}
                        onChange={(e: any) => {
                            // Case 1: MultiCheckBox gives an array of selected values (preferred)
                            if (Array.isArray(e)) {
                                handleInputChange(methodId, field.key, e);
                                return;
                            }

                            // Case 2: It's a native/react change event — extract value/checked and build array
                            if (
                                e &&
                                e.target &&
                                typeof e.target.value !== 'undefined'
                            ) {
                                const val = String(e.target.value);
                                const checked = !!e.target.checked;

                                // Current stored value for this field
                                let current =
                                    value?.[methodId]?.[field.key];

                                // Normalize to array
                                if (!Array.isArray(current)) {
                                    if (
                                        typeof current === 'string' &&
                                        current.trim() !== ''
                                    ) {
                                        current = [current];
                                    } else {
                                        current = [];
                                    }
                                } else {
                                    // clone to avoid mutating props/state directly
                                    current = [...current];
                                }

                                if (checked) {
                                    if (!current.includes(val)) {
                                        current.push(val);
                                    }
                                } else {
                                    current = current.filter(
                                        (v: string) => v !== val
                                    );
                                }

                                handleInputChange(
                                    methodId,
                                    field.key,
                                    current
                                );
                                return;
                            }

                            // Fallback: pass simple values only
                            handleInputChange(methodId, field.key, e);
                        }}
                        proSetting={isProSetting(field.proSetting ?? false)}
                        onMultiSelectDeselectChange={() => {
                            handleMultiSelectDeselect(methodId, field);
                        }}
                    />
                );
            }
            case 'description':
                return (
                    <>
                        {field.title ? (
                            <div className="description-wrapper">
                                <div className="title">
                                    <i className="adminlib-error"></i>
                                    {field.title}
                                </div>

                                {field.des && (
                                    <p
                                        className="panel-description"
                                        dangerouslySetInnerHTML={{
                                            __html: field.des,
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            field.des && (
                                <p
                                    className="panel-description"
                                    dangerouslySetInnerHTML={{
                                        __html: field.des,
                                    }}
                                />
                            )
                        )}
                    </>
                );
            case 'setup':
                return (
                    <>
                        <div className="wizard-step">
                            <div
                                className="step-info"
                                onClick={() =>
                                    handleInputChange(
                                        methodId,
                                        field.key,
                                        !fieldValue
                                    )
                                }
                            >
                                {!field.hideCheckbox && (
                                    <div className="default-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={!!fieldValue}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    methodId,
                                                    field.key,
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor={`step-checkbox-${methodId}-${field.key}`}
                                        ></label>
                                    </div>
                                )}
                                <div className="step-text">
                                    <span className="step-title">
                                        {field.title}
                                    </span>
                                    <span className="desc">
                                        {field.des}
                                    </span>
                                </div>
                            </div>
                            {field.link && (
                                <a
                                    href={field.link}
                                    className="admin-btn btn-purple"
                                >
                                    Set Up{' '}
                                    <i className="adminlib-arrow-right"></i>{' '}
                                </a>
                            )}
                        </div>
                    </>
                );
            case 'check-list':
                return (
                    <>
                        <ul className="check-list">
                            {Array.isArray(field.options) &&
                                field.options.map(
                                    (item: FieldOption, index: number) => (
                                        <li key={index}>
                                            {item.check ? (
                                                <i className="check adminlib-icon-yes"></i>
                                            ) : (
                                                <i className="close adminlib-cross"></i>
                                            )}
                                            {item.desc}
                                        </li>
                                    )
                                )}
                        </ul>
                    </>
                );

            case 'copy-text':
                return (
                    <>
                        <div className="copy-text-wrapper">
                            <code>{field.title}</code>
                            <i
                                className="adminlib-vendor-form-copy"
                                onClick={() => handleCopy(field.title)}
                            ></i>
                        </div>
                        <div className="settings-metabox-description">
                            {field.desc}
                        </div>
                    </>
                );

            case 'buttons':
                return (
                    <>
                        {Array.isArray(field.options) &&
                            field.options.map((item, index) => {
                                const wizardSteps = ExpandablePanelMethods.filter(
                                    (m) => m.isWizardMode === true
                                );
                                const isLastStep =
                                    wizardIndex === wizardSteps.length - 1;

                                // Skip Button
                                if (item.action === 'skip') {
                                    return (
                                        <button
                                            key={index}
                                            className={item.btnClass}
                                            onClick={() => {
                                                setWizardIndex(
                                                    methods.length
                                                );
                                                let url = `${appLocalizer.site_url}`;
                                                window.open(url, '_self');
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                }

                                // Next / Finish Button
                                if (item.action === 'next') {
                                    return (
                                        <button
                                            key={index}
                                            className={item.btnClass}
                                            onClick={() => {
                                                if (!isLastStep) {
                                                    const allWizardSteps =
                                                        methods
                                                            .map(
                                                                (m, i) => ({
                                                                    ...m,
                                                                    index: i,
                                                                })
                                                            )
                                                            .filter(
                                                                (m) =>
                                                                    m.isWizardMode ===
                                                                    true
                                                            );

                                                    const nextWizardStep =
                                                        allWizardSteps[
                                                        wizardIndex + 1
                                                        ];

                                                    if (nextWizardStep) {
                                                        setWizardIndex(
                                                            nextWizardStep.index
                                                        );
                                                        setActiveTabs([
                                                            nextWizardStep.id,
                                                        ]);
                                                    }
                                                } else {
                                                    let url = `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`;
                                                    window.open(url, '_self');
                                                }
                                            }}
                                        >
                                            {isLastStep
                                                ? 'Finish'
                                                : item.label}
                                        </button>
                                    );
                                }

                                return (
                                    <div
                                        key={index}
                                        className={item.btnClass}
                                    >
                                        {item.label}
                                    </div>
                                );
                            })}
                    </>
                );

            case 'nested':
                return (
                    <NestedComponent
                        key={field.key}
                        id={field.key}
                        label={field.label}
                        description={field.desc}
                        fields={field.nestedFields ?? []}
                        value={fieldValue}
                        wrapperClass={field.rowClass}
                        addButtonLabel={field.addButtonLabel}
                        deleteButtonLabel={field.deleteButtonLabel}
                        single={field.single}
                        onChange={(val: any) => {
                            handleInputChange(methodId, field.key, val);
                        }}
                    />
                );

            case 'iconlibrary': {
                const iconEnable = field.iconEnable ?? true;
                const iconOptions = field.iconOptions ?? [];
                const selectedIcon = fieldValue as string;

                const dropdownKey = `${methodId}_${field.key}`;
                const isOpen = iconDropdownOpen === dropdownKey;

                if (!iconEnable || iconOptions.length === 0) {
                    return null;
                }

                return (
                    <div className="icon-library-wrapper">
                        <div
                            className="selected-icon"
                            onClick={() =>
                                setIconDropdownOpen(
                                    isOpen ? null : dropdownKey
                                )
                            }
                        >
                            {selectedIcon ? (
                                <i className={selectedIcon}></i>
                            ) : (
                                <span>Select Icon</span>
                            )}
                            <span className="dropdown-arrow">▾</span>
                        </div>

                        {isOpen && (
                            <ul className="icon-options-list">
                                {iconOptions.map((icon) => (
                                    <li
                                        key={icon}
                                        className={`icon-option ${selectedIcon === icon ? 'selected' : ''
                                            }`}
                                        onClick={() => {
                                            handleInputChange(
                                                methodId,
                                                field.key,
                                                icon
                                            );
                                            setIconDropdownOpen(null);
                                        }}
                                    >
                                        <i className={icon}></i>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {field.desc && (
                            <div className="settings-metabox-description">
                                {field.desc}
                            </div>
                        )}
                    </div>
                );
            }

            default:
                return (
                    <>
                        <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={fieldValue || ''}
                            className="basic-input"
                            onChange={(e) =>
                                handleInputChange(
                                    methodId,
                                    field.key,
                                    e.target.value
                                )
                            }
                        />
                        <div className="settings-metabox-description">
                            {field.desc}
                        </div>
                    </>
                );
        }
    };

    return (
        <>
            <div className="expandable-panel-group">
                {ExpandablePanelMethods.map((method, index) => {
                    const isEnabled = value?.[method.id]?.enable ?? false;
                    const isActive = activeTabs.includes(method.id);
                    const headerIcon = (value?.[method.id]?.icon as string) || method.icon;

                    if (isWizardMode && index > wizardIndex) {
                        return null;
                    }

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
                                    !method.openForm && (
                                        <div className="toggle-icon">
                                            <i
                                                className={`adminlib-${isEnabled && isActive
                                                    ? 'keyboard-arrow-down'
                                                    : 'pagination-right-arrow'
                                                    }`}
                                                onClick={() => {
                                                    if (
                                                        method.proSetting &&
                                                        !appLocalizer?.khali_dabba
                                                    ) {
                                                        proChanged?.();
                                                        return;
                                                    } else if (
                                                        method.moduleEnabled &&
                                                        !modules.includes(
                                                            method.moduleEnabled
                                                        )
                                                    ) {
                                                        moduleChange?.(
                                                            method.moduleEnabled
                                                        );
                                                        return;
                                                    } else {
                                                        toggleActiveTab(
                                                            method.id
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}

                                <div
                                    className="details"
                                    onClick={() => {
                                        if (
                                            method.proSetting &&
                                            !appLocalizer?.khali_dabba
                                        ) {
                                            proChanged?.();
                                            return;
                                        } else if (
                                            method.moduleEnabled &&
                                            !modules.includes(
                                                method.moduleEnabled
                                            )
                                        ) {
                                            moduleChange?.(
                                                method.moduleEnabled
                                            );
                                            return;
                                        } else {
                                            toggleActiveTab(method.id);
                                        }
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
                                                    {(value?.[method.id]?.title as string) || method.label}
                                                </span>
                                                <div className="panel-badges">
                                                    {method.disableBtn && (
                                                        <div
                                                            className={`admin-badge ${isEnabled ? 'green' : 'red'}`}
                                                        >
                                                            {isEnabled ? 'Active' : 'Inactive'}
                                                        </div>
                                                    )}
                                                    {!!(method.required || value?.[method.id]?.required) && (
                                                        <div className="admin-badge red">
                                                            Required
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                            <div className="panel-description">
                                                <p
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            (value?.[method.id]?.description as string) ||
                                                            method.desc,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="right-section" ref={menuRef}>
                                    {method.disableBtn ? (
                                        <ul>
                                            {isEnabled ? (
                                                <>
                                                    {method.formFields &&
                                                        method.formFields
                                                            .length > 0 && (
                                                            <li
                                                                onClick={() => {
                                                                    if (
                                                                        method.proSetting &&
                                                                        !appLocalizer?.khali_dabba
                                                                    ) {
                                                                        proChanged?.();
                                                                        return;
                                                                    } else if (
                                                                        method.moduleEnabled &&
                                                                        !modules.includes(
                                                                            method.moduleEnabled
                                                                        )
                                                                    ) {
                                                                        moduleChange?.(
                                                                            method.moduleEnabled
                                                                        );
                                                                        return;
                                                                    } else {
                                                                        toggleActiveTab(
                                                                            method.id
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <span className="admin-btn btn-blue">
                                                                    <i className="adminlib-setting"></i>
                                                                    Settings
                                                                </span>
                                                            </li>
                                                        )}
                                                </>
                                            ) : (
                                                <li
                                                    onClick={() => {
                                                        if (
                                                            method.proSetting &&
                                                            !appLocalizer?.khali_dabba
                                                        ) {
                                                            proChanged?.();
                                                            return;
                                                        } else if (
                                                            method.moduleEnabled &&
                                                            !modules.includes(
                                                                method.moduleEnabled
                                                            )
                                                        ) {
                                                            moduleChange?.(
                                                                method.moduleEnabled
                                                            );
                                                            return;
                                                        } else {
                                                            toggleEnable(
                                                                method.id,
                                                                true
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <span className="admin-btn btn-green"><i className="adminlib-eye"></i> Enable</span>
                                                </li>
                                            )}
                                        </ul>
                                    ) : method.countBtn ? (
                                        <div className="admin-badge red">
                                            1/3
                                        </div>
                                    ) : null}
                                    {method.isCustom && (
                                        <>
                                            <div onClick={() => { toggleActiveTab(method.id) }} className="admin-btn btn-blue">
                                                <i className="adminlib-edit"></i>
                                                Edit
                                            </div>
                                        </>
                                    )}
                                    {/* show dropdown */}
                                    {(isEnabled || method.isCustom) && (
                                        <div className="icon-wrapper" ref={wrapperRef}>
                                            <i
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownId((prev) =>
                                                        prev === method.id ? null : method.id
                                                    );
                                                }}
                                                className="admin-icon adminlib-more-vertical">
                                            </i>
                                            {openDropdownId === method.id && (
                                                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                                                    <div className="dropdown-body">
                                                        <ul>
                                                            {method.disableBtn ? (
                                                                <>
                                                                    {isEnabled ? (
                                                                        <>
                                                                            {method.formFields &&
                                                                                method.formFields
                                                                                    .length > 0 && (
                                                                                    <li
                                                                                        onClick={() => {
                                                                                            if (
                                                                                                method.proSetting &&
                                                                                                !appLocalizer?.khali_dabba
                                                                                            ) {
                                                                                                proChanged?.();
                                                                                                return;
                                                                                            } else if (
                                                                                                method.moduleEnabled &&
                                                                                                !modules.includes(
                                                                                                    method.moduleEnabled
                                                                                                )
                                                                                            ) {
                                                                                                moduleChange?.(
                                                                                                    method.moduleEnabled
                                                                                                );
                                                                                                return;
                                                                                            } else {
                                                                                                toggleActiveTab(
                                                                                                    method.id
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <span className="item">
                                                                                            <i className="adminlib-setting"></i>
                                                                                            Settings
                                                                                        </span>
                                                                                    </li>
                                                                                )}
                                                                        </>
                                                                    ) : (
                                                                        <li
                                                                            onClick={() => {
                                                                                if (
                                                                                    method.proSetting &&
                                                                                    !appLocalizer?.khali_dabba
                                                                                ) {
                                                                                    proChanged?.();
                                                                                    return;
                                                                                } else if (
                                                                                    method.moduleEnabled &&
                                                                                    !modules.includes(
                                                                                        method.moduleEnabled
                                                                                    )
                                                                                ) {
                                                                                    moduleChange?.(
                                                                                        method.moduleEnabled
                                                                                    );
                                                                                    return;
                                                                                } else {
                                                                                    toggleEnable(
                                                                                        method.id,
                                                                                        true
                                                                                    );
                                                                                }
                                                                            }}
                                                                        >
                                                                            <span className="item"><i className="adminlib-eye"></i> Enable</span>
                                                                        </li>
                                                                    )}
                                                                </>
                                                            ) : null}
                                                            {(method.isCustom && method.required) && (
                                                                <>
                                                                    <li onClick={() => { toggleActiveTab(method.id) }}>
                                                                        <div className="item">
                                                                            <i className="adminlib-edit"></i>
                                                                            Edit
                                                                        </div>
                                                                    </li>
                                                                    <li onClick={() => handleDeleteMethod(method.id)} className="delete">
                                                                        <div className="item">
                                                                            <i className="adminlib-delete"></i>
                                                                            Delete
                                                                        </div>
                                                                    </li>
                                                                </>
                                                            )}
                                                            {isEnabled && !method.isCustom && (
                                                                <li
                                                                    className="delete"
                                                                    onClick={() => {
                                                                        if (
                                                                            method.proSetting &&
                                                                            !appLocalizer?.khali_dabba
                                                                        ) {
                                                                            proChanged?.();
                                                                            return;
                                                                        } else if (
                                                                            method.moduleEnabled &&
                                                                            !modules.includes(
                                                                                method.moduleEnabled
                                                                            )
                                                                        ) {
                                                                            moduleChange?.(
                                                                                method.moduleEnabled
                                                                            );
                                                                            return;
                                                                        } else {
                                                                            toggleEnable(
                                                                                method.id,
                                                                                false
                                                                            );
                                                                        }
                                                                    }}>
                                                                    <div className="item">
                                                                        <i className="adminlib-eye-blocked"></i>
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
                                        className={`${method.wrapperClass || ''} expandable-panel ${(isActive || method.openForm) && (!isEnabled || isEnabled) ? 'open' : ''} ${method.openForm ? 'open' : ''}`}
                                    >
                                        {method.formFields.map((field) => {
                                            if (field.key === 'required' && method.required === true) {
                                                return null;
                                            }
                                            if (isWizardMode && field.type === 'buttons') {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={field.key}
                                                    className="form-group"
                                                >
                                                    {field.label && (
                                                        <label>
                                                            {field.label}
                                                        </label>
                                                    )}
                                                    <div className="input-content">
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
            </div>
            {/* {addNewBtn && ( */}
            {addNewBtn && (
                <div className="buttons-wrapper">
                    <div
                        className="admin-btn btn-purple"
                        onClick={handleAddNewMethod}
                    >
                        <i className="adminlib-plus"></i> Add New
                    </div>
                </div>
            )}

            {isWizardMode && (
                <div className="buttons-wrapper">
                    {renderWizardButtons()}
                </div>
            )}
        </>
    );
};

export default ExpandablePanelGroup;
