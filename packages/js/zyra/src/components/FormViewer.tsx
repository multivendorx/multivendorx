import React, { useState, useEffect } from "react";
import Select, { MultiValue, SingleValue, ActionMeta } from "react-select";
import Button from "./DisplayButton";
import "../styles/web/FormViewer.scss";

declare global {
    interface Window {
        grecaptcha?: {
            ready: ( callback: () => void ) => void;
            execute: (
                siteKey: string,
                options: { action: string }
            ) => Promise< string >;
        };
    }
}

interface Option {
    value: string;
    label: string;
    isdefault?: boolean;
}

interface Field {
    type: string;
    name?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    charlimit?: number;
    row?: number;
    col?: number;
    disabled?: boolean;
    options?: Option[];
    sitekey?: string;
    key?: string;
}

interface FormFields {
    formfieldlist: Field[];
    butttonsetting?: any;
}

export interface FormViewerProps {
    formFields: FormFields;
    onSubmit: ( data: FormData ) => void;
}

const Checkboxes: React.FC< {
    options: Option[];
    onChange: ( data: string[] ) => void;
} > = ( { options, onChange } ) => {
    const [ checkedItems, setCheckedItems ] = useState< Option[] >(
        options.filter( ( { isdefault } ) => isdefault )
    );

    useEffect( () => {
        onChange( checkedItems.map( ( item ) => item.value ) );
    }, [ checkedItems ] );

    const handleChange = ( option: Option, checked: boolean ) => {
        const newCheckedItems = checkedItems.filter(
            ( item ) => item.value !== option.value
        );
        if ( checked ) newCheckedItems.push( option );
        setCheckedItems( newCheckedItems );
    };

    return (
        <div className="multiselect-container items-wrapper">
            { options.map( ( option ) => (
                <div key={ option.value } className="select-items">
                    <input
                        type="checkbox"
                        id={ option.value }
                        checked={
                            !! checkedItems.find(
                                ( item ) => item.value === option.value
                            )
                        }
                        onChange={ ( e ) =>
                            handleChange( option, e.target.checked )
                        }
                    />
                    <label htmlFor={ option.value }>{ option.label }</label>
                </div>
            ) ) }
        </div>
    );
};

const Multiselect: React.FC< {
    options: Option[];
    onChange: ( value: string[] | string | null ) => void;
    isMulti?: boolean;
} > = ( { options = [], onChange, isMulti = false } ) => {
    const [ selectedOptions, setSelectedOptions ] = useState<
        MultiValue< Option > | SingleValue< Option >
    >(
        isMulti
            ? options.filter( ( { isdefault } ) => isdefault )
            : options.find( ( { isdefault } ) => isdefault ) || null
    );

    const handleChange = (
        newValue: MultiValue< Option > | SingleValue< Option >,
        actionMeta: ActionMeta< Option >
    ) => {
        setSelectedOptions( newValue );
        if ( isMulti ) {
            onChange(
                Array.isArray( newValue )
                    ? newValue.map( ( option ) => option.value )
                    : []
            );
        } else {
            onChange( newValue ? ( newValue as Option ).value : null );
        }
    };

    return (
        <Select
            isMulti={ isMulti }
            value={ selectedOptions }
            onChange={ handleChange }
            options={ options }
        />
    );
};

const FormViewer: React.FC< FormViewerProps > = ( {
    formFields,
    onSubmit,
} ) => {
    const [ inputs, setInputs ] = useState< Record< string, any > >( {} );
    const formList = formFields.formfieldlist || [];
    const buttonSetting = formFields.butttonsetting || {};
    const [ captchaToken, setCaptchaToken ] = useState< string | null >( null );
    const [ captchaError, setCaptchaError ] = useState< boolean >( false );
    const recaptchaField = formList.find(
        ( field ) => field.type === "recaptcha"
    );
    const siteKey = recaptchaField?.sitekey || null;

    useEffect( () => {
        if ( ! siteKey ) return;

        const loadRecaptcha = () => {
            window.grecaptcha?.ready( () => {
                window.grecaptcha
                    ?.execute( siteKey, { action: "form_submission" } )
                    .then( ( token ) => setCaptchaToken( token ) )
                    .catch( () => setCaptchaError( true ) );
            } );
        };

        if ( ! window.grecaptcha ) {
            const script = document.createElement( "script" );
            script.src = `https://www.google.com/recaptcha/api.js?render=${ siteKey }`;
            script.async = true;
            script.onload = loadRecaptcha;
            script.onerror = () => setCaptchaError( true );
            document.body.appendChild( script );
        } else {
            loadRecaptcha();
        }
    }, [ siteKey ] );

    const handleChange = ( name: string, value: any ) => {
        setInputs( ( prevData ) => ( { ...prevData, [ name ]: value } ) );
    };

    const handleSubmit = () => {
        // e.preventDefault();
        const data = new FormData();
        Object.keys( inputs ).forEach( ( key ) =>
            data.append( key, inputs[ key ] )
        );
        onSubmit( data );
    };

    return (
        <main className="catalogx-enquiry-pro-form">
            { formList.map( ( field ) => {
                if ( field.disabled ) return null;
                switch ( field.type ) {
                    case "text":
                        return (
                            <section
                                className="form-text form-pro-sections"
                                key={ field.name }
                            >
                                <label>{ field.label }</label>
                                <input
                                    type="text"
                                    name={ field.name }
                                    placeholder={ field.placeholder }
                                    onChange={ ( e ) =>
                                        handleChange(
                                            field.name!,
                                            e.target.value
                                        )
                                    }
                                />
                            </section>
                        );
                    case "checkboxes":
                        return (
                            <section
                                className="form-pro-sections"
                                key={ field.name }
                            >
                                <label>{ field.label }</label>
                                <Checkboxes
                                    options={ field.options || [] }
                                    onChange={ ( data ) =>
                                        handleChange( field.name!, data )
                                    }
                                />
                            </section>
                        );
                    default:
                        return null;
                }
            } ) }
            <section className="popup-footer-section">
                <Button
                    customStyle={ buttonSetting }
                    onClick={ () => handleSubmit() }
                >
                    Submit
                </Button>
            </section>
        </main>
    );
};

export default FormViewer;
