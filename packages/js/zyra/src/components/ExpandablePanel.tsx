import React, {
    JSX,
    useEffect,
    useRef,
    useReducer,
    useCallback,
    useContext,
    createContext,
} from 'react';
import '../styles/web/ExpandablePanel.scss';
import { getApiLink } from '../utils/apiService';
import axios from 'axios';
import { FieldComponent, FIELD_REGISTRY, ZyraVariable } from './fieldUtils';
import FormGroup from './UI/FormGroup';
import { ButtonInputUI } from './ButtonInput';
import FormGroupWrapper from './UI/FormGroupWrapper';
import { BasicInputUI } from './BasicInput';
import { PopupUI } from './Popup';
import { ItemListUI } from './ItemList';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FieldOption {
    value: string | number;
    label: string;
    desc?: string;
    action?: string;
    redirect?: string;
}

interface PanelFormField {
    key: string;
    type: string;
    label: string;
    name?: string;
    desc?: string;
    options?: FieldOption[];
    beforeElement?: React.ReactNode;
    [key: string]: unknown;
}

interface ExpandablePanelMethod {
    id: string;
    icon: string;
    label: string;
    desc: string;
    settingDescription: string;
    connected?: boolean;
    formFields?: PanelFormField[];
    wrapperClass?: string;
    openForm?: boolean;
    isCustom?: boolean;
    disableBtn?: boolean;
    hideDeleteBtn?: boolean;
    countBtn?: boolean;
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
    };
}

interface ExpandablePanelProps {
    name: string;
    apilink?: string;
    methods: ExpandablePanelMethod[];
    value: Record<string, Record<string, unknown>>;
    onChange: (data: Record<string, Record<string, unknown>>) => void;
    isWizardMode?: boolean;
    canAccess: boolean;
    addNewBtn?: boolean;
    addNewTemplate?: AddNewTemplate;
    min?: number;
    onBlocked?: (type: 'pro' | 'plugin', payload?: unknown) => void;
}

// ── State Types ───────────────────────────────────────────────────────────────

type PanelState = {
    methods: ExpandablePanelMethod[];
    activeTab: string | null;
    wizardIndex: number;
    progress: number[];
    openDropdown: string | null;
    iconDropdown: string | null;
    editId: string | null;
    editField: 'title' | 'description' | null;
    editTitle: string;
    editDesc: string;
};

type PanelAction =
    | { type: 'SET_METHODS'; methods: ExpandablePanelMethod[] }
    | { type: 'SET_ACTIVE_TAB'; id: string | null }
    | { type: 'SET_WIZARD_INDEX'; index: number }
    | { type: 'SET_PROGRESS'; progress: number[] }
    | { type: 'SET_OPEN_DROPDOWN'; id: string | null }
    | { type: 'SET_ICON_DROPDOWN'; id: string | null }
    | {
        type: 'START_EDIT';
        id: string;
        field: 'title' | 'description';
        title?: string;
        desc?: string;
    }
    | { type: 'UPDATE_EDIT_TITLE'; title: string }
    | { type: 'UPDATE_EDIT_DESC'; desc: string }
    | { type: 'COMMIT_EDIT' }
    | { type: 'CANCEL_EDIT' }
    | { type: 'ADD_METHOD'; method: ExpandablePanelMethod }
    | { type: 'DELETE_METHOD'; id: string };

type DependentField = {
    key: string;
    set?: boolean;
    value?: string | number | boolean;
};

// ── Context Types ─────────────────────────────────────────────────────────────

interface PanelContextType {
    state: PanelState;
    dispatch: React.Dispatch<PanelAction>;
    value: Record<string, Record<string, unknown>>;
    isWizardMode: boolean;
    canAccess: boolean;
    addNewTemplate?: AddNewTemplate;
    tplFields: PanelFormField[];
    titleRef: React.RefObject<HTMLInputElement>;
    descRef: React.RefObject<HTMLTextAreaElement>;
    iconPicker: React.RefObject<HTMLDivElement>;
    dependent?: DependentField | DependentField[];
    handleChange: (methodId: string, key: string, val: unknown) => void;
    handleDelete: (methodId: string) => void;
    canDelete: () => boolean;
    renderField: (
        methodId: string,
        field: PanelFormField
    ) => JSX.Element | null;
    commitEdit: () => void;
    shouldRender: (dependent: DependentField, methodId: string) => boolean;
}

interface PanelItemContextType {
    method: ExpandablePanelMethod;
    methodValue: Record<string, unknown>;
    idx: number;
    isOn: boolean;
    isOpen: boolean;
    hasFields: boolean;
    icon: string;
    title: string;
    desc: string;
    price: { price: string; unit: string } | null;
    cntFlds: PanelFormField[];
}

