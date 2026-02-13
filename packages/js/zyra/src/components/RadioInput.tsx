// External dependencies
import React from 'react';
import { FieldComponent } from './types';

// Types
interface RadioOption {
    key: string;
    value: string | number;
    label?: string;
    name?: string;
}

interface RadioInputProps {
    name?: string;
    idPrefix?: string;
    type?: 'default';
    options: RadioOption[];
    value?: string;
    onChange: (val: string | number) => void;
}

const RadioInputUI: React.FC< RadioInputProps > = ( props ) => {
    return (
        <>
            <div className="settings-form-group-radio">
                { props.options.map( ( option ) => {
                    const checked = props.value === option.value;
                    return (
                        <div
                            key={ option.key }
                            className={`radio-basic-input-wrap ${
                                checked ? 'radio-select-active' : ''
                            }`}
                        >
                            <input
                                className="setting-form-input"
                                id={ `${ props.idPrefix }-${ option.key }` }
                                type="radio"
                                name={ option.name }
                                checked={ checked }
                                value={ option.value }
                                onChange={ ( e ) => props.onChange?.( e ) }
                            />
                            <label
                                htmlFor={ `${ props.idPrefix }-${ option.key }` }
                            >
                                { option.label }
                            </label>
                        </div>
                    );
                } ) }
            </div>
        </>
    );
};

const RadioInput: FieldComponent = {
    render: ({ field, value, onChange, canAccess }) => (
        <RadioInputUI
            name={field.name}
            idPrefix={field.idPrefix}
            value={
                typeof value === 'number'
                    ? value.toString()
                    : value
            }
            options={Array.isArray(value) ? value : []} // array of radio options (ensure it's an array)
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val)
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

export default RadioInput;