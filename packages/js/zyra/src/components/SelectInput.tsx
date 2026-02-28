// External dependencies
import React from 'react';
import Select, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type { MultiValue, SingleValue, StylesConfig, GroupBase } from 'react-select';

// Internal dependencies
import { FieldComponent } from './types';
import { AdminButtonUI } from './AdminButton';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
    value: string;
    label: string;
    index?: number;
}

export type SelectType =
    | 'single-select'
    | 'multi-select'
    | 'creatable'
    | 'creatable-multi'

export interface SelectProps {
    type: SelectType;
    options: SelectOption[];
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    maxVisibleItems?: number;
    onOverflowClick?: () => void;
    isClearable?: boolean;
    name?: string;
    placeholder?: string;
    inputClass?: string;
    wrapperClass?: string;
    size?: string;
    menuContent?: React.ReactNode;
    keepMenuOpenOnMenuContentClick?: boolean;
    noOptionsText?: string;
    selectDeselect?: boolean;
    selectDeselectLabel?: string;
    onSelectDeselectAll?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    formatCreateLabel?: (inputValue: string) => string;
    disabled?: boolean;
}

interface TypeConfig {
    type: SelectType;
    isMulti: boolean;
    isCreatable: boolean;
    Component: typeof Select | typeof CreatableSelect;
}

const FIELD_TYPE_CONFIG: Record<string, TypeConfig> = {
    'select':          { type: 'single-select',   isMulti: false, isCreatable: false, Component: Select          },
    'dropdown':        { type: 'single-select',   isMulti: false, isCreatable: false, Component: Select          },
    'single-select':   { type: 'single-select',   isMulti: false, isCreatable: false, Component: Select          },
    'multi-select':    { type: 'multi-select',    isMulti: true,  isCreatable: false, Component: Select          },
    'single-creatable':{ type: 'creatable',       isMulti: false, isCreatable: true,  Component: CreatableSelect },
    'creatable-multi': { type: 'creatable-multi', isMulti: true,  isCreatable: true,  Component: CreatableSelect },
};

const DEFAULT_CONFIG: TypeConfig = { type: 'single-select', isMulti: false, isCreatable: false, Component: Select };

// ─── Value utilities ──────────────────────────────────────────────────────────

const resolveValue = (
    value: string | string[] | undefined,
    options: SelectOption[],
    isMulti: boolean,
): SelectOption | SelectOption[] | null => {
    const map = new Map(options.map((o) => [o.value, o]));
    const toOption = (v: string): SelectOption => map.get(v) ?? { value: v, label: v };
    const raw = Array.isArray(value) ? value : value != null && value !== '' ? [value] : [];
    const resolved = raw.map(toOption);
    return isMulti ? resolved : resolved[0] ?? null;
};

const extractValue = (
    raw: MultiValue<SelectOption> | SingleValue<SelectOption>,
    isMulti: boolean,
): string | string[] =>
    isMulti
        ? (raw as MultiValue<SelectOption>).map((o) => o.value)
        : (raw as SingleValue<SelectOption>)?.value ?? '';

const coerceToString = (v: unknown): string | string[] | undefined => {
    if (Array.isArray(v)) return v.map(String);
    if (v != null && v !== '') return String(v);
    return undefined;
};

const buildStyles = (isMulti: boolean): StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> => ({
    control: (base, state) => ({
        ...base,
        borderColor: 'var(--borderColor)',
        boxShadow: state.isFocused ? 'var(--box-shadow-theme)' : 'none',
        backgroundColor: 'transparent',
        color: 'var(--textColor)',
        minHeight: '2.213rem',
        ...(isMulti ? {} : { height: '2.213rem', maxHeight: '2.213rem' }),
        paddingTop: 0,
        paddingBottom: 0,
        margin: 0,
        '&:active': { color: 'var(--colorPrimary)' },
    }),
    valueContainer: (base) => ({
        ...base,
        margin: 0,
        paddingTop: isMulti ? '2px' : 0,
        paddingBottom: isMulti ? '2px' : 0,
        backgroundColor: 'transparent',
        flexWrap: isMulti ? 'wrap' : 'nowrap',
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '0.95rem',
        backgroundColor: state.isSelected
            ? 'var(--backgroundPrimary)'
            : state.isFocused
            ? 'var(--backgroundColor)'
            : 'var(--backgroundWhite)',
        color: state.isSelected ? 'var(--textColor)' : 'var(--themeColor)',
        cursor: 'pointer',
    }),
    menu: (base) => ({ ...base, borderRadius: 4, marginTop: 0 }),
    multiValue: (base) => ({ ...base, backgroundColor: 'var(--backgroundPrimary)', margin: '2px' }),
    multiValueLabel: (base) => ({ ...base, color: 'var(--colorPrimary)', padding: '0 4px' }),
    multiValueRemove: (base) => ({
        ...base,
        color: 'var(--colorPrimary)',
        ':hover': { backgroundColor: 'var(--colorPrimary)', color: 'var(--backgroundWhite)' },
    }),
});

