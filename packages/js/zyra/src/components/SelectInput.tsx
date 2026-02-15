// External dependencies
import React from 'react';
import Select, { components } from 'react-select';
import type {
    MultiValue,
    SingleValue,
    ActionMeta,
    StylesConfig,
} from 'react-select';

// Internal dependencies
import { FieldComponent } from './types';

// Types
export interface SelectOptions {
    value: string;
    label?: string;
    index?: number;
}

interface SelectInputProps {
    wrapperClass?: string;
    selectDeselect?: boolean;
    selectDeselectClass?: string;
    selectDeselectValue?: string;
    name?: string;
    onMultiSelectDeselectChange?: (
        e: React.MouseEvent<HTMLButtonElement>
    ) => void;
    options: SelectOptions[];
    value?: string | string[];
    inputClass?: string;
    type?: 'single-select' | 'multi-select';
    onChange?: (
        newValue: SingleValue<SelectOptions> | MultiValue<SelectOptions>,
        actionMeta: ActionMeta<SelectOptions>
    ) => void;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    proSetting?: boolean;
    preText?: React.ReactNode;
    postText?: React.ReactNode;
    size?: string;
    menuContent?: React.ReactNode;
    keepMenuOpenOnMenuContentClick?: boolean;
    noOptionsText?: string;
}
const CustomMenuList = (props: any) => {
    const {
        selectProps: {
            menuContent,
            keepMenuOpenOnMenuContentClick,
        },
    } = props;

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

const CustomNoOptionsMessage = (props: any) => {
    const {
        selectProps: { noOptionsText, noOptionsFontSize },
    } = props;

    return (
        <components.NoOptionsMessage {...props}>
            <span className="no-options">
                {noOptionsText || 'No options available'}
            </span>
        </components.NoOptionsMessage>
    );
};

export const SelectInputUI: React.FC<SelectInputProps> = ({
    wrapperClass,
    selectDeselect,
    selectDeselectClass,
    selectDeselectValue,
    name,
    onMultiSelectDeselectChange,
    options,
    value,
    inputClass,
    type = 'single-select',
    onChange,
    preText,
    postText,
    size,
    menuContent,
    keepMenuOpenOnMenuContentClick,
}) => {
    const customStyles: StylesConfig<SelectOptions, boolean> = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused
                ? 'var(--borderColor)'
                : 'var(--borderColor)',
            boxShadow: state.isFocused ? 'var(--box-shadow-theme)' : '',
            backgroundColor: 'transparent',
            color: 'var(--textColor)',
            minHeight: '2.213rem',
            height: '2.213rem',
            maxHeight: '2.213rem',
            paddingTop: 0,
            paddingBottom: 0,
            margin: 0,

            '&:active': {
                color: 'var(--colorPrimary)',
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            margin: 0,
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: 'transparent',
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: '0.95rem',
            backgroundColor: state.isSelected
                ? 'var(--backgroundPrimary)'
                : state.isFocused
                    ? 'var(--backgroundColor)'
                    : 'var(--backgroundWhite)',
            color: state.isSelected 
            ? 'var(--textColor)' 
            : 'var(--themeColor)',
            cursor: 'pointer',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: 4,
            marginTop: 0,
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: 'var(--backgroundPrimary)',
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: 'var(--colorPrimary)',
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
        }),
    };

    // Convert options to react-select format
    const optionsData: SelectOptions[] = options.map((option, index) => ({
        value: option.value,
        label: option.label,
        index,
    }));

    // Find default selected value
    const defaultValue = Array.isArray(value)
        ? optionsData.filter((opt) => new Set(value).has(opt.value)) // If it's an array (multi-select), return null or handle differently
        : optionsData.find((opt) => opt.value === value) || null;

    return (
        <div className={`form-select-field-wrapper ${wrapperClass || ''}`} style={{ width: size || '100%' }}>
            {selectDeselect && (
                <button
                    className={selectDeselectClass}
                    onClick={(e) => {
                        e.preventDefault();
                        onMultiSelectDeselectChange?.(e);
                    }}
                >
                    {selectDeselectValue}
                </button>
            )}

            <div className="select-wrapper">
                {preText && <div className="before">{preText}</div>}
                <Select
                    name={name}
                    className={`${inputClass} react-select`}
                    value={defaultValue}
                    options={optionsData}
                    onChange={(newValue, actionMeta) => {
                        onChange?.(newValue, actionMeta);
                    }}
                    styles={customStyles}
                    // closeMenuOnSelect={true}
                    isMulti={type === 'multi-select'}
                    components={{ MenuList: CustomMenuList, NoOptionsMessage: CustomNoOptionsMessage, }}
                    menuContent={menuContent}
                    keepMenuOpenOnMenuContentClick={
                        keepMenuOpenOnMenuContentClick
                    }
                />
                {postText && <div className="after">{postText}</div>}
            </div>
        </div>
    );
};

const SelectInput: FieldComponent = {
  render: ({ field, value, onChange, canAccess, appLocalizer }) => (
    <SelectInputUI
        wrapperClass={field.wrapperClass}
        name={field.key}
        inputClass={field.className}
        size={field.size}
        type={field.type}
        selectDeselect={field.selectDeselect}
        selectDeselectValue="Select / Deselect All"
        options={
            Array.isArray(field.options)
                ? field.options.map((opt) => ({
                    value: String(opt.value),
                    label: opt.label ?? String(opt.value),
                }))
                : []
        }
        value={
            typeof value === 'number'
                ? value.toString()
                : value
        }
        onChange={(newValue) => {
            if (!canAccess) return;

            if (Array.isArray(newValue)) {
            // multi-select
            const values = newValue.map((opt) => opt.value);
            onChange(values);
            } else {
            // single-select
            onChange(newValue.value);
            }
      }}
    />
  ),

  validate: (field, value) => {
    if (field.required && !value?.[field.key]) {
      return `${field.label} is required`;
    }
    return null;
  },
};

export default SelectInput;
