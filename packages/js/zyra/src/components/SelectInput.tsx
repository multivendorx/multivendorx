// External dependencies
import React from 'react';
import Select, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type {
    MultiValue,
    SingleValue,
    StylesConfig,
    GroupBase,
    MenuListProps,
    ValueContainerProps,
    OnChangeValue,
    Props as SelectComponentProps,
} from 'react-select';

// Internal dependencies
import { FieldComponent } from './fieldUtils';
import { ButtonInputUI } from './ButtonInput';
import { PopupUI } from './Popup';

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
    | 'creatable-multi';

type RSProps = SelectComponentProps<SelectOption, boolean>;

type FieldOptions =
    | SelectOption[]
    | Record<string, string>
    | Record<string, SelectOption[]>;

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
    enableOverflowPopup?: boolean;
    popupTitle?: string;
    popupWidth?: number;
}

interface TypeConfig {
    type: SelectType;
    isMulti: boolean;
    isCreatable: boolean;
    Component: typeof Select | typeof CreatableSelect;
}

const FIELD_TYPE_CONFIG: Record<string, TypeConfig> = {
    select: {
        type: 'single-select',
        isMulti: false,
        isCreatable: false,
        Component: Select,
    },
    dropdown: {
        type: 'single-select',
        isMulti: false,
        isCreatable: false,
        Component: Select,
    },
    'single-select': {
        type: 'single-select',
        isMulti: false,
        isCreatable: false,
        Component: Select,
    },
    'multi-select': {
        type: 'multi-select',
        isMulti: true,
        isCreatable: false,
        Component: Select,
    },
    'single-creatable': {
        type: 'creatable',
        isMulti: false,
        isCreatable: true,
        Component: CreatableSelect,
    },
    'creatable-multi': {
        type: 'creatable-multi',
        isMulti: true,
        isCreatable: true,
        Component: CreatableSelect,
    },
};

const DEFAULT_CONFIG: TypeConfig = {
    type: 'single-select',
    isMulti: false,
    isCreatable: false,
    Component: Select,
};

// ─── Value utilities ──────────────────────────────────────────────────────────

const resolveValue = (
    value: string | string[] | undefined,
    options: SelectOption[],
    isMulti: boolean
): SelectOption | SelectOption[] | null => {
    const map = new Map(options.map((o) => [o.value, o]));
    const toOption = (v: string): SelectOption =>
        map.get(v) ?? { value: v, label: v };
    const raw = Array.isArray(value)
        ? value
        : value != null && value !== ''
          ? [value]
          : [];
    const resolved = raw.map(toOption);
    return isMulti ? resolved : (resolved[0] ?? null);
};

const extractValue = (
    raw: MultiValue<SelectOption> | SingleValue<SelectOption>,
    isMulti: boolean
): string | string[] =>
    isMulti
        ? (raw as MultiValue<SelectOption>).map((o) => o.value)
        : ((raw as SingleValue<SelectOption>)?.value ?? '');

const coerceToString = (v: unknown): string | string[] | undefined => {
    if (Array.isArray(v)) {
        // Handle Option[]
        if (v.length && typeof v[0] === 'object' && 'value' in v[0]) {
            return (v as { value: unknown }[]).map((o) => String(o.value));
        }

        return v.map(String);
    }

    if (v != null && v !== '') {
        return String(v);
    }

    return undefined;
};

const buildStyles = (
    isMulti: boolean
): StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> => ({
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
        width: '100%',
        margin: 0,
        '&:active': { color: 'var(--colorPrimary)' },
    }),
    valueContainer: (base) => ({
        ...base,
        margin: 0,
        paddingTop: isMulti ? '0.125rem' : 0,
        paddingBottom: isMulti ? '0.125rem' : 0,
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
    multiValue: (base) => ({
        ...base,
        backgroundColor: 'var(--backgroundPrimary)',
        margin: '0.125rem',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: 'var(--colorPrimary)',
        padding: '0 0.25rem',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: 'var(--colorPrimary)',
        ':hover': {
            backgroundColor: 'var(--colorPrimary)',
            color: 'var(--backgroundWhite)',
        },
    }),
});

