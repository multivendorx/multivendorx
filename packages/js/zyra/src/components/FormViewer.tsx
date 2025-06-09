/**
 * External dependencies
 */
import React, { useState, useEffect } from "react";
import Select from "react-select";
import type { MultiValue, SingleValue, ActionMeta } from "react-select";

/**
 * Internal dependencies
 */
import Button from "./DisplayButton";
import "../styles/web/FormViewer.scss";

// Types
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
    isDefault?: boolean;
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
        options.filter( ( { isDefault } ) => isDefault )
    );

    useEffect( () => {
        onChange( checkedItems.map( ( item ) => item.value ) );
    }, [ checkedItems, onChange ] );

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
            ? options.filter( ( { isDefault } ) => isDefault )
            : options.find( ( { isDefault } ) => isDefault ) || null
    );

    const handleChange = (
        newValue: MultiValue< Option > | SingleValue< Option >,
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

type RadioProps = {
    options : Option[],
    onChange: (value:string | undefined)=>void;
}

/**
 * Render radio
 * @param {*} props 
 */
const Radio: React.FC<RadioProps>=({
    options,
    onChange
})=>{
    const [selectdedItem, setSelectdedItem] = useState<string | undefined>(options.find(({ isDefault }) => isDefault)?.value);

    useEffect(() => {
        onChange(selectdedItem);
    }, [selectdedItem, onChange])

    const handleChange = ( e:React.ChangeEvent<HTMLInputElement> ) => {
        setSelectdedItem(e.target.value);
    }
    return (
        <div className='multiselect-container items-wrapper'>
            {
                options.map((option, index) => {
                    return (
                        <div key={index} className='select-items'>
                            <input
                                type="radio"
                                id={option.value}
                                value={option.value}
                                checked={selectdedItem === option.value}
                                onChange={ handleChange }
                            />
                            <label htmlFor={option.value}>
                                {option.label}
                            </label>
                        </div>
                    );
                })
            }
        </div>
    );
}
type FormDataType = {
    default_placeholder:{
        name: string,
        email: string,
    }
}

const enquiryFormData: FormDataType = { default_placeholder: { name: "", email: "" } };
const wholesaleFormData: FormDataType = { default_placeholder: { name: "", email: "" } };
const enquiryCartTable: FormDataType = { default_placeholder: { name: "", email: "" } };

const FormViewer: React.FC< FormViewerProps > = ( {
    formFields,
    onSubmit,
} ) => {
    const [ inputs, setInputs ] = useState< Record< string, any > >( {} );
    const formList = formFields.formfieldlist || [];
    const buttonSetting = formFields.butttonsetting || {};
    const [ captchaToken, setCaptchaToken ] = useState< string | null >( null );
    const [ captchaError, setCaptchaError ] = useState< boolean >( false );
    const [errors, setErrors] = useState<Record<string,string>>({});
    const [fileName, setFileName] = useState<string>("");
    // const [file, setFile] = useState<File | null>(null);
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

    const handleFileChange = (name:string, event:React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        const selectedFile = files && files[0];
        if (selectedFile) {
            setFileName(selectedFile.name);
            // setFile(selectedFile);
            setInputs((prevData) => ({
                ...prevData,
                [name]: selectedFile,
            }));
        }
    }

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        formList.forEach(field => {
            if (!field.required || field.disabled) return;
            // Skip validation for 'name' and 'email'
            if (!field.name || field.name === 'name' || field.name === 'email') return;

            const value = field.name ? inputs[field.name] : undefined;

            switch (field.type) {
                case 'text':
                case 'email':
                case 'textarea':
                case 'datepicker':
                case 'timepicker':
                    if (!value || value.trim() === '') {
                        newErrors[field.name] = `${field.label} is required.`;
                    }
                    break;

                case 'checkboxes':
                case 'multiselect':
                    if (!Array.isArray(value) || value.length === 0) {
                        newErrors[field.name] = `${field.label} is required.`;
                    }
                    break;

                case 'dropdown':
                case 'radio':
                    if (!value) {
                        newErrors[field.name] = `${field.label} is required.`;
                    }
                    break;

                case 'attachment':
                    if (!value) {
                        newErrors[field.name] = `${field.label} is required.`;
                    }
                    break;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const data = new FormData();

        for (const key in inputs) {
            if (inputs.hasOwnProperty(key)) {
                data.append(key, inputs[key]);
            }
        }

        onSubmit(data);
    }

    const defaultDate: string = new Date().getFullYear()+'-01-01';

    return (
        <main className="enquiry-pro-form">
            { formList.map( ( field ) => {
                if ( field.disabled ) return null;
                switch ( field.type ) {
                    case "title":
                            return (
                                <section className="form-title"> {field.label} </section>
                            );
                    case "text":
                        return (
                            <section className='form-text form-pro-sections'>
                                <label>{field.label}</label>
                                <input
                                    type="text"
                                    name={field.name}
                                    value={
                                        field.name === 'name' 
                                            ? ((typeof enquiryFormData !== 'undefined' && enquiryFormData?.default_placeholder?.name) ||
                                            (typeof wholesaleFormData !== 'undefined' && wholesaleFormData?.default_placeholder?.name) ||
                                            (typeof enquiryCartTable !== 'undefined' && enquiryCartTable?.default_placeholder?.name) ||
                                            inputs[field.name])
                                        : inputs[field.name??""]
                                    }
                                    placeholder={field.placeholder}
                                    onChange={(e) => handleChange(field.name??"", e.target.value)}
                                    required={field.required}
                                    maxLength={field.charlimit}
                                />
                                {errors[field.name??""] && <span className="error-text">{errors[field.name??""]}</span>}
                            </section>
                        );
                    case "email":
                        return (
                            <section className='form-email form-pro-sections'>
                                <label>{field.label}</label>
                                <input
                                    type="email"
                                    name={field.name}
                                    value={
                                        (typeof enquiryFormData !== 'undefined' && enquiryFormData?.default_placeholder?.email) ||
                                        (typeof wholesaleFormData !== 'undefined' && wholesaleFormData?.default_placeholder?.email) ||
                                        (typeof enquiryCartTable !== 'undefined' && enquiryCartTable?.default_placeholder?.email) ||
                                        inputs[field.name??""]
                                    }

                                    placeholder={field.placeholder}
                                    onChange={(e) => handleChange(field.name??"", e.target.value)}
                                    required={field.required}
                                    maxLength={field.charlimit}
                                />
                            </section>
                        );
                    case "textarea":
                        return (
                            <section className=' form-pro-sections'>
                                <label>{field.label}</label>
                                <textarea
                                    name={field.name}
                                    value={inputs[field.name??""]}
                                    placeholder={field.placeholder}
                                    onChange={(e) => handleChange(field.name??"", e.target.value)}
                                    required={field.required}
                                    maxLength={field.charlimit}
                                    rows={field.row}
                                    cols={field.col}
                                />
                                {errors[field.name??""] && <span className="error-text">{errors[field.name??""]}</span>}
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
                        case "multiselect":
                            return (
                                <section className=' form-pro-sections'>
                                    <label>{field.label}</label>
                                    <div className='multiselect-container'>
                                        <Multiselect
                                            options={field.options??[]}
                                            onChange={(data) => handleChange(field.name??"", data)}
                                            isMulti
                                        />
                                    </div>
                                    {errors[field.name??""] && <span className="error-text">{errors[field.name??""]}</span>}
                                </section>
                            );
                        case "dropdown":
                            return (
                                <section className=' form-pro-sections'>
                                    <label>{field.label}</label>
                                    <div className='multiselect-container'>
                                        <Multiselect
                                            options={field.options??[]}
                                            onChange={(data) => handleChange(field.name??"", data)}
                                        />
                                    </div>
                                    {errors[field.name??""] && <span className="error-text">{errors[field.name??""]}</span>}
                                </section>
                            );
                        case "radio":
                            return (
                                <section className=' form-pro-sections'>
                                    <label>{field.label}</label>
                                    <Radio
                                        options={field.options??[]}
                                        onChange={(data) => handleChange(field.name??"", data)}
                                    />
                                    {errors[field.name??""] && <span className="error-text">{errors[field.name??""]}</span>}
                                </section>
                            );
                        case "recaptcha":
                            return (
                                <section className=' form-pro-sections'>
                                    <div className='recaptcha-wrapper'>
                                        <input type="hidden" name="g-recaptcha-response" value={captchaToken as string} />
                                    </div>
                                </section>
                            );
                        case "attachment":
                            return (
                                <section className='form-pro-sections'>
                                    <label>{field.label}</label>
                                    <div className="attachment-section">
                                        <label
                                            htmlFor="dropzone-file"
                                            className="attachment-label"
                                        >
                                            <div className="wrapper">
                                                <i className="adminLib-cloud-upload"></i>
                                                <p className="heading">
                                                    {fileName === '' ? (
                                                        <>
                                                            <span>{ 'Click to upload' }</span> { 'or drag and drop' }
                                                        </>
                                                    ) : fileName}
                                                </p>
                                            </div>
                                            <input readOnly id="dropzone-file" type="file" className="hidden" 
                                             onChange={(e) => handleFileChange(field.name??"", e)} // Handle file input change
                                             />
                                        </label>
                                    </div>
                                    {errors[field.name??""] && <span className="error-text">{errors[field.name??""]}</span>}
                                </section>
                            );
                        case "datepicker":
                            return (
                                <section className=' form-pro-sections'>
                                    <label>{field.label}</label>
                                    <div className='date-picker-wrapper'>
                                        <input
                                            type='date'
                                            value={inputs[field.name??""] || defaultDate}
                                            onChange={(e) => { handleChange(field.name??"", e.target.value) }}
                                        />
                                    </div>
                                    {errors[field.name??""] && <span className="error-text">{errors[field.name??""]}</span>}
                                </section>
                            );
                        case "timepicker":
                            return (
                                <section className=' form-pro-sections'>
                                    <label>{field.label}</label>
                                    <input
                                        type='time'
                                        value={inputs[field.name??""]}
                                        onChange={(e) => { handleChange(field.name??"", e.target.value) }}
                                    />
                                    {errors[field.name??""] && <span className="error-text">{errors[field.name??""]}</span>}
                                </section>
                            );
                        case "section":
                            return (
                                <section className=' form-pro-sections'>
                                    {field.label}
                                </section>
                            );
                        case "divider":
                            return(
                                <section className='section-divider-container'></section>
                            )
                    default:
                        return null;
                }
            } ) }
            <section className='popup-footer-section'>
                <Button
                    customStyle={buttonSetting}
                    onClick={(e) => {
                        const captcha = formList.find((field) => field.type === "recaptcha");
                        if (captcha?.disabled === false) {
                            if (captchaError) {
                                return;
                            }
                            if (!captchaToken) {
                                return;
                            }
                        } 
                        handleSubmit(e)
                    }}
                    children={'Submit'}
                />
                <button id='catalogx-close-enquiry-popup' className='catalogx-close-enquiry-popup'>{'Close'}</button>
            </section>
        </main>
    );
};

export default FormViewer;
