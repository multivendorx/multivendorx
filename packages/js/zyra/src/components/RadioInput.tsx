/**
 * External dependencies
 */
import React, { ChangeEvent } from 'react';

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

const RadioInput: React.FC< RadioInputProps > = ( props ) => {
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

export default RadioInput;