const CustomMenuList = (props: MenuListProps<SelectOption, boolean>) => {
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

const CustomNoOptionsMessage = (
    props: React.ComponentProps<typeof components.NoOptionsMessage> & {
        selectProps: { noOptionsText?: string };
    }
) => (
    <components.NoOptionsMessage {...props}>
        <span className="no-options">
            {props.selectProps.noOptionsText ?? 'No options available'}
        </span>
    </components.NoOptionsMessage>
);

const CustomValueContainer = (
    props: ValueContainerProps<SelectOption, boolean>
) => {
    const {
        children,
        getValue,
        selectProps: {
            maxVisibleItems,
            onOverflowClick,
            __isExpanded,
            __setIsExpanded,
        },
    } = props;

    if (!maxVisibleItems) {
        return (
            <components.ValueContainer {...props}>
                {children}
            </components.ValueContainer>
        );
    }

    const total = getValue().length;
    const limit = __isExpanded ? total : maxVisibleItems;
    const overflow = Math.max(0, total - limit);

    const childArray = React.Children.toArray(children);
    const input = childArray[childArray.length - 1];
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
    MenuList: CustomMenuList,
    NoOptionsMessage: CustomNoOptionsMessage,
    ValueContainer: CustomValueContainer,
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
    enableOverflowPopup = false,
    popupTitle,
    popupWidth,
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [popupOpen, setPopupOpen] = React.useState(false);

    const { isMulti, Component } = FIELD_TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
    const CastComponent = Component as React.ComponentType<RSProps>;

    const optionsData: SelectOption[] = options.map((opt, index) => ({
        value: opt.value,
        label: opt.label ?? opt.value,
        index,
    }));

    const handleOverflowClick = () => {
        if (enableOverflowPopup) {
            setPopupOpen(true);
        } else {
            onOverflowClick?.();
        }
    };

    const sharedprops = {
        name,
        placeholder,
        className: `${inputClass ?? ''} select-wrapper`,
        value: resolveValue(value, optionsData, isMulti),
        options: optionsData,
        isMulti,
        isDisabled: disabled,
        isClearable,
        onChange: (raw: OnChangeValue<SelectOption, boolean>) =>
            onChange(extractValue(raw ?? (isMulti ? [] : null), isMulti)),
        styles: buildStyles(isMulti),
        components: CUSTOM_COMPONENTS,
        formatCreateLabel,
        onOverflowClick: handleOverflowClick,
        __isExpanded: isExpanded,
        __setIsExpanded: setIsExpanded,
        menuContent,
        keepMenuOpenOnMenuContentClick,
        noOptionsText,
    };

    return (
        <div
            className={`form-select-field-wrapper ${wrapperClass ?? ''}`}
            style={{ width: size ?? '' }}
        >
            {selectDeselect && (
                <ButtonInputUI
                    position="left"
                    buttons={[
                        {
                            text: selectDeselectLabel,
                            color: 'purple',
                            onClick: (e) => {
                                e.preventDefault();
                                onSelectDeselectAll?.(e);
                            },
                        },
                    ]}
                />
            )}
            <CastComponent {...sharedprops} maxVisibleItems={maxVisibleItems} />
            {enableOverflowPopup && (
                <PopupUI
                    position="lightbox"
                    open={popupOpen}
                    onClose={() => setPopupOpen(false)}
                    showBackdrop
                    width={popupWidth ?? 28}
                    header={{
                        title: popupTitle ?? name ?? 'Selected Items',
                        showCloseButton: true,
                    }}
                >
                    <CastComponent {...sharedprops} />
                </PopupUI>
            )}
        </div>
    );
};

const SelectInput: FieldComponent = {
    render: ({ field, value, onChange, canAccess, settings }) => {
        const { type } = FIELD_TYPE_CONFIG[field.type] ?? DEFAULT_CONFIG;
        let resolvedOptions: FieldOptions = field.options || [];

        // Handle dependent fields (ex: state depends on country)
        // if (field.dependent?.key && field.options) {
        //     const parentValue = settings?.[field.dependent.key];
        //     resolvedOptions = field.options?.[parentValue] || {};
        // }

        // Convert options to react-select format
        const formattedOptions = Array.isArray(resolvedOptions)
            ? resolvedOptions.map((opt) => ({
                  value: String(opt.value),
                  label: opt.label ?? String(opt.value),
              }))
            : Object.entries(resolvedOptions || {}).map(([value, label]) => ({
                  value: String(value),
                  label: String(label),
              }));

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
                options={formattedOptions}
                value={coerceToString(value)}
                onChange={(val) => {
                    if (!canAccess) {
                        return;
                    }

                    if (JSON.stringify(val) === JSON.stringify(value)) {
                        return; // prevent unnecessary update
                    }

                    onChange(val);
                }}
                menuContent={field.menuContent}
                keepMenuOpenOnMenuContentClick={
                    field.keepMenuOpenOnMenuContentClick
                }
                noOptionsText={field.noOptionsText}
                formatCreateLabel={field.formatCreateLabel}
                disabled={!canAccess}
                enableOverflowPopup={field.enableOverflowPopup}
                popupTitle={field.popupTitle}
                popupWidth={field.popupWidth}
            />
        );
    },

    validate: (field, value) => {
        if (
            field.required &&
            (!value || (Array.isArray(value) && value.length === 0))
        ) {
            return `${field.label} is required`;
        }
        return null;
    },
};

export default SelectInput;
