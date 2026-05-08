// RadioExpandablePanel.tsx
import React, {
    JSX,
    useEffect,
    useRef,
    useReducer,
    useCallback,
    useContext,
    createContext,
    useState,
} from 'react';
import '../styles/web/RadioExpandablePanel.scss';
import { FieldComponent, FIELD_REGISTRY, ZyraVariable } from './fieldUtils';
import FormGroup from './UI/FormGroup';
import { ButtonInputUI } from './ButtonInput';
import FormGroupWrapper from './UI/FormGroupWrapper';
import { BasicInputUI } from './BasicInput';

// ── Types ─────────────────────────────────────────────────────────────────────

interface InnerField {
    key: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    desc?: string;
    dependent?: DependentField | DependentField[];
    [key: string]: unknown;
}

interface DependentField {
    key: string;
    set?: boolean;
    value?: string | number | boolean;
}

interface RadioOption {
    id: string;
    value: string;
    label: string;
    description?: string;
    price?: number;
    estimatedDays?: string;
    icon?: string;
    disabled?: boolean;
    innerFields?: InnerField[];
    customHtml?: string;
    showInnerByDefault?: boolean;
}

interface RadioExpandablePanelProps {
    name: string;
    options: RadioOption[];
    value: string; // Selected radio value
    onChange: (value: string, formData?: Record<string, any>) => void;
    className?: string;
    required?: boolean;
    canAccess?: boolean;
    expandOnSelect?: boolean; // Auto-expand when selected
    allowCollapse?: boolean; // Allow collapsing expanded panel
    showPrices?: boolean;
    showDescriptions?: boolean;
    onBlocked?: (type: 'pro' | 'plugin', payload?: unknown) => void;
}

// ── State Types ───────────────────────────────────────────────────────────────

type PanelState = {
    expandedId: string | null; // Currently expanded panel ID
    selectedValue: string;
    innerFormData: Record<string, Record<string, any>>; // Store inner field values per option
    errors: Record<string, Record<string, string>>; // Errors per option per field
};

type PanelAction =
    | { type: 'SET_EXPANDED'; id: string | null }
    | { type: 'SET_SELECTED'; value: string }
    | { type: 'UPDATE_INNER_FIELD'; optionId: string; fieldKey: string; value: any }
    | { type: 'SET_INNER_DATA'; optionId: string; data: Record<string, any> }
    | { type: 'SET_ERROR'; optionId: string; fieldKey: string; error: string }
    | { type: 'CLEAR_ERRORS'; optionId: string }
    | { type: 'RESET_ALL' };

// ── Context Types ─────────────────────────────────────────────────────────────

interface RadioPanelContextType {
    state: PanelState;
    dispatch: React.Dispatch<PanelAction>;
    options: RadioOption[];
    canAccess: boolean;
    expandOnSelect: boolean;
    allowCollapse: boolean;
    handleRadioChange: (option: RadioOption) => void;
    handleInnerFieldChange: (optionId: string, fieldKey: string, value: any) => void;
    validateInnerFields: (optionId: string) => boolean;
    getOptionData: (optionId: string) => Record<string, any>;
    getOptionErrors: (optionId: string) => Record<string, string>;
    renderInnerField: (option: RadioOption, field: InnerField) => JSX.Element | null;
}

interface RadioPanelItemContextType {
    option: RadioOption;
    isSelected: boolean;
    isExpanded: boolean;
    formData: Record<string, any>;
    errors: Record<string, string>;
    onToggleExpand: () => void;
    onSelect: () => void;
}

// ── Context Creation ──────────────────────────────────────────────────────────

const RadioPanelContext = createContext<RadioPanelContextType | null>(null);
const RadioPanelItemContext = createContext<RadioPanelItemContextType | null>(null);

// ── Custom Hooks ─────────────────────────────────────────────────────────────

const useRadioPanel = () => {
    const context = useContext(RadioPanelContext);
    if (!context) {
        throw new Error('useRadioPanel must be used within RadioPanelProvider');
    }
    return context;
};

const useRadioPanelItem = () => {
    const context = useContext(RadioPanelItemContext);
    if (!context) {
        throw new Error('useRadioPanelItem must be used within RadioPanelItemProvider');
    }
    return context;
};

// ── Reducer ───────────────────────────────────────────────────────────────────