// ── Context Creation ──────────────────────────────────────────────────────────

const PanelContext = createContext<PanelContextType | null>(null);
const PanelItemContext = createContext<PanelItemContextType | null>(null);

// ── Custom Hooks ─────────────────────────────────────────────────────────────

const usePanel = () => {
    const context = useContext(PanelContext);
    if (!context) {
        throw new Error('usePanel must be used within PanelProvider');
    }
    return context;
};

const usePanelItem = () => {
    const context = useContext(PanelItemContext);
    if (!context) {
        throw new Error('usePanelItem must be used within PanelItemProvider');
    }
    return context;
};

// ── Reducer ───────────────────────────────────────────────────────────────────

const panelReducer = (state: PanelState, action: PanelAction): PanelState => {
    switch (action.type) {
        case 'SET_METHODS':
            return { ...state, methods: action.methods };
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.id };
        case 'SET_WIZARD_INDEX':
            return { ...state, wizardIndex: action.index };
        case 'SET_PROGRESS':
            return { ...state, progress: action.progress };
        case 'SET_OPEN_DROPDOWN':
            return { ...state, openDropdown: action.id };
        case 'SET_ICON_DROPDOWN':
            return { ...state, iconDropdown: action.id };
        case 'START_EDIT':
            return {
                ...state,
                editId: action.id,
                editField: action.field,
                editTitle: action.title || '',
                editDesc: action.desc || '',
            };
        case 'UPDATE_EDIT_TITLE':
            return { ...state, editTitle: action.title };
        case 'UPDATE_EDIT_DESC':
            return { ...state, editDesc: action.desc };
        case 'COMMIT_EDIT':
        case 'CANCEL_EDIT':
            return {
                ...state,
                editId: null,
                editField: null,
                editTitle: '',
                editDesc: '',
            };
        case 'ADD_METHOD':
            return {
                ...state,
                methods: [...state.methods, action.method],
                activeTab: action.method.id,
            };
        case 'DELETE_METHOD':
            return {
                ...state,
                methods: state.methods.filter((m) => m.id !== action.id),
                activeTab:
                    state.activeTab === action.id ? null : state.activeTab,
            };
        default:
            return state;
    }
};

// ── Pure helpers ──────────────────────────────────────────────────────────────

const isCountableField = (f: PanelFormField) =>
    f.type !== 'button' && f.type !== 'notice';

const isFilled = (val: unknown): boolean => {
    if (val === null || val === undefined) {
        return false;
    }
    if (typeof val === 'string') {
        return val.trim() !== '';
    }
    if (Array.isArray(val)) {
        return val.length > 0;
    }
    return true;
};

const mergeTemplateFields = (
    method: ExpandablePanelMethod,
    tplFields: PanelFormField[]
): ExpandablePanelMethod => {
    if (!tplFields.length) {
        return method;
    }
    const existing = new Set((method.formFields ?? []).map((f) => f.key));
    return {
        ...method,
        formFields: [
            ...(method.formFields ?? []),
            ...tplFields.filter((f) => !existing.has(f.key)),
        ],
    };
};

