/**
 * External dependencies
 */
import React from 'react';
import Select, { components } from 'react-select';
import type {
    MultiValue,
    SingleValue,
    ActionMeta,
    StylesConfig,
} from 'react-select';

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
        e: React.MouseEvent< HTMLButtonElement >
    ) => void;
    options: SelectOptions[];
    value?: string | string[];
    inputClass?: string;
    type?: 'single-select' | 'multi-select';
    onChange?: (
        newValue: SingleValue< SelectOptions > | MultiValue< SelectOptions >,
        actionMeta: ActionMeta< SelectOptions >
    ) => void;
    onClick?: ( e: React.MouseEvent< HTMLInputElement > ) => void;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    preText?: React.ReactNode;
    postText?: React.ReactNode;    
    size?: string;
    menuContent?: React.ReactNode;
    keepMenuOpenOnMenuContentClick?: boolean;
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
            {menuContent && (
                <div
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

            {props.children}
        </components.MenuList>
    );
};

const SelectInput: React.FC< SelectInputProps > = ( {
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
    description,
    descClass,
    preText,
    postText,
    size,
    menuContent,
    keepMenuOpenOnMenuContentClick,
} ) => {
    const customStyles: StylesConfig< SelectOptions, boolean > = {
        control: ( provided, state ) => ( {
            ...provided,
            borderColor: state.isFocused
                ? 'var(--colorPrimary)'
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
        } ),
        valueContainer: ( provided ) => ( {
            ...provided,
            margin: 0,
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor: 'transparent',
        } ),
        option: ( provided, state ) => ( {
            ...provided,
            backgroundColor: state.isSelected
                ? 'var(--backgroundPrimary)'
                : state.isFocused
                ? 'var(--backgroundColor)'
                : 'var(--backgroundWhite)',
            color: state.isSelected ? 'var(--textColor)' : 'var(--themeColor)',
            cursor: 'pointer',
        } ),
        menu: ( provided ) => ( {
            ...provided,
            borderRadius: 4,
            marginTop: 0,
        } ),
        multiValue: ( provided ) => ( {
            ...provided,
            backgroundColor: 'var(--backgroundPrimary)',
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
        } ),
        multiValueLabel: ( provided ) => ( {
            ...provided,
            color: 'var(--colorPrimary)',
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
        } ),
    };

    // Convert options to react-select format
    const optionsData: SelectOptions[] = options.map( ( option, index ) => ( {
        value: option.value,
        label: option.label,
        index,
    } ) );

    // Find default selected value
    const defaultValue = Array.isArray( value )
        ? optionsData.filter( ( opt ) => new Set( value ).has( opt.value ) ) // If it's an array (multi-select), return null or handle differently
        : optionsData.find( ( opt ) => opt.value === value ) || null;

    return (
        <div className={ `form-select-field-wrapper ${wrapperClass || '' }`} style={ { width: size || '100%' } }>
            { selectDeselect && (
                <button
                    className={ selectDeselectClass }
                    onClick={ ( e ) => {
                        e.preventDefault();
                        onMultiSelectDeselectChange?.( e );
                    } }
                >
                    { selectDeselectValue }
                </button>
            ) }

            <div className="select-wrapper">
                { preText && <div className="before">{ preText }</div> }
                <Select
                    name={ name }
                    className={ `${ inputClass } react-select` }
                    value={ defaultValue }
                    options={ optionsData }
                    onChange={ ( newValue, actionMeta ) => {
                        onChange?.( newValue, actionMeta );
                    } }
                    styles={ customStyles }
                    closeMenuOnSelect={ true }
                    isMulti={ type === 'multi-select' }
                    components={{ MenuList: CustomMenuList }}
                    menuContent={menuContent}
                    keepMenuOpenOnMenuContentClick={
                        keepMenuOpenOnMenuContentClick
                    }
                />
                { postText && <div className="after">{ postText }</div> }
            </div>
            { description && (
                <p
                    className="settings-metabox-description"
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </div>
    );
};

export default SelectInput;