const radioPanelReducer = (state: PanelState, action: PanelAction): PanelState => {
    switch (action.type) {
        case 'SET_EXPANDED':
            return { ...state, expandedId: action.id };
        
        case 'SET_SELECTED':
            return { ...state, selectedValue: action.value };
        
        case 'UPDATE_INNER_FIELD': {
            const currentOptionData = state.innerFormData[action.optionId] || {};
            return {
                ...state,
                innerFormData: {
                    ...state.innerFormData,
                    [action.optionId]: {
                        ...currentOptionData,
                        [action.fieldKey]: action.value,
                    },
                },
            };
        }
        
        case 'SET_INNER_DATA':
            return {
                ...state,
                innerFormData: {
                    ...state.innerFormData,
                    [action.optionId]: action.data,
                },
            };
        
        case 'SET_ERROR': {
            const currentErrors = state.errors[action.optionId] || {};
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.optionId]: {
                        ...currentErrors,
                        [action.fieldKey]: action.error,
                    },
                },
            };
        }
        
        case 'CLEAR_ERRORS': {
            const newErrors = { ...state.errors };
            delete newErrors[action.optionId];
            return { ...state, errors: newErrors };
        }
        
        case 'RESET_ALL':
            return {
                expandedId: null,
                selectedValue: '',
                innerFormData: {},
                errors: {},
            };
        
        default:
            return state;
    }
};

// ── Helper Functions ─────────────────────────────────────────────────────────

