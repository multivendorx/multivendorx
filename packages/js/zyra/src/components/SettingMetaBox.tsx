/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

import '../styles/web/SettingMetaBox.scss';

// Types
interface FormField {
    type: string;
    name: string;
    placeholder?: string;
    charlimit?: number;
    row?: number;
    column?: number;
    sitekey?: string;
    filesize?: number;
    required?: boolean;
    disabled?: boolean;
}

interface InputType {
    value: string;
    label: string;
}

interface Option {
    label: string;
    value: string;
    isdefault?: boolean;
}

interface SettingMetaBoxProps {
    // For setting meta
    formField?: FormField;
    inputTypeList?: InputType[];
    onChange: ( field: string, value: any ) => void;
    onTypeChange?: ( value: string ) => void;
    opened: { click: boolean };
    // For optino meta
    metaType?: string;
    option?: Option;
    setDefaultValue?: () => void;
}

interface FormFieldSelectProps {
    inputTypeList: InputType[];
    formField: FormField;
    onTypeChange: ( value: string ) => void;
}

interface FieldWrapperProps {
    label: string;
    className?: string;
    children: React.ReactNode;
}

interface InputFieldProps {
    label: string;
    type?: string;
    value: any;
    onChange: ( value: string | React.ChangeEvent< HTMLInputElement > ) => void;
    className?: string;
}

const FormFieldSelect: React.FC< FormFieldSelectProps > = ( {
    inputTypeList,
    formField,
    onTypeChange,
} ) => (
    <FieldWrapper label="Type">
        <select
            onChange={ ( event ) => onTypeChange?.( event.target.value ) }
            value={ formField.type }
            className="basic-select"
        >
            { inputTypeList.map( ( inputType ) => (
                <option key={ inputType.value } value={ inputType.value }>
                    { inputType.label }
                </option>
            ) ) }
        </select>
    </FieldWrapper>
);

const FieldWrapper: React.FC< FieldWrapperProps > = ( {
    label,
    children,
    className,
} ) => (
    <div
        className={ `modal-content-section-field ${ className || '' }` }
        role="button"
        tabIndex={ 0 }
        onClick={ ( e ) => e.stopPropagation() }
    >
        <p>{ label }</p>
        { children }
    </div>
);

const InputField: React.FC< InputFieldProps > = ( {
    label,
    type = 'text',
    value,
    onChange,
    className,
} ) => (
    <FieldWrapper label={ label } className={ className }>
        <input
            type={ type }
            value={ value || '' }
            onChange={ ( e ) => onChange( e.target.value ) }
        />
    </FieldWrapper>
);

