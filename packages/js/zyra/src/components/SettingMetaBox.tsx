/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';

import '../styles/web/SettingMetaBox.scss';
import StyleControls from './StyleControl';

type FormFieldValue = string | number | boolean | Option[];
type SettingFieldKey = keyof FormField | 'value' | 'style' | 'layout';

// Types
interface Option {
    id: string;
    label: string;
    value: string;
    isdefault?: boolean;
}

interface FormField {
    type: string;
    name: string;
    placeholder?: string;
    charlimit?: number;
    row?: number;
    column?: number;
    label?: string;
    sitekey?: string;
    filesize?: number;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    options?: Option[];
    html?: string;
    style?: any;
    layout?: '1' | '2-50' | '2-66' | '3' | '4';
}

interface InputType {
    value: string;
    label: string;
}

interface SettingMetaBoxProps {
    formField?: FormField;
    inputTypeList?: InputType[];
    onChange: ( field: SettingFieldKey, value: FormFieldValue ) => void;
    onTypeChange?: ( value: string ) => void;
    opened: { click: boolean };
    metaType?: string;
    option?: Option;
    setDefaultValue?: () => void;
}

interface FieldWrapperProps {
    label: string;
    className?: string;
    children: React.ReactNode;
}

interface InputFieldProps {
    label: string;
    type?: string;
    value: string | number;
    onChange: ( value: string ) => void;
    className?: string;
    readonly?: boolean;
}

interface FormFieldSelectProps {
    inputTypeList: InputType[];
    formField: FormField;
    onTypeChange: ( value: string ) => void;
}

// ---------------- Components ----------------

const FieldWrapper: React.FC< FieldWrapperProps > = ( {
    label,
    children,
    className,
} ) => (
    <div
        className={ `edit-field-wrapper ${ className || '' }` }
        role="button"
        tabIndex={ 0 }
        onClick={ ( e ) => e.stopPropagation() }
    >
        <label>{ label }</label>
        { children }
    </div>
);

const InputField: React.FC< InputFieldProps > = ( {
    label,
    type = 'text',
    value,
    onChange,
    className,
    readonly = false,
} ) => (
    <FieldWrapper label={ label } className={ className }>
        <input
            type={ type }
            value={ value || '' }
            className="basic-input"
            onChange={ ( e ) => onChange( e.target.value ) }
            readOnly={ readonly }
        />
    </FieldWrapper>
);