const isContain = (
    key: string,
    formData: Record<string, any>,
    valuee: string | number | boolean | null = null
): boolean => {
    const settingValue = formData?.[key];
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

const shouldRenderField = (
    dependent: DependentField | DependentField[] | undefined,
    formData: Record<string, any>
): boolean => {
    if (!dependent) return true;
    
    const dependencies = Array.isArray(dependent) ? dependent : [dependent];
    return dependencies.every((dep) => {
        if (dep.set === true && !isContain(dep.key, formData)) {
            return false;
        }
        if (dep.set === false && isContain(dep.key, formData)) {
            return false;
        }
        if (dep.value !== undefined && !isContain(dep.key, formData, dep.value)) {
            return false;
        }
        return true;
    });
};

// ── Sub-Components ────────────────────────────────────────────────────────────

const RadioOptionHeader: React.FC = () => {
    const { option, isSelected, isExpanded, onSelect, onToggleExpand } = useRadioPanelItem();
    const { showPrices, showDescriptions } = useRadioPanel();

    return (
        <div 
            className={`radio-option-header ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
            onClick={onSelect}
        >
            <div className="radio-input-wrapper">
                <input
                    type="radio"
                    name="radio-expandable-group"
                    value={option.value}
                    checked={isSelected}
                    onChange={onSelect}
                    disabled={option.disabled}
                />
                <span className="radio-custom"></span>
            </div>

            <div className="radio-content">
                <div className="radio-header-main">
                    {option.icon && (
                        <i className={`radio-icon adminfont-${option.icon}`} />
                    )}
                    <span className="radio-label">{option.label}</span>
                    {showPrices && option.price !== undefined && (
                        <span className="radio-price">
                            {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
                        </span>
                    )}
                </div>

                {showDescriptions && option.description && (
                    <div className="radio-description">{option.description}</div>
                )}

                {option.estimatedDays && (
                    <div className="radio-estimated">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span>{option.estimatedDays}</span>
                    </div>
                )}

                {option.customHtml && (
                    <div 
                        className="radio-custom-html"
                        dangerouslySetInnerHTML={{ __html: option.customHtml }}
                    />
                )}
            </div>

            {/* Expand/Collapse Toggle Button */}
            {option.innerFields && option.innerFields.length > 0 && isSelected && (
                <button
                    type="button"
                    className="expand-toggle-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand();
                    }}
                >
                    <i className={`adminfont-${isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}`} />
                </button>
            )}
        </div>
    );
};

const RadioInnerContent: React.FC = () => {
    const { option, isExpanded, formData, errors, onToggleExpand } = useRadioPanelItem();
    const { renderInnerField, validateInnerFields } = useRadioPanel();

    // Auto-validate when form data changes
    useEffect(() => {
        if (isExpanded && formData) {
            validateInnerFields(option.id);
        }
    }, [formData, isExpanded, option.id, validateInnerFields]);

    if (!isExpanded || !option.innerFields || option.innerFields.length === 0) {
        return null;
    }

    return (
        <div className="radio-inner-content">
            <div className="inner-fields-container">
                <h4 className="inner-title">
                    Additional Information
                    <button
                        type="button"
                        className="collapse-inner-btn"
                        onClick={onToggleExpand}
                    >
                        <i className="adminfont-keyboard-arrow-up" />
                    </button>
                </h4>
                <div className="inner-fields-grid">
                    {option.innerFields.map((field) => {
                        // Check dependent conditions
                        if (field.dependent && !shouldRenderField(field.dependent, formData)) {
                            return null;
                        }

                        return (
                            <div key={field.key} className={`inner-field-group field-type-${field.type}`}>
                                {renderInnerField(option, field)}
                                {errors[field.key] && (
                                    <div className="field-error-message">
                                        <i className="adminfont-error" />
                                        {errors[field.key]}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const RadioOptionItem: React.FC<{ option: RadioOption; index: number }> = ({ option, index }) => {
    const { state, dispatch, expandOnSelect, allowCollapse, getOptionData, getOptionErrors } = useRadioPanel();
    
    const isSelected = state.selectedValue === option.value;
    const isExpanded = state.expandedId === option.id && isSelected;
    const formData = getOptionData(option.id);
    const errors = getOptionErrors(option.id);

    const handleSelect = useCallback(() => {
        if (option.disabled) return;
        
        dispatch({ type: 'SET_SELECTED', value: option.value });
        
        // Auto-expand on select if configured
        if (expandOnSelect && option.innerFields?.length) {
            dispatch({ type: 'SET_EXPANDED', id: option.id });
        }
    }, [option, dispatch, expandOnSelect]);

    const handleToggleExpand = useCallback(() => {
        if (!isSelected) return;
        
        if (isExpanded && allowCollapse) {
            dispatch({ type: 'SET_EXPANDED', id: null });
        } else if (!isExpanded) {
            dispatch({ type: 'SET_EXPANDED', id: option.id });
        }
    }, [isSelected, isExpanded, allowCollapse, dispatch, option.id]);

    const itemContextValue: RadioPanelItemContextType = {
        option,
        isSelected,
        isExpanded,
        formData,
        errors,
        onToggleExpand: handleToggleExpand,
        onSelect: handleSelect,
    };

    return (
        <RadioPanelItemContext.Provider value={itemContextValue}>
            <div className={`radio-expandable-item ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}>
                <RadioOptionHeader />
                <RadioInnerContent />
            </div>
        </RadioPanelItemContext.Provider>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const RadioExpandablePanelUI: React.FC<RadioExpandablePanelProps> = ({
    name,
    options,
    value: externalValue,
    onChange,
    className = '',
    required = false,
    canAccess = true,
    expandOnSelect = true,
    allowCollapse = true,
    showPrices = true,
    showDescriptions = true,
    onBlocked,
}) => {
    const [state, dispatch] = useReducer(radioPanelReducer, {
        expandedId: null,
        selectedValue: externalValue || '',
        innerFormData: {},
        errors: {},
    });

    // Sync external value with internal state
    useEffect(() => {
        if (externalValue !== state.selectedValue) {
            dispatch({ type: 'SET_SELECTED', value: externalValue || '' });
        }
    }, [externalValue]);

    // Get form data for an option
    const getOptionData = useCallback((optionId: string): Record<string, any> => {
        return state.innerFormData[optionId] || {};
    }, [state.innerFormData]);

    // Get errors for an option
    const getOptionErrors = useCallback((optionId: string): Record<string, string> => {
        return state.errors[optionId] || {};
    }, [state.errors]);

    // Validate inner fields for a specific option
    const validateInnerFields = useCallback((optionId: string): boolean => {
        const option = options.find(opt => opt.id === optionId);
        if (!option?.innerFields) return true;

        const formData = getOptionData(optionId);
        let isValid = true;

        option.innerFields.forEach(field => {
            if (field.required) {
                const value = formData[field.key];
                if (!value || (typeof value === 'string' && !value.trim())) {
                    dispatch({ type: 'SET_ERROR', optionId, fieldKey: field.key, error: `${field.label} is required` });
                    isValid = false;
                } else {
                    dispatch({ type: 'SET_ERROR', optionId, fieldKey: field.key, error: '' });
                }
            }
        });

        return isValid;
    }, [options, getOptionData, dispatch]);

    // Handle radio selection change
    const handleRadioChange = useCallback((option: RadioOption) => {
        if (!canAccess || option.disabled) return;

        const selectedOption = options.find(opt => opt.value === option.value);
        const currentFormData = getOptionData(option.id);
        
        dispatch({ type: 'SET_SELECTED', value: option.value });
        
        // Auto-expand if configured
        if (expandOnSelect && selectedOption?.innerFields?.length) {
            dispatch({ type: 'SET_EXPANDED', id: option.id });
        } else if (!expandOnSelect) {
            dispatch({ type: 'SET_EXPANDED', id: null });
        }

        // Call parent onChange with selected value and its form data
        onChange(option.value, currentFormData);
    }, [canAccess, options, expandOnSelect, getOptionData, onChange]);

    // Handle inner field changes
    const handleInnerFieldChange = useCallback((optionId: string, fieldKey: string, value: any) => {
        dispatch({ type: 'UPDATE_INNER_FIELD', optionId, fieldKey, value });
        
        // Clear error for this field
        dispatch({ type: 'SET_ERROR', optionId, fieldKey, error: '' });
        
        // Notify parent of form data change for the selected option
        if (state.selectedValue === optionId) {
            const updatedData = { ...getOptionData(optionId), [fieldKey]: value };
            onChange(state.selectedValue, updatedData);
        }
    }, [state.selectedValue, getOptionData, onChange]);

    // Render inner field based on type
    const renderInnerField = useCallback((option: RadioOption, field: InnerField): JSX.Element | null => {
        const formData = getOptionData(option.id);
        const fieldValue = formData[field.key] ?? '';
        const error = state.errors[option.id]?.[field.key];

        const baseProps = {
            id: `${name}-${option.id}-${field.key}`,
            name: `${name}[${option.id}][${field.key}]`,
            value: fieldValue,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
                handleInnerFieldChange(option.id, field.key, e.target.value),
            placeholder: field.placeholder,
            required: field.required,
            className: `inner-field-input ${error ? 'has-error' : ''}`,
        };

        // Check if we have a registered component for this field type
        const registeredComponent = FIELD_REGISTRY?.[field.type];
        if (registeredComponent?.render) {
            return registeredComponent.render({
                field,
                value: fieldValue,
                onChange: (val: unknown) => handleInnerFieldChange(option.id, field.key, val),
                canAccess,
                onBlocked,
            });
        }

        // Fallback to basic input types
        switch (field.type) {
            case 'textarea':
                return (
                    <div className="field-wrapper">
                        <label htmlFor={baseProps.id}>
                            {field.label}
                            {field.required && <span className="required-star">*</span>}
                        </label>
                        <textarea {...baseProps} rows={4} />
                        {field.desc && <span className="field-desc">{field.desc}</span>}
                    </div>
                );
            
            case 'select':
                return (
                    <div className="field-wrapper">
                        <label htmlFor={baseProps.id}>
                            {field.label}
                            {field.required && <span className="required-star">*</span>}
                        </label>
                        <select {...baseProps}>
                            <option value="">Select {field.label}</option>
                            {field.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {field.desc && <span className="field-desc">{field.desc}</span>}
                    </div>
                );
            
            case 'checkbox':
                return (
                    <div className="field-wrapper checkbox-wrapper">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                id={baseProps.id}
                                name={baseProps.name}
                                checked={!!fieldValue}
                                onChange={(e) => handleInnerFieldChange(option.id, field.key, e.target.checked)}
                                className={error ? 'has-error' : ''}
                            />
                            <span>{field.label}</span>
                            {field.required && <span className="required-star">*</span>}
                        </label>
                        {field.desc && <span className="field-desc">{field.desc}</span>}
                    </div>
                );
            
            case 'number':
                return (
                    <div className="field-wrapper">
                        <label htmlFor={baseProps.id}>
                            {field.label}
                            {field.required && <span className="required-star">*</span>}
                        </label>
                        <input type="number" {...baseProps} />
                        {field.desc && <span className="field-desc">{field.desc}</span>}
                    </div>
                );
            
            default:
                return (
                    <div className="field-wrapper">
                        <label htmlFor={baseProps.id}>
                            {field.label}
                            {field.required && <span className="required-star">*</span>}
                        </label>
                        <input type="text" {...baseProps} />
                        {field.desc && <span className="field-desc">{field.desc}</span>}
                    </div>
                );
        }
    }, [name, getOptionData, state.errors, handleInnerFieldChange, canAccess, onBlocked]);

    const contextValue: RadioPanelContextType = {
        state,
        dispatch,
        options,
        canAccess,
        expandOnSelect,
        allowCollapse,
        handleRadioChange,
        handleInnerFieldChange,
        validateInnerFields,
        getOptionData,
        getOptionErrors,
        renderInnerField,
    };

    return (
        <RadioPanelContext.Provider value={contextValue}>
            <div className={`radio-expandable-panel ${className}`}>
                <div className="radio-options-list">
                    {options.map((option, index) => (
                        <RadioOptionItem key={option.id} option={option} index={index} />
                    ))}
                </div>
            </div>
        </RadioPanelContext.Provider>
    );
};

// ── FieldComponent wrapper for use in forms ───────────────────────────────────

const RadioExpandablePanel: FieldComponent = {
    render: ({ field, value, onChange, canAccess, onBlocked }) => (
        <RadioExpandablePanelUI
            name={field.key}
            options={field.options || []}
            value={typeof value === 'string' ? value : field.defaultValue || ''}
            onChange={(selectedValue, formData) => {
                if (!canAccess) return;
                // Store both selected value and form data
                onChange({
                    selected: selectedValue,
                    data: formData || {},
                });
            }}
            className={field.wrapperClass}
            required={field.required}
            canAccess={canAccess}
            expandOnSelect={field.expandOnSelect !== false}
            allowCollapse={field.allowCollapse !== false}
            showPrices={field.showPrices !== false}
            showDescriptions={field.showDescriptions !== false}
            onBlocked={onBlocked}
        />
    ),
    validate: (field, value) => {
        if (field.required && (!value?.selected)) {
            return `${field.label} is required`;
        }
        return null;
    },
};

export default RadioExpandablePanel;