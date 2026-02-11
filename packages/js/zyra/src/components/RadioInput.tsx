// External dependencies
import React, { ChangeEvent } from 'react';
import { FieldComponent } from './types';

// Types
interface RadioOption {
    key: string;
    keyName?: string;
    value: string | number;
    label?: string;
    name?: string;
    color?: string[] | string; // Can be an array of colors or an image URL
}

interface RadioInputProps {
    name?: string;
    wrapperClass?: string;
    inputWrapperClass?: string;
    activeClass?: string;
    inputClass?: string;
    idPrefix?: string;
    type?: 'default';
    options: RadioOption[];
    value?: string;
    onChange?: ( e: ChangeEvent< HTMLInputElement > ) => void;
    radiSelectLabelClass?: string;
    labelImgClass?: string;
    labelOverlayClass?: string;
    labelOverlayText?: string;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    keyName?: string;
}

export const RadioInputUI: React.FC< RadioInputProps > = ( props ) => {
    if(!props.options.length){
        return null;
    }
    return (
        <>
            <div className={ props.wrapperClass }>
                { props.options.map( ( option ) => {
                    const checked = props.value === option.value;
                    return (
                        <div
                            key={ option.key }
                            className={ `${ props.inputWrapperClass } ${
                                checked ? props.activeClass : ''
                            }` }
                        >
                            <input
                                className={ props.inputClass }
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
            { props.description && (
                <p
                    className={ props.descClass }
                    dangerouslySetInnerHTML={ { __html: props.description } }
                ></p>
            ) }
        </>
    );
};

const RadioInput: FieldComponent = {
    render:({ field, value, onChange, canAccess, appLocalizer }) => (
        <RadioInputUI
            wrapperClass={ field.wrapperClass }
            inputWrapperClass={ field.inputWrapperClass }
            activeClass={ field.activeClass }
            inputClass={ field.className }
            idPrefix={ field.key }
            options={
                Array.isArray( field.options )
                    ? field.options.map( ( opt ) => ( {
                          key: String( opt.value ),
                          value: String( opt.value ) || '',
                          label: opt.label || String( opt.value ),
                          name: field.key,
                      } ) )
                    : []
            }
            value={ value }
            onChange={ ( e ) => {
                if ( ! canAccess ) return;
                onChange( e.target.value );
            } }
            description={ field.description ? appLocalizer.__( field.description ) : '' }
            descClass={ field.descClass }
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