const SettingMetaBox: React.FC< SettingMetaBoxProps > = ( {
    formField,
    inputTypeList,
    onChange,
    onTypeChange,
    opened,
    option,
    metaType = 'setting-meta',
    setDefaultValue,
} ) => {
    const [ hasOpened, setHasOpened ] = useState( opened.click );
    const isValidSiteKey = ( key: string ) =>
        /^6[0-9A-Za-z_-]{39}$/.test( key );
    const [ isSiteKeyEmpty, setIsSiteKeyEmpty ] = useState(
        formField?.type === 'recaptcha' &&
            ! isValidSiteKey( formField.sitekey || '' )
    );

    useEffect( () => {
        if ( formField?.type === 'recaptcha' ) {
            onChange( 'disabled', isSiteKeyEmpty );
        }
    }, [ isSiteKeyEmpty, formField?.type ] );

    useEffect( () => {
        setHasOpened( opened.click );
    }, [ opened ] );

    // Renders conditional fields based on `formField.type`.
    const renderConditionalFields = () => {
        const commonFields = (
            <>
                <InputField
                    label="Placeholder"
                    value={ formField?.placeholder }
                    onChange={ ( value ) => onChange( 'placeholder', value ) }
                />
                <InputField
                    label="Character Limit"
                    type="number"
                    value={ formField?.charlimit }
                    onChange={ ( value ) => onChange( 'charlimit', value ) }
                />
            </>
        );

        switch ( formField?.type ) {
            case 'text':
            case 'email':
            case 'url':
            case 'textarea':
                return (
                    <>
                        { commonFields }
                        { formField.type === 'textarea' && (
                            <>
                                <InputField
                                    label="Row"
                                    type="number"
                                    value={ formField.row }
                                    onChange={ ( value ) =>
                                        onChange( 'row', value )
                                    }
                                />
                                <InputField
                                    label="Column"
                                    type="number"
                                    value={ formField.column }
                                    onChange={ ( value ) =>
                                        onChange( 'column', value )
                                    }
                                />
                            </>
                        ) }
                    </>
                );
            case 'recaptcha':
                return (
                    <>
                        <InputField
                            label="Site Key"
                            value={ formField.sitekey }
                            className={ isSiteKeyEmpty ? 'highlight' : '' }
                            onChange={ ( value ) => {
                                onChange( 'sitekey', value );
                                setIsSiteKeyEmpty(
                                    ! isValidSiteKey( value as string )
                                );
                            } }
                        />
                        <p>
                            Register your site with your Google account to
                            obtain the{ ' ' }
                            <a
                                href="https://www.google.com/recaptcha"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                reCAPTCHA script
                            </a>
                            .
                        </p>
                    </>
                );
            case 'attachment':
                return (
                    <InputField
                        label="Maximum File Size"
                        type="number"
                        value={ formField.filesize }
                        onChange={ ( value ) => onChange( 'filesize', value ) }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            role="button"
            tabIndex={ 0 }
            onClick={ () => setHasOpened( ( prevState ) => ! prevState ) }
        >
            <i className="admin-font adminlib-menu"></i>
            { hasOpened && (
                <Draggable>
                    <section className="meta-setting-modal">
                        <button
                            className="wrapper-close"
                            onClick={ ( event ) => {
                                event.stopPropagation();
                                setHasOpened( false );
                            } }
                        >
                            <i className="admin-font adminlib-cross"></i>
                        </button>
                        <main className="meta-setting-modal-content">
                            <h3>Input Field Settings</h3>
                            <div className="setting-modal-content-section">
                                { metaType === 'setting-meta' ? (
                                    <FormFieldSelect
                                        inputTypeList={
                                            inputTypeList as InputFieldProps[]
                                        }
                                        formField={ formField as FormField }
                                        onTypeChange={
                                            onTypeChange as () => void
                                        }
                                    />
                                ) : (
                                    <InputField
                                        label="Value"
                                        value={ option?.value }
                                        onChange={ ( e ) =>
                                            onChange(
                                                'value',
                                                (
                                                    e as React.ChangeEvent< HTMLInputElement >
                                                 ).target?.value
                                            )
                                        }
                                    />
                                ) }
                                <InputField
                                    label={
                                        metaType === 'setting-meta'
                                            ? 'Name'
                                            : 'Label'
                                    }
                                    value={
                                        metaType === 'setting-meta'
                                            ? formField?.name
                                            : option?.label
                                    }
                                    onChange={ ( value ) => {
                                        if ( metaType === 'setting-meta' ) {
                                            onChange( 'name', value as string );
                                        } else {
                                            onChange(
                                                'label',
                                                (
                                                    value as React.ChangeEvent< HTMLInputElement >
                                                 ).target.value
                                            );
                                        }
                                    } }
                                />
                                { metaType === 'setting-meta' &&
                                    renderConditionalFields() }
                            </div>
                            <div className="setting-modal-content-section">
                                { metaType === 'setting-meta' && (
                                    <FieldWrapper label="Visibility">
                                        <div className="visibility-control-container">
                                            <div className="tabs">
                                                <input
                                                    checked={
                                                        formField?.type ===
                                                        'recaptcha'
                                                            ? ! isSiteKeyEmpty
                                                            : ! formField?.disabled
                                                    }
                                                    onChange={ ( e ) =>
                                                        onChange(
                                                            'disabled',
                                                            ! e.target.checked
                                                        )
                                                    }
                                                    type="radio"
                                                    id="visible"
                                                    name="tabs"
                                                />
                                                <label
                                                    className="tab"
                                                    htmlFor="visible"
                                                >
                                                    Visible
                                                </label>

                                                <input
                                                    checked={
                                                        formField?.type ===
                                                        'recaptcha'
                                                            ? isSiteKeyEmpty
                                                            : formField?.disabled
                                                    }
                                                    onChange={ ( e ) =>
                                                        onChange(
                                                            'disabled',
                                                            e.target.checked
                                                        )
                                                    }
                                                    type="radio"
                                                    id="hidden"
                                                    name="tabs"
                                                />
                                                <label
                                                    className="tab"
                                                    htmlFor="hidden"
                                                >
                                                    Hidden
                                                </label>
                                            </div>
                                        </div>
                                    </FieldWrapper>
                                ) }
                                <FieldWrapper
                                    label={
                                        metaType === 'setting-meta'
                                            ? 'Required'
                                            : 'Set default'
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            metaType === 'setting-meta'
                                                ? formField?.required
                                                : option?.isdefault
                                        }
                                        onChange={ ( e ) => {
                                            if ( metaType === 'setting-meta' ) {
                                                onChange(
                                                    'required',
                                                    e.target.checked
                                                );
                                            } else if ( setDefaultValue ) {
                                                setDefaultValue();
                                            }
                                        } }
                                    />
                                </FieldWrapper>
                            </div>
                        </main>
                    </section>
                </Draggable>
            ) }
        </div>
    );
};

export default SettingMetaBox;
