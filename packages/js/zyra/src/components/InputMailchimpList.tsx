/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { getApiLink, getApiResponse } from '../utils/apiService';
import BasicInput from './BasicInput';
import SelectInput from './SelectInput';

// Types
interface SelectOption {
    value: string;
    label: string;
}

interface Setting {
    [ key: string ]: string | SelectOption[] | boolean | number;
}

interface AppLocalizer {
    nonce: string;
    restUrl: string;
    [ key: string ]: string | number | boolean;
}

interface InputMailchimpListProps {
    mailchimpKey: string;
    optionKey: string;
    settingChanged: React.MutableRefObject< boolean >;
    apiLink: string;
    proSettingChanged: () => boolean;
    onChange: ( event: { target: { value: string } }, key: string ) => void;
    selectKey: string;
    value?: string;
    setting: Setting;
    updateSetting: (
        key: string,
        value: string | SelectOption[] | boolean | number
    ) => void;
    appLocalizer: AppLocalizer;
}

const InputMailchimpList: React.FC< InputMailchimpListProps > = ( {
    appLocalizer,
    setting,
    updateSetting,
    mailchimpKey,
    optionKey,
    settingChanged,
    apiLink,
    proSettingChanged,
    onChange,
    selectKey,
} ) => {
    // State variables
    // const { setting, updateSetting } = useSetting();

    const [ selectOption, setSelectOption ] = useState< SelectOption[] >(
        setting[ optionKey ] || []
    );
    const [ loading, setLoading ] = useState< boolean >( false );
    const [ showOption, setShowOption ] = useState< boolean >( false );
    const [ mailchimpErrorMessage, setMailchimpErrorMessage ] =
        useState< string >( '' );

    const updateSelectOption = async () => {
        if ( ! setting[ mailchimpKey ] ) {
            setMailchimpErrorMessage( 'Kindly use a proper MailChimp key.' );
            setTimeout( () => {
                setMailchimpErrorMessage( '' );
            }, 10000 );
        } else {
            setLoading( true );
            setMailchimpErrorMessage( '' );

            try {
                const options: SelectOption[] =
                    ( await getApiResponse(
                        getApiLink( appLocalizer, apiLink ),
                        {
                            headers: {
                                'X-WP-Nonce': appLocalizer.nonce,
                            },
                        }
                    ) ) ?? [];
                settingChanged.current = true;
                updateSetting( optionKey, options );
                setSelectOption( options );
                setShowOption( true );
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch ( error ) {
                setMailchimpErrorMessage( 'Failed to fetch MailChimp list.' );
                setTimeout( () => {
                    setMailchimpErrorMessage( '' );
                }, 10000 );
            } finally {
                setLoading( false );
            }
        }
    };

    return (
        <div className="connect-main-wrapper">
            <BasicInput
                 
                type="text"
                value={ setting[ mailchimpKey ] }
                proSetting={ false }
                onChange={ ( e ) => {
                    if ( ! proSettingChanged() ) {
                        onChange( e, mailchimpKey );
                    }
                } }
            />
            <div>{ mailchimpErrorMessage }</div>
            <div className="loader-wrapper">
                <button
                    className="admin-btn btn-purple btn-effect"
                    onClick={ ( e ) => {
                        e.preventDefault();
                        if ( ! proSettingChanged() ) {
                            updateSelectOption();
                        }
                    } }
                >
                    Fetch List
                </button>

                { loading && (
                    <div className="loader">
                        <div className="three-body-dot"></div>
                        <div className="three-body-dot"></div>
                        <div className="three-body-dot"></div>
                    </div>
                ) }
            </div>

            { ( selectOption.length > 0 || showOption ) && (
                <SelectInput
                    onChange={ ( e ) => {
                        if ( ! proSettingChanged() && e && 'value' in e ) {
                            onChange(
                                { target: { value: e.value } },
                                selectKey
                            );
                        }
                    } }
                    options={ selectOption }
                    value={ setting[ selectKey ] }
                />
            ) }
        </div>
    );
};

export default InputMailchimpList;
