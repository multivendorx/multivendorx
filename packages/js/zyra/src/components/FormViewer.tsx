/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import type { MultiValue, SingleValue } from 'react-select';

type InputValue =
    | string
    | number
    | boolean
    | File
    | string[]
    | null
    | undefined;

/**
 * Internal dependencies
 */
import Button from './DisplayButton';

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
    id: string;
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
    fields?: Field[];
}

interface ButtonSetting {
    button_text?: string;
    [ key: string ]: string | number | boolean | undefined;
}

interface FormFields {
    formfieldlist: Field[];
    butttonsetting?: ButtonSetting;
}

interface FormViewerProps {
    formFields: FormFields;
    response?: Record< string, string | number | File | undefined >; // previously `any`
    onSubmit: (
        data: Record< string, string | number | File | undefined >
    ) => void;
    countryList?: Option[];
    stateList?: Record< string, Option[] | Record< string, string > >;
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
        if ( checked ) {
            newCheckedItems.push( option );
        }
        setCheckedItems( newCheckedItems );
    };

    return (
        <>
            { options.map( ( option ) => (
                <label
                    htmlFor={ option.value }
                    className="woocommerce-form__label woocommerce-form__label-for-checkbox"
                >
                    <input
                        type="checkbox"
                        className="woocommerce-form__input woocommerce-form__input-checkbox"
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
                    <span>{ option.label }</span>
                </label>
            ) ) }
        </>
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
        newValue: MultiValue< Option > | SingleValue< Option >
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
    options: Option[];
    onChange: ( value: string | undefined ) => void;
};

/**
 * Render radio
 * @param {*} props
 */
const Radio: React.FC< RadioProps > = ( { options, onChange } ) => {
    const [ selectdedItem, setSelectdedItem ] = useState< string | undefined >(
        options.find( ( { isDefault } ) => isDefault )?.value
    );

    useEffect( () => {
        onChange( selectdedItem );
    }, [ selectdedItem, onChange ] );

    const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
        setSelectdedItem( e.target.value );
    };
    return (
        <div className="multiselect-container items-wrapper">
            { options.map( ( option, index ) => {
                return (
                    <label
                        className="woocommerce-form__label woocommerce-form__label-for-radio"
                        data-index={ index }
                        htmlFor={ option.value }
                    >
                        <input
                            type="radio"
                            className="woocommerce-form__input woocommerce-form__input-radio"
                            id={ option.value }
                            value={ option.value }
                            checked={ selectdedItem === option.value }
                            onChange={ handleChange }
                        />
                        <span>{ option.label }</span>
                    </label>
                );
            } ) }
        </div>
    );
};
type FormDataType = {
    default_placeholder: {
        name: string;
        email: string;
    };
};

const enquiryFormData: FormDataType = {
    default_placeholder: { name: '', email: '' },
};
const wholesaleFormData: FormDataType = {
    default_placeholder: { name: '', email: '' },
};
const enquiryCartTable: FormDataType = {
    default_placeholder: { name: '', email: '' },
};

