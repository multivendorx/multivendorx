/**
 * External dependencies
 */
import React from 'react';
import Select from 'react-select';
import type { MultiValue, SingleValue, ActionMeta } from 'react-select';

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
}

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
    proSetting,
    description,
    descClass,
} ) => {
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            borderColor: state.isFocused ? '#5007aa' : '#e0e4e9',
            boxShadow: state.isFocused ? '0 0 0 3px #5007aa1c' : '',
            // '&:hover': { borderColor: '#5007aa' },
            // maxHeight: '2.188rem',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#ece2f9f1'
                : state.isFocused
                ? '#ece2f9f1'
                : 'white',
            color: state.isSelected ? 'black' : 'black',
            cursor: 'pointer',
            padding: 10,
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: 4,
            marginTop: 0,
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: '#007bff33',
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: '#007bff',
        }),
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
        <div className={ wrapperClass }>
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
            <Select
                name={ name }
                className={ inputClass }
                value={ defaultValue }
                options={ optionsData }
                onChange={ ( newValue, actionMeta ) => {
                    onChange?.( newValue, actionMeta );
                } }
                styles={customStyles}
                closeMenuOnSelect={true}
                isMulti={ type === 'multi-select' } 
            />
            { proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span> }
            { description && (
                <p
                    className={ descClass }
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </div>
    );
};

export default SelectInput;