const formatPrice = (methodValue: Record<string, unknown>) => {
    const { price, unit } = methodValue;
    if (price === null || price === undefined || price === '') {
        return null;
    }
    return {
        price: typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`,
        unit: unit ? String(unit) : '',
    };
};

const canEditField = (
    method: ExpandablePanelMethod,
    field: 'title' | 'description',
    tpl?: AddNewTemplate
): boolean => {
    if (!method.isCustom) {
        return false;
    }
    return !tpl?.editableFields || tpl.editableFields[field] !== false;
};

// ── Sub-Components ────────────────────────────────────────────────────────────

const PanelHeader: React.FC = () => {
    const {
        state,
        dispatch,
        addNewTemplate,
        titleRef,
        descRef,
        iconPicker,
        handleChange,
        commitEdit,
        isWizardMode,
    } = usePanel();

    const { method, methodValue, isOpen, isOn, hasFields, icon, title, desc } =
        usePanelItem();

    const editing = state.editId === method.id;
    const editField = state.editField;
    const editTitle = state.editTitle;
    const editDesc = state.editDesc;
    const iconDropdown = state.iconDropdown;

    const showToggleIcon = (method.disableBtn && !method.isCustom) || 
                          (isWizardMode && method.isWizardMode);

    const shouldShowToggleButton = () => {
        // if (!showToggleIcon) return false;
        
        if (isWizardMode && method.isWizardMode) {
            return hasFields;
        }
        return hasFields && isOn;
    };

    return (
        <div className="expandable-header">
           {showToggleIcon && (
                <div className="toggle-icon">
                    {shouldShowToggleButton() && (
                        <i
                            className={`adminfont-${
                                isOpen
                                    ? 'keyboard-arrow-down'
                                    : 'pagination-right-arrow'
                            }`}
                            onClick={() =>
                                dispatch({
                                    type: 'SET_ACTIVE_TAB',
                                    id: isOpen ? null : method.id,
                                })
                            }
                        />
                    )}
                </div>
            )}

            <div
                className={`header-details ${showToggleIcon ? 'toggle' : ''}`}
                onClick={() => {
                    // Don't toggle if clicking on editable field
                    const target = window.event?.target as HTMLElement;
                    if (target?.closest('.editable-title, .editable-description, .inline-edit-icon')) {
                        return;
                    }
                    dispatch({
                        type: 'SET_ACTIVE_TAB',
                        id: isOpen ? null : method.id,
                    })
                }}
            >
                <div className="details-wrapper">
                    {/* Icon picker */}
                    {icon && (
                        <div
                            className="expandable-header-icon"
                            ref={iconDropdown === method.id ? iconPicker : null}
                            onClick={(e) => {
                                if (!method.iconEnable) {
                                    return;
                                }
                                // e.stopPropagation();
                                dispatch({
                                    type: 'SET_ICON_DROPDOWN',
                                    id:
                                        iconDropdown === method.id
                                            ? null
                                            : method.id,
                                });
                            }}
                        >
                            <i className={`adminfont-${icon} icon`} />
                            {method.iconEnable &&
                                iconDropdown !== method.id && (
                                    <i className="adminfont-edit edit-icon" />
                                )}
                            {method.iconEnable &&
                                iconDropdown === method.id && (
                                    <div
                                        className="icon-options-list"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {(
                                            method.iconOptions ??
                                            addNewTemplate?.iconOptions ??
                                            []
                                        ).map((cls) => (
                                            <button
                                                key={cls}
                                                type="button"
                                                className={`icon-option ${icon === cls
                                                        ? 'selected'
                                                        : ''
                                                    }`}
                                                onClick={() => {
                                                    handleChange(
                                                        method.id,
                                                        'icon',
                                                        cls
                                                    );
                                                    dispatch({
                                                        type: 'SET_ICON_DROPDOWN',
                                                        id: null,
                                                    });
                                                }}
                                                title={cls}
                                            >
                                                <i
                                                    className={`adminfont-${cls}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                        </div>
                    )}

                    <div className="expandable-header-info">
                        {/* Title (inline-editable for custom) */}
                        <div className="title-wrapper">
                            {editing &&
                                editField === 'title' &&
                                canEditField(
                                    method,
                                    'title',
                                    addNewTemplate
                                ) ? (
                                    <BasicInputUI
                                        ref={titleRef}
                                        value={editTitle}
                                        onChange={(value: string) =>
                                            dispatch({
                                                type: 'UPDATE_EDIT_TITLE',
                                                title: value,
                                            })
                                        }
                                        onKeyDown={(e: React.KeyboardEvent) =>
                                            e.key === 'Enter' && commitEdit()
                                        }
                                        onClick={(e: React.MouseEvent) =>
                                            e.stopPropagation()
                                        }
                                    />
                                ) : (
                                    <span
                                        className={`title ${canEditField(
                                            method,
                                            'title',
                                            addNewTemplate
                                        )
                                                ? 'editable-title'
                                                : ''
                                            }`}
                                        onClick={(e) => {
                                            // e.stopPropagation();
                                            if (
                                                canEditField(
                                                    method,
                                                    'title',
                                                    addNewTemplate
                                                )
                                            ) {
                                                dispatch({
                                                    type: 'START_EDIT',
                                                    id: method.id,
                                                    field: 'title',
                                                    title:
                                                        (methodValue.title as string) ||
                                                        method.label ||
                                                        '',
                                                });
                                            }
                                        }}
                                        title={
                                            canEditField(
                                                method,
                                                'title',
                                                addNewTemplate
                                            )
                                                ? 'Click to edit'
                                                : undefined
                                        }
                                    >
                                        {title}
                                        {canEditField(
                                            method,
                                            'title',
                                            addNewTemplate
                                        ) && (
                                                <i className="adminfont-edit inline-edit-icon" />
                                            )}
                                    </span>
                                )}

                            {/* Active/Inactive badge — predefined disableBtn methods only */}
                            {method.disableBtn && !method.isCustom && (
                                <div className="panel-badges">
                                    <div
                                        className={`admin-badge ${isOn ? 'green' : 'red'
                                            }`}
                                    >
                                        {isOn ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description (inline-editable for custom) */}
                        <div className="panel-description">
                            {editing &&
                                editField === 'description' &&
                                canEditField(
                                    method,
                                    'description',
                                    addNewTemplate
                                ) ? (
                                <textarea
                                    ref={descRef}
                                    className="description-edit"
                                    value={editDesc}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'UPDATE_EDIT_DESC',
                                            desc: e.target.value,
                                        })
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        e.ctrlKey &&
                                        commitEdit()
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    rows={3}
                                />
                            ) : (
                                <div
                                    className={
                                        canEditField(
                                            method,
                                            'description',
                                            addNewTemplate
                                        )
                                            ? 'editable-description'
                                            : undefined
                                    }
                                    onClick={(e) => {
                                        // e.stopPropagation();
                                        if (
                                            canEditField(
                                                method,
                                                'description',
                                                addNewTemplate
                                            )
                                        ) {
                                            dispatch({
                                                type: 'START_EDIT',
                                                id: method.id,
                                                field: 'description',
                                                desc:
                                                    (methodValue.description as string) ||
                                                    method.desc ||
                                                    '',
                                            });
                                        }
                                    }}
                                    title={
                                        canEditField(
                                            method,
                                            'description',
                                            addNewTemplate
                                        )
                                            ? 'Click to edit'
                                            : undefined
                                    }
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: desc,
                                        }}
                                    />
                                    {canEditField(
                                        method,
                                        'description',
                                        addNewTemplate
                                    ) && (
                                            <i className="adminfont-edit inline-edit-icon" />
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <PanelControls />
        </div>
    );
};

