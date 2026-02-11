// External dependencies
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Internal dependencies
import SubTabSection, { MenuItem } from './SubTabSection';
import ProForm from './RegistrationForm';
import '../styles/web/FreeProFormCustomizer.scss';
import '../styles/web/RegistrationForm.scss';

//Types
interface FormField {
    key: string;
    label?: string;
    active?: boolean;
    desc?: string;
}

type FormValue = string | number | boolean | FormField[] | undefined;

interface FreeProFormCustomizerProps {
    setting: { freefromsetting?: FormField[] };
    proSetting: boolean;
    proSettingChange: () => boolean;
    moduleEnabledChange: () => boolean;
    onChange: ( key: string, value: FormValue ) => void;
}

// FormCustomizer Component
const FreeProFormCustomizer: React.FC< FreeProFormCustomizerProps > = ( {
    setting,
    proSettingChange,
    moduleEnabledChange,
    onChange,
} ) => {
    const settingChange = useRef< boolean >( false );

    // Initialize state
    const [ formFieldsData, setFormFieldsData ] = useState< FormField[] >(
        setting?.freefromsetting || []
    );

    useEffect( () => {
        if ( settingChange.current ) {
            onChange( 'freefromsetting', formFieldsData );
            settingChange.current = false;
        }
    }, [ formFieldsData, onChange ] );

    const getFields = ( fieldKey: string ): FormField | undefined => {
        return formFieldsData.find( ( { key } ) => key === fieldKey );
    };

    const activeDeactiveFields = useCallback(
        (fieldKey: string,
        activeStatus: boolean
    ) => {
        if ( moduleEnabledChange() ) {
            return;
        }
        settingChange.current = true;

        setFormFieldsData( ( prevData ) => {
            const existingField = prevData.find(
                ( { key } ) => key === fieldKey
            );
            if ( existingField ) {
                return prevData.map( ( data ) =>
                    data.key === fieldKey
                        ? { ...data, active: activeStatus }
                        : data
                );
            }
            return [
                ...prevData,
                { key: fieldKey, label: '', active: activeStatus },
            ];
        } );
    });

    const updateFieldLabel = ( fieldKey: string, labelValue: string ) => {
        if ( moduleEnabledChange() ) {
            return;
        }
        settingChange.current = true;

        setFormFieldsData( ( prevData ) => {
            const existingField = prevData.find(
                ( { key } ) => key === fieldKey
            );
            if ( existingField ) {
                return prevData.map( ( data ) =>
                    data.key === fieldKey
                        ? { ...data, label: labelValue }
                        : data
                );
            }
            return [
                ...prevData,
                { key: fieldKey, label: labelValue, active: false },
            ];
        } );
    };

    const formFields: FormField[] = [
        { key: 'name', desc: 'Name' },
        { key: 'email', desc: 'Email' },
        { key: 'phone', desc: 'Phone' },
        { key: 'address', desc: 'Address' },
        { key: 'subject', desc: 'Enquiry about' },
        { key: 'comment', desc: 'Enquiry details' },
        { key: 'fileupload', desc: 'File upload' },
        { key: 'filesize-limit', desc: 'File upload size limit (in MB)' },
        { key: 'captcha', desc: 'Captcha' },
    ];

    const menu: MenuItem[] = [
        { name: 'Free', link: 'hi', id: '2', icon: 'adminfont-info' },
        { name: 'Pro', link: 'hi', id: '1', icon: 'adminfont-cart' },
    ];

    const [ currentTab, setCurrentTab ] = useState< MenuItem >( menu[ 0 ] );

    // Read-only field state
    const [ readonlyFields, setReadonlyFields ] = useState< boolean[] >(
        formFields.map( ( _, index ) =>
            formFieldsData[ index ]?.active === true ? false : true
        )
    );

    return (
        <>
            <SubTabSection
                menuitem={ menu }
                currentTab={ currentTab }
                setCurrentTab={ setCurrentTab }
            />
            { currentTab.id === '1' ? (
                <ProForm
                    setting={ setting }
                    name="formsettings"
                    proSettingChange={ proSettingChange }
                    onChange={ ( value ) => onChange( 'formsettings', value ) }
                />
            ) : (
                <div>
                    <div className="form-field">
                        <div className="edit-form-wrapper free-form">
                            <h3 className="form-label">{ 'Field Name' }</h3>
                            <h3 className="set-name">
                                { 'Set new field name' }
                            </h3>
                        </div>
                        { formFields.map( ( fields, index ) => (
                            <div
                                className="edit-form-wrapper free-form"
                                key={ index }
                            >
                                <div
                                    className="form-label"
                                    style={ {
                                        opacity: readonlyFields[ index ]
                                            ? '0.3'
                                            : '1',
                                    } }
                                >
                                    { fields.desc }
                                </div>
                                <div className="settings-form-group-radio">
                                    <input
                                        className="basic-input"
                                        type="text"
                                        onChange={ ( e ) =>
                                            updateFieldLabel(
                                                fields.key,
                                                e.target.value
                                            )
                                        }
                                        value={
                                            getFields( fields.key )?.label || ''
                                        }
                                        readOnly={ readonlyFields[ index ] }
                                        style={ {
                                            opacity: readonlyFields[ index ]
                                                ? '0.3'
                                                : '1',
                                        } }
                                    />
                                </div>
                                <div
                                    className="button-visibility"
                                    role="button"
                                    tabIndex={ 0 }
                                    onClick={ () => {
                                        setReadonlyFields( ( prev ) =>
                                            prev.map( ( readonly, i ) =>
                                                i === index
                                                    ? ! readonly
                                                    : readonly
                                            )
                                        );
                                        activeDeactiveFields(
                                            fields.key,
                                            readonlyFields[ index ]
                                        );
                                    } }
                                >
                                    <i
                                        className={ `admin-font ${
                                            readonlyFields[ index ]
                                                ? 'adminfont-eye-blocked enable-visibility'
                                                : 'adminfont-eye'
                                        }` }
                                    />
                                </div>
                            </div>
                        ) ) }
                    </div>
                </div>
            ) }
        </>
    );
};

