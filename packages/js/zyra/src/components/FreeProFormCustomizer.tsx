/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from 'react';

/**
 * Internal dependencies
 */
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

    const activeDeactiveFields = (
        fieldKey: string,
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
    };

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

    const formFields = React.useMemo<FormField[]>(() => [
        { key: 'name', desc: 'Name' },
        { key: 'email', desc: 'Email' },
        { key: 'phone', desc: 'Phone' },
        { key: 'address', desc: 'Address' },
        { key: 'subject', desc: 'Enquiry about' },
        { key: 'comment', desc: 'Enquiry details' },
        { key: 'fileupload', desc: 'File upload' },
        { key: 'filesize-limit', desc: 'File upload size limit (in MB)' },
        { key: 'captcha', desc: 'Captcha' },
    ], []);

    const menu = React.useMemo<MenuItem[]>(() => [
        { name: 'Free', link: 'hi', id: '2', icon: 'adminfont-info' },
        { name: 'Pro', link: 'hi', id: '1', icon: 'adminfont-cart' },
    ], []);

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