const PanelControls: React.FC = () => {
    const { state, dispatch, handleChange, handleDelete, canDelete } =
        usePanel();

    const { method, isOn, isOpen, hasFields, price, cntFlds, idx } =
        usePanelItem();

    return (
        <div className="right-section">
            {price && (
                <span className="price-field">
                    {price.price}
                    {price.unit && <span className="desc">{price.unit}</span>}
                </span>
            )}

            <ul className="settings-btn">
                {/* Delete — custom only, respects minimum count */}
                {method.isCustom && !method.hideDeleteBtn && canDelete() && (
                    <ButtonInputUI
                        buttons={[
                            {
                                icon: 'delete',
                                text: 'Delete',
                                color: 'red-color',
                                onClick: () => handleDelete(method.id),
                            },
                        ]}
                    />
                )}

                {/* PREDEFINED (disableBtn, non-custom) */}
                {method.disableBtn &&
                    !method.isCustom &&
                    (isOn ? (
                        hasFields && (
                            <ButtonInputUI
                                buttons={[
                                    {
                                        icon: 'setting',
                                        text: 'Settings',
                                        color: 'purple',
                                        onClick: () =>
                                            dispatch({
                                                type: 'SET_ACTIVE_TAB',
                                                id: isOpen ? null : method.id,
                                            }),
                                    },
                                ]}
                            />
                        )
                    ) : (
                        <li
                            onClick={() =>
                                handleChange(method.id, 'enable', true)
                            }
                        >
                            <span className="admin-btn btn-purple-bg">
                                <i className="adminfont-eye" /> Enable
                            </span>
                        </li>
                    ))}

                {/* CUSTOM (isCustom) */}
                {method.isCustom &&
                    method.disableBtn &&
                    (isOn ? (
                        <ButtonInputUI
                            buttons={[
                                {
                                    icon: 'eye-blocked',
                                    text: 'Hide',
                                    color: 'purple',
                                    onClick: () =>
                                        handleChange(
                                            method.id,
                                            'enable',
                                            false
                                        ),
                                },
                            ]}
                        />
                    ) : (
                        <li
                            onClick={() =>
                                handleChange(method.id, 'enable', true)
                            }
                        >
                            <span className="admin-btn btn-purple-bg">
                                <i className="adminfont-eye" /> Show
                            </span>
                        </li>
                    ))}

                {/* Progress counter (non-disableBtn methods only) */}
                {!method.disableBtn &&
                    method.countBtn &&
                    cntFlds.length > 0 && (() => {
                        const completed = (state.progress[idx] || 0) === cntFlds.length;

                        return (
                            <div className={`admin-badge ${completed ? 'green' : 'red'}`}>
                                <i className={`adminfont-${completed ? 'check' : 'error'}`} />
                                {completed
                                    ? "Complete"
                                    : `${state.progress[idx] || 0} of ${cntFlds.length} done`}
                            </div>
                        );
                    })()}
            </ul>

            {/* 3-dot dropdown — non-custom, enabled methods */}
            {!method.isCustom && isOn && (
                <div className="icon-wrapper">
                    <PopupUI position="menu-dropdown" toggleIcon="more-vertical" tooltipName="Settings">
                        <ItemListUI
                            items={[
                                ...(method.disableBtn && hasFields
                                    ? [
                                        {
                                            id: 'settings',
                                            title: 'Settings',
                                            icon: 'setting',
                                            action: (item, e) => {
                                                e?.stopPropagation();

                                                dispatch({
                                                    type: 'SET_ACTIVE_TAB',
                                                    id: isOpen ? null : method.id,
                                                });

                                                dispatch({
                                                    type: 'SET_OPEN_DROPDOWN',
                                                    id: null,
                                                });
                                            },
                                        },
                                    ]
                                    : []),

                                {
                                    id: 'disable',
                                    title: 'Disable',
                                    icon: 'eye-blocked',
                                    className: 'delete',
                                    action: (item, e) => {
                                        e?.stopPropagation();

                                        handleChange(method.id, 'enable', false);

                                        dispatch({
                                            type: 'SET_OPEN_DROPDOWN',
                                            id: null,
                                        });
                                    },
                                },
                            ]}
                        />
                    </PopupUI>
                </div>
            )}
        </div>
    );
};

