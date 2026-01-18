import { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import Recaptcha from './Recaptcha';

const FreeForm = ( props: any ) => {
    let { formFields, onSubmit } = props;
    if ( ! formFields ) formFields = [];

    const [ fileName, setFileName ] = useState( '' );
    const [ errorMessage, setErrorMessage ] = useState( '' );
    const [ captchaStatus, setCaptchaStatus ] = useState( false );
    const [ validationErrors, setValidationErrors ] = useState<
        Record< string, string >
    >( {} );

    /**
     * Handle input change
     * @param {*} e
     */
    const handleChange = (
        e: React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement >
    ) => {
        const { name, value, type } = e.target;
        const filesizeLimitField = formFields.find(
            ( item: any ) => item.key === 'filesize-limit'
        );
        const maxFileSize = filesizeLimitField.label * 1024 * 1024;

        if ( type === 'file' ) {
            const input = e.target as HTMLInputElement;
            const file = input.files?.[ 0 ];
            // check file size
            if ( file ) {
                setFileName( file.name );
                if ( file.size > maxFileSize ) {
                    setErrorMessage(
                        sprintf(
                            /* translators: %s: file size in MB */
                            __(
                                'File size exceeds %s MB. Please upload a smaller file.',
                                'catalogx'
                            ),
                            filesizeLimitField.label
                        )
                    );
                    return;
                }
                setErrorMessage( '' ); // Clear any previous error message
                setFileName( file.name ); // Store the uploaded file name
            }
            setInputs( ( prevData ) => ( {
                ...prevData,
                [ name ]: input.files?.[ 0 ],
            } ) );
        } else {
            setInputs( ( prevData ) => ( {
                ...prevData,
                [ name ]: value,
            } ) );
        }
    };

    const [ inputs, setInputs ] = useState( () => {
        const initialState: Record< string, any > = {};
        formFields.forEach( ( field: any ) => {
            if ( enquiryFormData.default_placeholder[ field.key ] ) {
                initialState[ field.key ] =
                    enquiryFormData.default_placeholder[ field.key ];
            }
        } );
        return initialState;
    } );

    /**
     * Handle input submit
     * @param {*} e
     */
    const handleSubmit = ( e: React.MouseEvent< HTMLButtonElement > ) => {
        e.preventDefault();

        // Basic validation checks
        const errors: Record< string, string > = {};
        formFields.forEach( ( field: any ) => {
            if (
                field.active &&
                ( field.key === 'name' || field.key === 'email' )
            ) {
                const value = inputs[ field.key ] || '';

                // Check if the field is empty
                if ( ! value.trim() ) {
                    errors[ field.key ] =
                        enquiryFormData.error_strings.required;
                }

                // Email format validation
                if ( field.key === 'email' && value ) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if ( ! emailRegex.test( value ) ) {
                        errors[ field.key ] =
                            enquiryFormData.error_strings.invalid;
                    }
                }
            }
        } );

        // If there are errors, set state and return (prevent submission)
        if ( Object.keys( errors ).length > 0 ) {
            setValidationErrors( errors );
            return;
        }

        const data = new FormData();

        for ( const key in inputs ) {
            if ( inputs.hasOwnProperty( key ) ) {
                data.append( key, inputs[ key ] );
            }
        }

        onSubmit( data );
    };

    return (
        <div className="form-wrapper">
            { formFields.map( ( field: any ) => {
                if ( ! field.active ) {
                    return null;
                }

                switch ( field.key ) {
                    case 'name':
                        return (
                            <div className="section-wrapper">
                                <label htmlFor={ field.key }>
                                    { field.label }
                                </label>
                                <div className="items-wrapper">
                                    <input
                                        type="text"
                                        id={ field.key }
                                        name={ field.key }
                                        className="basic-input"
                                        value={
                                            enquiryFormData.default_placeholder
                                                .name || inputs[ field.key ]
                                        }
                                        onChange={ handleChange }
                                        required
                                    />
                                    { validationErrors[ field.key ] && (
                                        <p className="error-message">
                                            { validationErrors[ field.key ] }
                                        </p>
                                    ) }
                                </div>
                            </div>
                        );
                    case 'email':
                        return (
                            <div className="section-wrapper">
                                <label htmlFor={ field.key }>
                                    { field.label }
                                </label>
                                <div className="items-wrapper">
                                    <input
                                        type="email"
                                        id={ field.key }
                                        name={ field.key }
                                        className="basic-input"
                                        value={
                                            enquiryFormData.default_placeholder
                                                .email || inputs[ field.key ]
                                        }
                                        onChange={ handleChange }
                                        required
                                    />
                                    { validationErrors[ field.key ] && (
                                        <p className="error-message">
                                            { validationErrors[ field.key ] }
                                        </p>
                                    ) }
                                </div>
                            </div>
                        );
                    case 'phone':
                        return (
                            <div className="section-wrapper">
                                <label htmlFor={ field.key }>
                                    { field.label }
                                </label>
                                <input
                                    type="number"
                                    id={ field.key }
                                    className="basic-input"
                                    name={ field.key }
                                    value={ inputs[ field.key ] }
                                    onChange={ handleChange }
                                    required
                                />
                            </div>
                        );
                    case 'address':
                    case 'subject':
                    case 'comment':
                        return (
                            <div className="section-wrapper">
                                <label htmlFor={ field.key }>
                                    { field.label }
                                </label>
                                <textarea
                                    name={ field.key }
                                    id={ field.key }
                                    className="textarea-basic"
                                    value={ inputs[ field.key ] }
                                    onChange={ handleChange }
                                    required
                                />
                            </div>
                        );
                    case 'fileupload':
                        return (
                            <div className="section-wrapper">
                                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                <label className="attachment-main-label">
                                    { field.label }
                                </label>
                                <div className="attachment-section items-wrapper">
                                    { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                    <label
                                        htmlFor="dropzone-file"
                                        className="attachment-label"
                                    >
                                        <div className="wrapper">
                                            <i className="adminfont-cloud-upload"></i>
                                            <p className="heading">
                                                { fileName === '' ? (
                                                    <>
                                                        <span>
                                                            { __(
                                                                'Click to upload',
                                                                'catalogx'
                                                            ) }
                                                        </span>{ ' ' }
                                                        { __(
                                                            'or drag and drop',
                                                            'catalogx'
                                                        ) }
                                                    </>
                                                ) : (
                                                    fileName
                                                ) }
                                            </p>
                                        </div>
                                        <input
                                            name={ field.key }
                                            onChange={ handleChange }
                                            required
                                            id="dropzone-file"
                                            type="file"
                                            className="hidden"
                                        />
                                    </label>
                                    { errorMessage && (
                                        <p className="error-message">
                                            { errorMessage }
                                        </p>
                                    ) }
                                </div>
                            </div>
                        );
                    case 'captcha':
                        return (
                            <div className="section-wrapper">
                                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                <label>{ field.label }</label>
                                <div className="recaptcha-wrapper items-wrapper">
                                    <Recaptcha
                                        captchaValid={ (
                                            validStatus: boolean
                                        ) => setCaptchaStatus( validStatus ) }
                                    />
                                </div>
                            </div>
                        );
                    default:
                        return null;
                }
            } ) }

            <section className="buttons-wrapper">
                <button
                    onClick={ ( e ) => {
                        const captcha = formFields?.find(
                            ( field: any ) => field.key === 'captcha'
                        );
                        if ( captcha?.active && ! captchaStatus ) return;
                        handleSubmit( e );
                    } }
                >
                    { __( 'Submit', 'catalogx' ) }
                </button>

                <button
                    id="catalogx-close-enquiry-popup"
                    className="catalogx-close-enquiry-popup"
                >
                    { __( 'Close', 'catalogx' ) }
                </button>
            </section>
        </div>
    );
};

export default FreeForm;