const CustomMenuList = (props: any) => {
    const { menuContent, keepMenuOpenOnMenuContentClick } = props.selectProps;
    return (
        <components.MenuList {...props}>
            {props.children}
            {menuContent && (
                <div
                    className="select-menu-content"
                    onMouseDown={(e) => {
                        if (keepMenuOpenOnMenuContentClick) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                >
                    {menuContent}
                </div>
            )}
        </components.MenuList>
    );
};

const CustomNoOptionsMessage = (props: any) => (
    <components.NoOptionsMessage {...props}>
        <span className="no-options">
            {props.selectProps.noOptionsText ?? 'No options available'}
        </span>
    </components.NoOptionsMessage>
);

const CustomValueContainer = (props: any) => {
    const {
        children,
        getValue,
        selectProps: { maxVisibleItems, onOverflowClick, __isExpanded, __setIsExpanded },
    } = props;

    if (!maxVisibleItems) {
        return <components.ValueContainer {...props}>{children}</components.ValueContainer>;
    }

    const total    = getValue().length;
    const limit    = __isExpanded ? total : maxVisibleItems;
    const overflow = Math.max(0, total - limit);

    const childArray   = React.Children.toArray(children);
    const input        = childArray[childArray.length - 1];
    const visibleChips = childArray.slice(0, -1).slice(0, limit);

    const handleOverflowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onOverflowClick) {
            onOverflowClick();
        } else {
            __setIsExpanded?.(!__isExpanded);
        }
    };

    return (
        <components.ValueContainer {...props}>
            {visibleChips}
            {overflow > 0 && (
                <span
                    className="admin-badge blue overflow-badge"
                    onClick={handleOverflowClick}
                    role="button"
                    tabIndex={0}
                    title={`${overflow} more selected`}
                >
                    +{overflow}
                </span>
            )}
            {input}
        </components.ValueContainer>
    );
};

const CUSTOM_COMPONENTS = {
    MenuList:         CustomMenuList,
    NoOptionsMessage: CustomNoOptionsMessage,
    ValueContainer:   CustomValueContainer,
};

export const SelectInputUI: React.FC<SelectProps> = ({
    type,
    options,
    value,
    onChange,
    maxVisibleItems,
    onOverflowClick,
    isClearable = false,
    name,
    placeholder,
    inputClass,
    wrapperClass,
    size,
    menuContent,
    keepMenuOpenOnMenuContentClick,
    noOptionsText,
    selectDeselect,
    selectDeselectLabel = 'Select / Deselect All',
    onSelectDeselectAll,
    formatCreateLabel = (v) => `Add "${v}"`,
    disabled = false,
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const { isMulti, Component } = FIELD_TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
    const CastComponent = Component as any;

    const optionsData: SelectOption[] = options.map((opt, index) => ({
        value: opt.value,
        label: opt.label ?? opt.value,
        index,
    }));

    return (
        <div
            className={`form-select-field-wrapper ${wrapperClass ?? ''}`}
            style={{ width: size ?? '100%' }}
        >
            {selectDeselect && (
                <AdminButtonUI
                    position="left"
                    buttons={[
                        {
                            text: selectDeselectLabel,
                            color: 'purple',
                            onClick: (e) => {e.preventDefault(); onSelectDeselectAll?.(e)},
                        },
                    ]}
                />
            )}

            <div className="select-wrapper">
                <CastComponent
                    name={name}
                    placeholder={placeholder}
                    className={`${inputClass ?? ''} react-select`}
                    value={resolveValue(value, optionsData, isMulti)}
                    options={optionsData}
                    isMulti={isMulti}
                    isDisabled={disabled}
                    isClearable={isClearable}
                    onChange={(raw: any) =>
                        onChange(extractValue(raw ?? (isMulti ? [] : null), isMulti))
                    }
                    styles={buildStyles(isMulti)}
                    components={CUSTOM_COMPONENTS}
                    formatCreateLabel={formatCreateLabel}
                    maxVisibleItems={maxVisibleItems}
                    onOverflowClick={onOverflowClick}
                    __isExpanded={isExpanded}
                    __setIsExpanded={setIsExpanded}
                    menuContent={menuContent}
                    keepMenuOpenOnMenuContentClick={keepMenuOpenOnMenuContentClick}
                    noOptionsText={noOptionsText}
                />
            </div>
        </div>
    );
};

const SelectInput: FieldComponent = {
    render: ({ field, value, onChange, canAccess }) => {
        const { type } = FIELD_TYPE_CONFIG[field.type] ?? DEFAULT_CONFIG;

        return (
            <SelectInputUI
                type={type}
                name={field.key}
                inputClass={field.className}
                wrapperClass={field.wrapperClass}
                size={field.size}
                placeholder={field.placeholder}
                maxVisibleItems={field.maxVisibleItems}
                isClearable={field.isClearable}
                selectDeselect={field.selectDeselect}
                selectDeselectLabel="Select / Deselect All"
                options={
                    Array.isArray(field.options)
                        ? field.options.map((opt) => ({
                              value: String(opt.value),
                              label: opt.label ?? String(opt.value),
                          }))
                        : []
                }
                value={coerceToString(value)}
                onChange={(val) => { if (canAccess) onChange(val); }}
                menuContent={field.menuContent}
                keepMenuOpenOnMenuContentClick={field.keepMenuOpenOnMenuContentClick}
                noOptionsText={field.noOptionsText}
                formatCreateLabel={field.formatCreateLabel}
                disabled={!canAccess}
            />
        );
    },

    validate: (field, value) => {
        if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
            return `${field.label} is required`;
        }
        return null;
    },
};

export default SelectInput;