const PanelBody: React.FC = () => {
    const { isWizardMode, renderField, shouldRender } = usePanel();

    const { method, isOpen, isOn } = usePanelItem();

    const hasFields = Boolean(method.formFields?.length);

    if (!hasFields) {
        return null;
    }
    if (!(isOpen && (isOn || method.isCustom || method.openForm))) {
        return null;
    }

    return (
        <div
            className={`${method.wrapperClass ?? ''
                } expandable-panel open`.trim()}
        >
            <FormGroupWrapper>
                {method.formFields!.map((field) => {
                    if (isWizardMode && field.key === 'wizardButtons') {
                        return null;
                    }
                    const shouldShowField = Array.isArray(field.dependent)
                        ? field.dependent.every((dep) =>
                            shouldRender(dep, method.id)
                        )
                        : field.dependent
                            ? shouldRender(field.dependent, method.id)
                            : true;

                    if (!shouldShowField) {
                        return null;
                    }

                    return (
                        <FormGroup
                            row
                            key={field.key}
                            label={
                                field.type !== 'notice'
                                    ? field.label
                                    : undefined
                            }
                            desc={field.desc}
                            labelDes={field.settingDescription}
                            htmlFor={field.name}
                        >
                            {field.beforeElement &&
                                renderField(
                                    method.id,
                                    field.beforeElement as PanelFormField
                                )}
                            {renderField(method.id, field)}
                        </FormGroup>
                    );
                })}
            </FormGroupWrapper>
        </div>
    );
};