const FormFieldSelect: React.FC< FormFieldSelectProps > = ( {
    inputTypeList,
    formField,
    onTypeChange,
} ) => (
    <FieldWrapper label="Type">
        <select
            onChange={ ( e ) => onTypeChange( e.target.value ) }
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

const SettingMetaBox: React.FC< SettingMetaBoxProps > = ( {
    formField,
    inputTypeList = [],
    onChange,
    onTypeChange,
    opened,
    option,
    metaType = 'setting-meta',
    setDefaultValue,
} ) => {
    const [ hasOpened, setHasOpened ] = useState( opened.click );
    const [ expandedLayoutGroup, setExpandedLayoutGroup ] = useState( false );

    const isValidSiteKey = ( key: string ) =>
        /^6[0-9A-Za-z_-]{39}$/.test( key );
    const [ isSiteKeyEmpty, setIsSiteKeyEmpty ] = useState(
        formField?.type === 'recaptcha' &&
            ! isValidSiteKey( formField.sitekey || '' )
    );

    useEffect( () => {
        setHasOpened( opened.click );
    }, [ opened ] );

    useEffect( () => {
        if ( formField?.type === 'recaptcha' ) {
            onChange( 'disabled', isSiteKeyEmpty );
        }
    }, [ isSiteKeyEmpty ] );

    // ---------------- Conditional fields ----------------
    const renderConditionalFields = () => {
        const commonFields = (
            <>
                <InputField
                    label="Placeholder"
                    value={ formField?.placeholder || '' }
                    onChange={ ( value ) => onChange( 'placeholder', value ) }
                />
                <InputField
                    label="Character limit"
                    type="number"
                    value={ formField?.charlimit?.toString() || '' }
                    onChange={ ( value ) =>
                        onChange( 'charlimit', Number( value ) )
                    }
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
                                    value={ formField.row?.toString() || '' }
                                    onChange={ ( value ) =>
                                        onChange( 'row', Number( value ) )
                                    }
                                />
                                <InputField
                                    label="Column"
                                    type="number"
                                    value={ formField.column?.toString() || '' }
                                    onChange={ ( value ) =>
                                        onChange( 'column', Number( value ) )
                                    }
                                />
                            </>
                        ) }
                    </>
                );

            case 'richtext':
                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <StyleControls
                            style={formField.style || {}}
                            onChange={(style) => onChange('style', style)}
                            includeTextStyles={true}
                        />
                    </div>
                );

            case 'columns':
                return (
                    <>
                        <div className="setting-group" onClick={(e) => e.stopPropagation()}>
                            <div 
                                className="setting-group-header" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedLayoutGroup(!expandedLayoutGroup);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <h4>Layout</h4>
                                <i className={`adminfont-${expandedLayoutGroup ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
                            </div>
                            {expandedLayoutGroup && (
                                <div className="setting-group-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="field-wrapper">
                                        <label>Column Layout</label>
                                        <select
                                            value={formField.layout || '2-50'}
                                            className="basic-input"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onChange('layout', e.target.value);
                                            }}
                                        >
                                            <option value="1">1 Column</option>
                                            <option value="2-50">50 / 50</option>
                                            <option value="2-66">66 / 34</option>
                                            <option value="3">3 Columns</option>
                                            <option value="4">4 Columns</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                            <StyleControls
                                style={formField.style || {}}
                                onChange={(style) => onChange('style', style)}
                                includeTextStyles={false}
                            />
                        </div>
                    </>
                );

            case 'recaptcha':
                return (
                    <>
                        <InputField
                            label="Site key"
                            value={ formField.sitekey || '' }
                            className={ isSiteKeyEmpty ? 'highlight' : '' }
                            onChange={ ( value ) => {
                                onChange( 'sitekey', value );
                                setIsSiteKeyEmpty( ! isValidSiteKey( value ) );
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

            case 'multiselect':
            case 'dropdown':
            case 'checkboxes':
            case 'radio':
                return (
                    <div
                        className="multioption-wrapper"
                        onClick={ ( e ) => e.stopPropagation() }
                    >
                        <label htmlFor="">Set option</label>
                        <ReactSortable
                            list={ formField.options || [] }
                            setList={ ( newList: Option[] ) =>
                                onChange( 'options', newList )
                            }
                            handle=".drag-handle-option"
                        >
                            { ( formField.options || [] ).map(
                                ( opt, index ) => (
                                    <div
                                        className="option-list-wrapper drag-handle-option"
                                        key={ opt.id || index }
                                    >
                                        <div className="option-icon admin-badge blue">
                                            <i className="adminfont-drag"></i>
                                        </div>
                                        <div className="option-label ">
                                            <input
                                                type="text"
                                                className="basic-input"
                                                value={ opt.label }
                                                onChange={ ( e ) => {
                                                    const newOptions = [
                                                        ...( formField.options ||
                                                            [] ),
                                                    ];
                                                    newOptions[ index ] = {
                                                        ...newOptions[ index ],
                                                        label: e.target.value,
                                                    };
                                                    onChange(
                                                        'options',
                                                        newOptions
                                                    );
                                                } }
                                            />
                                        </div>
                                        <div className="option-icon admin-badge red">
                                            <div
                                                role="button"
                                                className="delete-btn adminfont-delete"
                                                tabIndex={ 0 }
                                                onClick={ () => {
                                                    const newOptions = (
                                                        formField.options || []
                                                    ).filter(
                                                        ( _, i ) => i !== index
                                                    );
                                                    onChange(
                                                        'options',
                                                        newOptions
                                                    );
                                                } }
                                            ></div>
                                        </div>
                                    </div>
                                )
                            ) }
                        </ReactSortable>

                        <div className="buttons-wrapper">
                            <div
                                className="add-more-option-section admin-btn btn-purple"
                                role="button"
                                tabIndex={ 0 }
                                onClick={ () => {
                                    const newOptions = [
                                        ...( formField.options || [] ),
                                        {
                                            id: crypto.randomUUID(),
                                            label: 'Option value',
                                            value: 'value',
                                        },
                                    ];
                                    onChange( 'options', newOptions );
                                } }
                            >
                                Add new{ ' ' }
                                <span>
                                    <i className="admin-font adminfont-plus"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'attachment':
                return (
                    <InputField
                        label="Max File Size"
                        type="number"
                        value={ formField.filesize?.toString() || '' }
                        onChange={ ( value ) =>
                            onChange( 'filesize', Number( value ) )
                        }
                    />
                );

            default:
                return null;
        }
    };

    return (
        <>
            { hasOpened && (
                <main className="meta-setting-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="settings-title">
                        { formField?.type
                            ? `${
                                  formField.type.charAt( 0 ).toUpperCase() +
                                  formField.type.slice( 1 )
                              } field settings`
                            : 'Input field settings' }
                    </div>

                    { /* Always show label */ }
                    <InputField
                        label="Field label"
                        value={ formField?.label || '' }
                        onChange={ ( value ) => onChange( 'label', value ) }
                    />

                    { /*If readonly → show only Label, Placeholder, Visibility */ }
                    { formField?.readonly ? (
                        <>
                            <InputField
                                label="Placeholder"
                                value={ formField?.placeholder || '' }
                                onChange={ ( value ) =>
                                    onChange( 'placeholder', value )
                                }
                            />

                            <FieldWrapper label="Visibility">
                                <div className="toggle-setting-container">
                                    <div className="toggle-setting-wrapper">
                                        <div>
                                            <input
                                                checked={
                                                    ! formField?.disabled
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
                                                className="toggle-setting-form-input"
                                            />
                                            <label htmlFor="visible">
                                                Visible
                                            </label>
                                        </div>

                                        <div>
                                            <input
                                                checked={ formField?.disabled }
                                                onChange={ ( e ) =>
                                                    onChange(
                                                        'disabled',
                                                        e.target.checked
                                                    )
                                                }
                                                type="radio"
                                                id="hidden"
                                                name="tabs"
                                                className="toggle-setting-form-input"
                                            />
                                            <label htmlFor="hidden">
                                                Hidden
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </FieldWrapper>
                        </>
                    ) : (
                        <>
                            { /*All normal editable fields go here when not readonly */ }
                            { metaType === 'setting-meta' ? (
                                <FormFieldSelect
                                    inputTypeList={ inputTypeList }
                                    formField={ formField as FormField }
                                    onTypeChange={ ( type ) =>
                                        onTypeChange?.( type )
                                    }
                                />
                            ) : (
                                <InputField
                                    label="Value"
                                    value={ option?.value || '' }
                                    onChange={ ( value ) =>
                                        onChange( 'value', value )
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
                                        ? formField?.name || ''
                                        : option?.label || ''
                                }
                                readonly={
                                    metaType === 'setting-meta' &&
                                    formField?.readonly
                                }
                                onChange={ ( value ) => {
                                    if ( metaType === 'setting-meta' ) {
                                        onChange( 'name', value );
                                    } else {
                                        onChange( 'label', value );
                                    }
                                } }
                            />

                            { metaType === 'setting-meta' &&
                                renderConditionalFields() }

                            { metaType === 'setting-meta' && 
                              formField?.type !== 'richtext' && 
                              formField?.type !== 'columns' && (
                                <FieldWrapper label="Visibility">
                                    <div className="toggle-setting-container">
                                        <div className="toggle-setting-wrapper">
                                            <div>
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
                                                    className="toggle-setting-form-input"
                                                />
                                                <label htmlFor="visible">
                                                    Visible
                                                </label>
                                            </div>

                                            <div>
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
                                                    className="toggle-setting-form-input"
                                                />
                                                <label htmlFor="hidden">
                                                    Hidden
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </FieldWrapper>
                            ) }

                            { metaType === 'setting-meta' && 
                              formField?.type !== 'richtext' && 
                              formField?.type !== 'columns' && (
                                <FieldWrapper
                                    label={
                                        metaType === 'setting-meta'
                                            ? 'Required'
                                            : 'Set default'
                                    }
                                >
                                    <div className="input-wrapper">
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
                                    </div>
                                </FieldWrapper>
                            )}
                        </>
                    ) }
                </main>
            ) }
        </>
    );
};

export default SettingMetaBox;