export default FreeProFormCustomizer;



//External Dependencies
import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import MultipleOptions from './MultipleOption';
import { BasicInputUI } from './BasicInput';

interface SubField {
    id: number;
    key: string;
    label: string;
    type: 'text' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
    readonly?: boolean;
    parentId?: number;
}

export interface AddressFormField {
    id: number;
    type: string;
    label: string;
    fields?: SubField[];
    value?: Record< string, string >;
    readonly?: boolean;
}

interface AddressFieldProps {
    formField: AddressFormField;
    // onChange: ( key: 'fields', value: SubField[] ) => void;
    opendInput: SubField | null;
    setOpendInput: React.Dispatch< React.SetStateAction< SubField | null > >;
}

const AddressField: React.FC< AddressFieldProps > = ( {
    formField,
    // onChange,
    opendInput,
    setOpendInput,
} ) => {
    const [ subFields, setSubFields ] = useState< SubField[] >(
        formField.fields || []
    );

    useEffect( () => {
        setSubFields( formField.fields || [] );
    }, [ formField.fields ] );

    // Update parent
    const updateParent = ( updated: SubField[] ) => {
        setSubFields( updated );
        // onChange( 'fields', updated );
    };

    const FieldRenderers = {
        text: (f: SubField) => (
            <>
                <p>{f.label}</p>
                <BasicInputUI
                    type= "text"
                    placeholder= {f.placeholder}
                />
            </>
        ),
        select: (f: SubField) => (
            <MultipleOptions
                formField={{
                    label: f.label,
                    type: 'dropdown',
                    options: f.options?.map((opt) => ({
                        id: opt,
                        value: opt,
                        label: opt,
                    })) || [],
                }}
                type="dropdown"
                selected={false}
                // onChange={() => {}}
            />
        ),
    };

    return (
        <div className="address-field-wrapper">
            <ReactSortable
                list={ subFields }
                setList={ updateParent }
                handle=".drag-handle"
                animation={ 150 }
            >
                { subFields.map( ( f ) => (
                    <div
                        key={ f.id }
                        className={ `form-field ${
                            opendInput?.id === f.id ? 'active' : ''
                        }` }
                        onClick={ ( e ) => {
                            e.stopPropagation();
                            setOpendInput( {
                                ...f,
                                readonly: formField.readonly,
                                parentId: formField.id,
                            } );
                        } }
                    >
                        <div className="meta-menu">
                            <span className="admin-badge blue drag-handle">
                                <i className="admin-font adminfont-drag"></i>
                            </span>
                        </div>

                        {FieldRenderers[f.type]?.(f)}

                    </div>
                ) ) }
            </ReactSortable>
        </div>
    );
};

export default AddressField;