const PanelItem: React.FC<{
    method: ExpandablePanelMethod;
    idx: number;
}> = ({ method, idx }) => {
    const { state, value } = usePanel();
    const itemRef = useRef<HTMLDivElement>(null);

    // Cache methodValue once - KEY OPTIMIZATION
    const methodValue = value[method.id] ?? {};

    const isOn = method.isCustom
        ? methodValue.enable !== false
        : Boolean(methodValue.enable);
    const isOpen = state.activeTab === method.id;
    const hasFields = Boolean(method.formFields?.length);
    const icon = (methodValue.icon as string) || method.icon;
    const price = formatPrice(methodValue);
    const title = (methodValue.title as string) || method.label;
    const desc = (methodValue.description as string) || method.desc;
    const cntFlds = method.formFields?.filter(isCountableField) ?? [];
    useEffect(() => {
        if (isOpen && itemRef.current) {
            const top =
                itemRef.current.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: top - 20,
                behavior: 'smooth',
            });
        }
    }, [isOpen]);

    const itemContextValue: PanelItemContextType = {
        method,
        methodValue,
        idx,
        isOn,
        isOpen,
        hasFields,
        icon,
        title,
        desc,
        price,
        cntFlds,
    };

    return (
        <PanelItemContext.Provider value={itemContextValue}>
            <div
                ref={itemRef}
                className={[
                    'expandable-item',
                    method.disableBtn && !isOn ? 'disable' : '',
                    method.openForm ? 'open' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <PanelHeader />
                <PanelBody />
            </div>
        </PanelItemContext.Provider>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const ExpandablePanelUI: React.FC<ExpandablePanelProps> = ({
    methods: initialMethods,
    value,
    onChange,
    apilink,
    isWizardMode = false,
    canAccess,
    addNewBtn,
    addNewTemplate,
    min,
    onBlocked,
}) => {
    const tplFields = addNewTemplate?.formFields ?? [];

    // ── useReducer ────────────────────────────────────────────────────────────
    const [state, dispatch] = useReducer(panelReducer, {
        methods: initialMethods.map((m) =>
            m.isCustom ? mergeTemplateFields(m, tplFields) : m
        ),
        activeTab: null,
        wizardIndex: 0,
        progress: [],
        openDropdown: null,
        iconDropdown: null,
        editId: null,
        editField: null,
        editTitle: '',
        editDesc: '',
    });

    // ── Refs ──────────────────────────────────────────────────────────────────
    const titleRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const iconPicker = useRef<HTMLDivElement>(null);

    // ── Core handler (memoized) ───────────────────────────────────────────────
    const handleChange = useCallback(
        (methodId: string, key: string, val: unknown) => {
            if (key === 'wizardButtons') {
                return;
            }
            onChange({
                ...value,
                [methodId]: { ...(value[methodId] ?? {}), [key]: val },
            });
        },
        [onChange, value]
    );

    // ── Helper to commit edit ─────────────────────────────────────────────────
    const commitEdit = useCallback(() => {
        if (
            state.editId &&
            state.editField === 'title' &&
            state.editTitle.trim()
        ) {
            handleChange(state.editId, 'title', state.editTitle.trim());
        }
        if (state.editId && state.editField === 'description') {
            handleChange(state.editId, 'description', state.editDesc);
        }
        dispatch({ type: 'COMMIT_EDIT' });
    }, [
        state.editId,
        state.editField,
        state.editTitle,
        state.editDesc,
        handleChange,
    ]);

    // ── CRUD helpers ──────────────────────────────────────────────────────────
    const canDelete = useCallback(
        () =>
            min === undefined ||
            state.methods.filter((m) => m.isCustom).length > min,
        [min, state.methods]
    );

    const handleAddNew = useCallback(() => {
        if (!canAccess || !addNewTemplate) {
            return;
        }

        const id =
            (addNewTemplate.label ?? 'item')
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '_') + Math.floor(Math.random() * 10000);

        const newMethod: ExpandablePanelMethod = {
            id,
            icon: addNewTemplate.icon ?? '',
            label: addNewTemplate.label ?? 'New Item',
            desc: addNewTemplate.desc ?? '',
            iconEnable: addNewTemplate.iconEnable ?? false,
            iconOptions: addNewTemplate.iconOptions ?? [],
            connected: false,
            isCustom: true,
            disableBtn: addNewTemplate.disableBtn ?? false,
            formFields: addNewTemplate.formFields?.map((f) => ({ ...f })) ?? [],
        };

        const mergedMethod = mergeTemplateFields(newMethod, tplFields);
        dispatch({ type: 'ADD_METHOD', method: mergedMethod });

        const init: Record<string, unknown> = {
            isCustom: true,
            title: newMethod.label,
            description: newMethod.desc,
            label: newMethod.label,
            desc: newMethod.desc,
        };
        if (addNewTemplate.icon) {
            init.icon = addNewTemplate.icon;
        }
        newMethod.formFields?.forEach((f) => {
            init[f.key] = '';
        });

        onChange({ ...value, [id]: init });
    }, [canAccess, addNewTemplate, tplFields, onChange, value]);

    const handleDelete = useCallback(
        (methodId: string) => {
            if (!canDelete()) {
                return;
            }
            dispatch({ type: 'DELETE_METHOD', id: methodId });
            const next = { ...value };
            delete next[methodId];
            onChange(next);
        },
        [canDelete, onChange, value]
    );

    // ── Wizard ────────────────────────────────────────────────────────────────
    const saveWizard = useCallback(() => {
        if (!apilink || !ZyraVariable?.nonce) {
            return;
        }
        axios({
            url: getApiLink(ZyraVariable, apilink),
            method: 'POST',
            headers: { 'X-WP-Nonce': ZyraVariable.nonce },
            data: { setupWizard: true, value },
        }).catch(console.error);
    }, [apilink, value]);

    // ── Dependent-field helpers ───────────────────────────────────────────────
    const isContain = (
        key: string,
        methodId: string,
        valuee: string | number | boolean | null = null
    ): boolean => {
        const settingValue = value[methodId]?.[key];
        if (Array.isArray(settingValue)) {
            if (valuee === null) {
                return settingValue.length > 0;
            }
            return settingValue.includes(valuee);
        }

        if (valuee === null) {
            return Boolean(settingValue);
        }
        return settingValue === valuee;
    };

    const shouldRender = (
        dependent: DependentField,
        methodId: string
    ): boolean => {
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

    const navigateWizard = useCallback(
        (direction: 'next' | 'back', redirect?: string) => {
            const { wizardIndex, methods } = state;
            const lastIndex = methods.length - 1;
            if (direction === 'back') {
                if (wizardIndex === 0) {
                    return;
                }

                const newIndex = wizardIndex - 1;
                const method = methods[newIndex];

                dispatch({ type: 'SET_WIZARD_INDEX', index: newIndex });
                dispatch({ type: 'SET_ACTIVE_TAB', id: method.id });

                return;
            }

            saveWizard();

            if (wizardIndex < lastIndex) {
                const newIndex = wizardIndex + 1;
                const method = methods[newIndex];

                dispatch({ type: 'SET_WIZARD_INDEX', index: newIndex });
                dispatch({ type: 'SET_ACTIVE_TAB', id: method.id });
                return;
            }

            if (redirect) {
                window.open(redirect, '_self');
            }
        },
        [state.wizardIndex, state.methods, saveWizard]
    );

    // ── Field renderer ────────────────────────────────────────────────────────
    const renderField = useCallback(
        (methodId: string, field: PanelFormField): JSX.Element | null => {
            const comp = FIELD_REGISTRY[field.type];
            if (!comp) {
                return null;
            }

            const Render = comp.render;
            const fieldVal = value[methodId]?.[field.key];
            const onChangeF = (val: unknown) =>
                handleChange(methodId, field.key, val);

            if (
                field.type === 'button' &&
                isWizardMode &&
                Array.isArray(field.options)
            ) {
                const buttonActions = {
                    back: (btn) => ({
                        ...btn,
                        text: btn.label,
                        color: 'red',
                        onClick: () => navigateWizard('back'),
                    }),
                    next: (btn) => ({
                        ...btn,
                        text: btn.label,
                        color: 'purple',
                        onClick: () => navigateWizard('next', btn.redirect),
                    }),
                    skip: (btn) => ({
                        ...btn,
                        text: btn.label,
                        color: 'blue',
                        onClick: () =>
                            window.open(ZyraVariable?.site_url, '_self'),
                    }),
                };

                const buttonOptions = field.options.map((btn) => {
                    const actionHandler = buttonActions[btn.action];
                    return actionHandler ? actionHandler(btn) : btn;
                });

                return (
                    <Render
                        field={{ ...field, options: buttonOptions }}
                        value={fieldVal}
                        onChange={onChangeF}
                        canAccess={canAccess}
                        onBlocked={onBlocked}
                    />
                );
            }

            return (
                <Render
                    field={field}
                    value={fieldVal}
                    onChange={onChangeF}
                    canAccess={canAccess}
                />
            );
        },
        [
            value,
            handleChange,
            isWizardMode,
            state.wizardIndex,
            state.methods,
            canAccess,
            saveWizard,
        ]
    );

    // ── Effects ───────────────────────────────────────────────────────────────

    // Focus the active edit input
    useEffect(() => {
        if (state.editField === 'title') {
            titleRef.current?.focus();
            titleRef.current?.select();
        }
        if (state.editField === 'description') {
            descRef.current?.focus();
            descRef.current?.select();
        }
    }, [state.editId, state.editField]);

    // Keyboard shortcuts while editing
    useEffect(() => {
        if (!state.editId) {
            return;
        }
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                dispatch({ type: 'CANCEL_EDIT' });
                return;
            }
            if (
                e.key === 'Enter' &&
                (state.editField === 'title' || e.ctrlKey)
            ) {
                commitEdit();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [state.editId, state.editField, commitEdit]);

    // Click outside commits the edit
    useEffect(() => {
        if (!state.editId) {
            return;
        }
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (
                !titleRef.current?.contains(t) &&
                !descRef.current?.contains(t)
            ) {
                commitEdit();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [state.editId, commitEdit]);

    // Close 3-dot dropdown on outside click
    useEffect(() => {
        if (!state.openDropdown) {
            return;
        }
        const close = () => dispatch({ type: 'SET_OPEN_DROPDOWN', id: null });
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [state.openDropdown]);

    // Close icon picker on outside click or Escape
    useEffect(() => {
        if (!state.iconDropdown) {
            return;
        }
        const onMouse = (e: MouseEvent) => {
            if (
                iconPicker.current &&
                !iconPicker.current.contains(e.target as Node)
            ) {
                dispatch({ type: 'SET_ICON_DROPDOWN', id: null });
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                dispatch({ type: 'SET_ICON_DROPDOWN', id: null });
            }
        };
        document.addEventListener('mousedown', onMouse);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onMouse);
            document.removeEventListener('keydown', onKey);
        };
    }, [state.iconDropdown]);

    // Wizard: recalculate field-fill progress
    useEffect(() => {
        if (!isWizardMode) {
            return;
        }
        const newProgress = state.methods.map((m) => {
            const methodValue = value[m.id] ?? {};
            return (m.formFields?.filter(isCountableField) ?? []).filter((f) =>
                isFilled(methodValue[f.key])
            ).length;
        });
        dispatch({ type: 'SET_PROGRESS', progress: newProgress });
    }, [value, state.methods, isWizardMode]);

    // Sync methods state with persisted value (restores config-only props)
    useEffect(() => {
        const methodsFromValue = new Map(
            Object.entries(value).map(([id, m]) => [
                id,
                { id, ...(m as ExpandablePanelMethod) },
            ])
        );

        const updatedMethods = (() => {
            const methodMap = new Map(state.methods.map((m) => [m.id, m]));

            methodsFromValue.forEach((persistedMethod, id) => {
                const existingMethod = methodMap.get(id);
                methodMap.set(id, {
                    ...existingMethod,
                    ...persistedMethod,
                    disableBtn:
                        persistedMethod.disableBtn ??
                        existingMethod?.disableBtn ??
                        (persistedMethod.isCustom
                            ? (addNewTemplate?.disableBtn ?? false)
                            : false),
                    iconEnable:
                        persistedMethod.iconEnable ??
                        existingMethod?.iconEnable ??
                        (persistedMethod.isCustom
                            ? addNewTemplate?.iconEnable
                            : false),
                    iconOptions:
                        persistedMethod.iconOptions ??
                        existingMethod?.iconOptions ??
                        (persistedMethod.isCustom
                            ? addNewTemplate?.iconOptions
                            : []),
                });
            });

            return Array.from(methodMap.values()).map((m) =>
                m.isCustom ? mergeTemplateFields(m, tplFields) : m
            );
        })();

        if (JSON.stringify(updatedMethods) !== JSON.stringify(state.methods)) {
            dispatch({ type: 'SET_METHODS', methods: updatedMethods });
        }
    }, [value, addNewTemplate, tplFields]);

    // ── Context Value ─────────────────────────────────────────────────────────

    const contextValue: PanelContextType = {
        state,
        dispatch,
        value,
        isWizardMode,
        canAccess,
        addNewTemplate,
        tplFields,
        titleRef,
        descRef,
        iconPicker,
        handleChange,
        handleDelete,
        canDelete,
        renderField,
        commitEdit,
        shouldRender,
    };

    // ── Render ────────────────────────────────────────────────────────────────

    // Wizard mode: only show steps up to current index
    const visible = isWizardMode
        ? state.methods.slice(0, state.wizardIndex + 1)
        : state.methods;

    return (
        <PanelContext.Provider value={contextValue}>
            <div className="expandable-panel-group">
                {visible.map((method, idx) => (
                    <PanelItem key={method.id} method={method} idx={idx} />
                ))}

                {addNewBtn && (
                    <ButtonInputUI
                        buttons={[
                            {
                                icon: 'plus',
                                text: 'Add New',
                                color: 'purple',
                                onClick: handleAddNew,
                            },
                        ]}
                    />
                )}
            </div>

            {/* Wizard navigation buttons (rendered outside the panel list) */}
            {isWizardMode &&
                (() => {
                    const step = state.methods[state.wizardIndex];
                    const btn = step?.formFields?.find(
                        (f) => f.key === 'wizardButtons'
                    );
                    return btn ? renderField(step.id, btn) : null;
                })()}
        </PanelContext.Provider>
    );
};

// ── FieldComponent wrapper ────────────────────────────────────────────────────

const ExpandablePanel: FieldComponent = {
    render: ({ field, value, onChange, canAccess }) => (
        <ExpandablePanelUI
            key={field.key}
            name={field.key}
            apilink={String(field.apiLink)}
            methods={field.modal ?? []}
            addNewBtn={field.addNewBtn}
            addNewTemplate={field.addNewTemplate}
            min={field.min}
            value={value || {}}
            onChange={(val) => {
                if (!canAccess) {
                    return;
                }
                onChange(val);
            }}
            canAccess={canAccess}
        />
    ),
    validate: () => null,
};

export default ExpandablePanel;