const FormViewer: React.FC< FormViewerProps > = ( {
    formFields,
    response,
    onSubmit,
    countryList,
    stateList,
} ) => {
    const [ inputs, setInputs ] = useState< Record< string, InputValue > >(
        {}
    );
    const formList = formFields.formfieldlist || [];
    const buttonSetting = formFields.butttonsetting || {};
    const [ captchaToken, setCaptchaToken ] = useState< string | null >( null );
    const [ captchaError, setCaptchaError ] = useState< boolean >( false );
    const [ errors, setErrors ] = useState< Record< string, string > >( {} );
    const [ fileName, setFileName ] = useState< string >( '' );
    const recaptchaField = formList.find(
        ( field ) => field.type === 'recaptcha'
    );
    const siteKey = recaptchaField?.sitekey || null;
    useEffect( () => {
        if ( response ) {
            setInputs( response );
        }
    }, [ response ] );
    useEffect( () => {
        if ( ! siteKey ) {
            return;
        }

        const loadRecaptcha = () => {
            window.grecaptcha?.ready( () => {
                window.grecaptcha
                    ?.execute( siteKey, { action: 'form_submission' } )
                    .then( ( token ) => setCaptchaToken( token ) )
                    .catch( () => setCaptchaError( true ) );
            } );
        };

        if ( ! window.grecaptcha ) {
            const script = document.createElement( 'script' );
            script.src = `https://www.google.com/recaptcha/api.js?render=${ siteKey }`;
            script.async = true;
            script.onload = loadRecaptcha;
            script.onerror = () => setCaptchaError( true );
            document.body.appendChild( script );
        } else {
            loadRecaptcha();
        }
    }, [ siteKey ] );

    const handleChange = ( name: string, value: InputValue ) => {
        setInputs( ( prevData ) => ( { ...prevData, [ name ]: value } ) );
    };

    const handleFileChange = (
        name: string,
        event: React.ChangeEvent< HTMLInputElement >
    ) => {
        const files = event.target.files;
        const selectedFile = files && files[ 0 ];
        if ( selectedFile ) {
            setFileName( selectedFile.name );
            setInputs( ( prevData ) => ( {
                ...prevData,
                [ name ]: selectedFile,
            } ) );
        }
    };

    const handleSubmit = async ( e: React.MouseEvent< HTMLButtonElement > ) => {
        e.preventDefault();

        const error: Record< string, string > = {};

        formList.forEach( ( field ) => {
            if ( ! field.required || field.disabled ) {
                return;
            }
            // Skip validation for 'name' and 'email'
            if (
                ! field.name ||
                field.name === 'name' ||
                field.name === 'email'
            ) {
                return;
            }

            const value = field.name ? inputs[ field.name ] : undefined;

            switch ( field.type ) {
                case 'text':
                case 'email':
                case 'textarea':
                case 'datepicker':
                case 'timepicker':
                    if (
                        ! value ||
                        ( typeof value === 'string' && value.trim() === '' )
                    ) {
                        error[ field.name ] = `${ field.label } is required.`;
                    }
                    break;

                case 'checkboxes':
                case 'multiselect':
                    if ( ! Array.isArray( value ) || value.length === 0 ) {
                        error[ field.name ] = `${ field.label } is required.`;
                    }
                    break;

                case 'dropdown':
                case 'radio':
                    if ( ! value ) {
                        error[ field.name ] = `${ field.label } is required.`;
                    }
                    break;

                case 'attachment':
                    if ( ! value ) {
                        error[ field.name ] = `${ field.label } is required.`;
                    }
                    break;
            }
        } );

        if ( Object.keys( error ).length > 0 ) {
            setErrors( error );
            return;
        }

        setErrors( {} );

        const data = new FormData();

        for ( const key in inputs ) {
            if ( Object.prototype.hasOwnProperty.call( inputs, key ) ) {
                const value = inputs[ key ];
                if ( value !== undefined && value !== null ) {
                    if (
                        typeof value === 'number' ||
                        typeof value === 'boolean'
                    ) {
                        data.append( key, value.toString() );
                    } else if ( Array.isArray( value ) ) {
                        data.append( key, JSON.stringify( value ) );
                    } else {
                        data.append( key, value as string | Blob );
                    }
                }
            }
        }

        const submitData: Record< string, string | number | File | undefined > =
            {};
        for ( const key in inputs ) {
            const value = inputs[ key ];
            if ( value !== undefined && value !== null ) {
                // Exclude null values
                submitData[ key ] = value as string | number | File | undefined;
            }
        }
        onSubmit( submitData );
    };

    const defaultDate: string = new Date().getFullYear() + '-01-01';

    return (
        <form className="woocommerce-form woocommerce-form-login login">
            { formList.map( ( field ) => {
                if ( field.disabled ) {
                    return null;
                }
                switch ( field.type ) {
                    case 'title':
                        return <h2> { field.label } </h2>;
                    case 'text':
                        return (
                            <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <input
                                    type="text"
                                    name={ field.name }
                                    className="input-text"
                                    value={
                                        ( field.name === 'name'
                                            ? ( typeof enquiryFormData !==
                                                  'undefined' &&
                                                  enquiryFormData
                                                      ?.default_placeholder
                                                      ?.name ) ||
                                              ( typeof wholesaleFormData !==
                                                  'undefined' &&
                                                  wholesaleFormData
                                                      ?.default_placeholder
                                                      ?.name ) ||
                                              ( typeof enquiryCartTable !==
                                                  'undefined' &&
                                                  enquiryCartTable
                                                      ?.default_placeholder
                                                      ?.name ) ||
                                              ( inputs[
                                                  field.name ?? ''
                                              ] as string )
                                            : ( inputs[
                                                  field.name ?? ''
                                              ] as string ) ) || ''
                                    }
                                    placeholder={ field.placeholder }
                                    onChange={ ( e ) =>
                                        handleChange(
                                            field.name ?? '',
                                            e.target.value
                                        )
                                    }
                                    required={ field.required }
                                    maxLength={ field.charlimit }
                                />
                                { errors[ field.name ?? '' ] && (
                                    <span className="error-text">
                                        { errors[ field.name ?? '' ] }
                                    </span>
                                ) }
                            </p>
                        );
                    case 'email':
                        return (
                            <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <input
                                    type="email"
                                    name={ field.name }
                                    className="input-text"
                                    value={
                                        ( typeof enquiryFormData !==
                                            'undefined' &&
                                            enquiryFormData?.default_placeholder
                                                ?.email ) ||
                                        ( typeof wholesaleFormData !==
                                            'undefined' &&
                                            wholesaleFormData
                                                ?.default_placeholder
                                                ?.email ) ||
                                        ( typeof enquiryCartTable !==
                                            'undefined' &&
                                            enquiryCartTable
                                                ?.default_placeholder
                                                ?.email ) ||
                                        ( inputs[
                                            field.name ?? ''
                                        ] as string ) ||
                                        ''
                                    }
                                    placeholder={ field.placeholder }
                                    onChange={ ( e ) =>
                                        handleChange(
                                            field.name ?? '',
                                            e.target.value
                                        )
                                    }
                                    required={ field.required }
                                    maxLength={ field.charlimit }
                                />
                            </p>
                        );
                    case 'textarea':
                        return (
                            <p className=" woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <textarea
                                    name={ field.name }
                                    value={
                                        ( inputs[
                                            field.name ?? ''
                                        ] as string ) || ''
                                    }
                                    placeholder={ field.placeholder }
                                    onChange={ ( e ) =>
                                        handleChange(
                                            field.name ?? '',
                                            e.target.value
                                        )
                                    }
                                    required={ field.required }
                                    maxLength={ field.charlimit }
                                    rows={ field.row }
                                    cols={ field.col }
                                    className="input-text"
                                />
                                { errors[ field.name ?? '' ] && (
                                    <span className="error-text">
                                        { errors[ field.name ?? '' ] }
                                    </span>
                                ) }
                            </p>
                        );
                    case 'checkboxes':
                        return (
                            <p
                                className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide"
                                key={ field.name }
                            >
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <Checkboxes
                                    options={ field.options || [] }
                                    onChange={ ( data ) =>
                                        handleChange( field.name!, data )
                                    }
                                />
                            </p>
                        );
                    case 'multiselect':
                        return (
                            <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <div className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                    <Multiselect
                                        options={ field.options ?? [] }
                                        onChange={ ( data ) =>
                                            handleChange(
                                                field.name ?? '',
                                                data
                                            )
                                        }
                                        isMulti
                                    />
                                </div>
                                { errors[ field.name ?? '' ] && (
                                    <span className="error-text">
                                        { errors[ field.name ?? '' ] }
                                    </span>
                                ) }
                            </p>
                        );
                    case 'dropdown':
                        return (
                            <p className=" woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <div className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                    <Multiselect
                                        options={ field.options ?? [] }
                                        onChange={ ( data ) =>
                                            handleChange(
                                                field.name ?? '',
                                                data
                                            )
                                        }
                                    />
                                </div>
                                { errors[ field.name ?? '' ] && (
                                    <span className="error-text">
                                        { errors[ field.name ?? '' ] }
                                    </span>
                                ) }
                            </p>
                        );
                    case 'radio':
                        return (
                            <p className=" woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <Radio
                                    options={ field.options ?? [] }
                                    onChange={ ( data ) =>
                                        handleChange( field.name ?? '', data )
                                    }
                                />
                                { errors[ field.name ?? '' ] && (
                                    <span className="error-text">
                                        { errors[ field.name ?? '' ] }
                                    </span>
                                ) }
                            </p>
                        );
                    case 'recaptcha':
                        return (
                            <p className=" woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <div className="recaptcha-wrapper">
                                    <input
                                        type="hidden"
                                        name="g-recaptcha-response"
                                        value={ captchaToken as string }
                                        className="input-text"
                                    />
                                </div>
                            </p>
                        );
                    case 'attachment':
                        return (
                            <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <div className="attachment-section">
                                    <label
                                        htmlFor="dropzone-file"
                                        className="attachment-label"
                                    >
                                        &nbsp;
                                        <div className="wrapper">
                                            <i className="adminfont-cloud-upload"></i>
                                            <p className="heading">
                                                { fileName === '' ? (
                                                    <>
                                                        <span>
                                                            {
                                                                'Click to upload'
                                                            }
                                                        </span>{ ' ' }
                                                        { 'or drag and drop' }
                                                    </>
                                                ) : (
                                                    fileName
                                                ) }
                                            </p>
                                        </div>
                                        <input
                                            readOnly
                                            id="dropzone-file"
                                            type="file"
                                            className="hidden"
                                            onChange={ ( e ) =>
                                                handleFileChange(
                                                    field.name ?? '',
                                                    e
                                                )
                                            } // Handle file input change
                                        />
                                    </label>
                                </div>
                                { errors[ field.name ?? '' ] && (
                                    <span className="error-text">
                                        { errors[ field.name ?? '' ] }
                                    </span>
                                ) }
                            </p>
                        );
                    case 'datepicker':
                        return (
                            <p className=" woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <div className="date-picker-wrapper">
                                    <input
                                        type="date"
                                        value={
                                            ( inputs[
                                                field.name ?? ''
                                            ] as string ) || defaultDate
                                        }
                                        onChange={ ( e ) => {
                                            handleChange(
                                                field.name ?? '',
                                                e.target.value
                                            );
                                        } }
                                        className="input-text"
                                    />
                                </div>
                                { errors[ field.name ?? '' ] && (
                                    <span className="error-text">
                                        { errors[ field.name ?? '' ] }
                                    </span>
                                ) }
                            </p>
                        );
                    case 'timepicker':
                        return (
                            <p className=" woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                <label htmlFor={ field.name }>
                                    { field.label }
                                </label>
                                <input
                                    type="time"
                                    value={
                                        ( inputs[
                                            field.name ?? ''
                                        ] as string ) || ''
                                    }
                                    className="input-text"
                                    onChange={ ( e ) => {
                                        handleChange(
                                            field.name ?? '',
                                            e.target.value
                                        );
                                    } }
                                />
                                { errors[ field.name ?? '' ] && (
                                    <span className="error-text">
                                        { errors[ field.name ?? '' ] }
                                    </span>
                                ) }
                            </p>
                        );
                    case 'section':
                        return (
                            <p className=" woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                                { field.label }
                            </p>
                        );
                    case 'divider':
                        return <p className="section-divider-container"></p>;

                    case 'address':
                        return (
                            <fieldset key={ field.id }>
                                <legend>{ field.label }</legend>
                                { field.fields?.map( ( subField: Field ) => {
                                    if ( subField.disabled ) {
                                        return null;
                                    }
                                    const inputName = `${ subField.key }`;
                                    const value = inputs[ inputName ] ?? '';

                                    // Helper: build state options for a country code
                                    const buildStateOptions = (
                                        countryCode: string | undefined
                                    ) => {
                                        if ( ! countryCode || ! stateList ) {
                                            return [];
                                        }

                                        const raw = stateList[ countryCode ];

                                        // Case A: already an array of { label, value }
                                        if ( Array.isArray( raw ) ) {
                                            return raw;
                                        }

                                        // Case B: object like { WB: 'West Bengal', MH: 'Maharashtra' }
                                        if ( raw && typeof raw === 'object' ) {
                                            return Object.entries( raw ).map(
                                                ( [ code, name ] ) => ( {
                                                    label: String( name ),
                                                    value: String( code ),
                                                } )
                                            );
                                        }

                                        // Fallback: empty
                                        return [];
                                    };

                                    // 🔹 Handle country dropdown
                                    if ( subField.key === 'country' ) {
                                        return (
                                            <p
                                                className="woocommerce-form-row woocommerce-form-row--first form-row form-row-first"
                                                key={ subField.id }
                                            >
                                                <label htmlFor={ inputName }>
                                                    { subField.label }
                                                </label>
                                                <Multiselect
                                                    options={
                                                        countryList || []
                                                    }
                                                    // Multiselect returns a string (value) for single-select in your implementation
                                                    onChange={ (
                                                        selectedCountryValue
                                                    ) => {
                                                        // selectedCountryValue should be a string (or null)
                                                        const countryVal =
                                                            selectedCountryValue ||
                                                            null;
                                                        handleChange(
                                                            inputName,
                                                            countryVal
                                                        );

                                                        // Clear / reset state when country changes
                                                        handleChange(
                                                            'state',
                                                            null
                                                        );
                                                    } }
                                                />
                                            </p>
                                        );
                                    }

                                    // 🔹 Handle state dropdown (depends on selected country)
                                    if ( subField.key === 'state' ) {
                                        const selectedCountryValue =
                                            inputs[ 'country' ];
                                        const availableStates =
                                            buildStateOptions(
                                                selectedCountryValue as
                                                    | string
                                                    | undefined
                                            );

                                        return (
                                            <p
                                                className="woocommerce-form-row woocommerce-form-row--last form-row form-row-last"
                                                key={ subField.id }
                                            >
                                                <label htmlFor={ inputName }>
                                                    { subField.label }
                                                </label>
                                                <Multiselect
                                                    options={ availableStates }
                                                    onChange={ (
                                                        selectedStateValue
                                                    ) =>
                                                        handleChange(
                                                            inputName,
                                                            selectedStateValue
                                                        )
                                                    }
                                                />
                                            </p>
                                        );
                                    }

                                    // 🔹 Normal text fields
                                    if ( subField.type === 'text' ) {
                                        return (
                                            <p
                                                className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide"
                                                key={ subField.id }
                                            >
                                                <label htmlFor={ inputName }>
                                                    { subField.label }
                                                </label>
                                                <input
                                                    type="text"
                                                    id={ inputName }
                                                    name={ inputName }
                                                    placeholder={
                                                        subField.placeholder
                                                    }
                                                    value={
                                                        ( value as string ) ||
                                                        ''
                                                    }
                                                    required={
                                                        field.required ||
                                                        subField.required
                                                    }
                                                    onChange={ ( e ) =>
                                                        handleChange(
                                                            inputName,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </p>
                                        );
                                    }

                                    return null;
                                } ) }
                            </fieldset>
                        );

                    default:
                        return null;
                }
            } ) }
            <p className="woocommerce-form-row form-row">
                <Button
                    customStyle={ buttonSetting }
                    onClick={ ( e ) => {
                        const captcha = formList.find(
                            ( field ) => field.type === 'recaptcha'
                        );
                        if ( captcha?.disabled === false ) {
                            if ( captchaError ) {
                                return;
                            }
                            if ( ! captchaToken ) {
                                return;
                            }
                        }
                        handleSubmit( e );
                    } }
                    children={ 'Submit' }
                />
            </p>
        </form>
    );
};

export default FormViewer;
