// External dependencies
import React, { useState, useEffect } from 'react';

// Types
interface Option {
    id: string; 
    label: string;
    value: string;
    isdefault?: boolean;
}

interface MultipleOptionsFormField {
    label: string;
    type?: string;
    options?: Option[];
}

interface MultipleOptionsProps {
    formField: MultipleOptionsFormField;
    type: 'radio' | 'checkboxes' | 'dropdown' | 'multiselect';
    selected: boolean;
}

const MultipleOptions: React.FC< MultipleOptionsProps > = ( {
    formField,
    type,
} ) => {
    const [ options, setOptions ] = useState< Option[] >( () => {
        return Array.isArray( formField.options ) && formField.options.length
            ? formField.options
            : [];
    } );

    useEffect( () => {
        setOptions(
            Array.isArray( formField.options ) ? formField.options : []
        );
    }, [ formField.options ] );

    const renderInputFields = ( fieldType: string ) => {
        switch ( fieldType ) {
            case 'radio':
                return options.map( ( option, idx ) => (
                    <div className="radio-basic-input-wrap" key={ idx }>
                        <input
                            type="radio"
                            id={ `radio-${ idx }` }
                            value={ option.value }
                        />
                        <label htmlFor={ `radio-${ idx }` }>
                            { option.label }
                        </label>
                    </div>
                ) );
            case 'checkboxes':
                return options.map( ( option, idx ) => (
                    <div className="radio-basic-input-wrap" key={ idx }>
                        <input
                            type="checkbox"
                            id={ `checkbox-${ idx }` }
                            value={ option.value }
                        />
                        <label htmlFor={ `checkbox-${ idx }` }>
                            { option.label }
                        </label>
                    </div>
                ) );
            case 'dropdown':
            case 'multiselect':
                return (
                    <select className="basic-select">
                        <option>Select...</option>
                        { options.map( ( option, idx ) => (
                            <option key={ idx } value={ option.value }>
                                { option.label }
                            </option>
                        ) ) }
                    </select>
                );
            default:
                return <p>Unsupported input type</p>;
        }
    };

    return (
        <>
            <p>{ formField.label }</p>
            <div className="settings-form-group-radio">
                { renderInputFields( type ) }
            </div>
        </>
    );
};

export default MultipleOptions;