import React, { useEffect, useRef, useState } from 'react';
import ButtonCustomizer, { ButtonSettings } from './ButtonCustomiser';
import '../styles/web/NotifimaFormCustomizer.scss';
import BasicInput from './BasicInput';
interface ButtonSetting {
    text?: string;
    color?: string;
    [ key: string ]: string | number | boolean | undefined;
}

interface SettingType {
    alert_text?: string;
    email_placeholder_text?: string;
    customize_btn?: ButtonSetting;
}

interface FormCustomizerProps {
    buttonText?: string;
    setting: SettingType;
    proSetting?: boolean;
    onChange: (
        key: keyof SettingType | string,
        value: string | ButtonSetting,
        isRestoreDefaults?: boolean
    ) => void;
}

const NotifimaFormCustomizer: React.FC< FormCustomizerProps > = ( {
    buttonText = 'Submit',
    setting,
    proSetting,
    onChange,
} ) => {
    const [ currentHoverOn, setCurrentHoverOn ] = useState< string >( '' );
    const [ currentEditSection, setCurrentEditSection ] =
        useState< string >( '' );
    const inputRef = useRef< HTMLInputElement | null >( null );
    const buttonRef = useRef< HTMLDivElement | null >( null );

    useEffect( () => {
        const handleClickOutside = ( event: MouseEvent ) => {
            if (
                buttonRef.current &&
                ! buttonRef.current.contains( event.target as Node )
            ) {
                setCurrentHoverOn( '' );
                setCurrentEditSection( '' );
            }
        };

        document.body.addEventListener( 'click', handleClickOutside );
        return () => {
            document.body.removeEventListener( 'click', handleClickOutside );
        };
    }, [] );

    return (
        <div className="notifima-form-customizer">
            <div className="label-section">
                <BasicInput
                    wrapperClass=""
                    inputClass={
                        currentHoverOn === 'description' ? 'active' : ''
                    }
                    ref={ currentHoverOn === 'description' ? inputRef : null }
                    value={ setting?.alert_text || '' }
                    onClick={ () => setCurrentHoverOn( 'description' ) }
                    onChange={ ( e ) =>
                        onChange( 'alert_text', e.target.value )
                    }
                />
            </div>

            <div className="form-section">
                <div
                    ref={ currentHoverOn === 'email_input' ? buttonRef : null }
                    className="input-section"
                >
                    <BasicInput
                        type="email"
                        wrapperClass="email-input-wrapper"
                        readOnly
                        inputClass={
                            currentHoverOn === 'email_input' ? 'active' : ''
                        }
                        placeholder={ setting?.email_placeholder_text || '' }
                        onClick={ () => setCurrentHoverOn( 'email_input' ) }
                    />

                    { currentHoverOn === 'email_input' && (
                        <div
                            className="input-editor"
                            role="button"
                            tabIndex={ 0 }
                            onClick={ () => setCurrentEditSection( 'text' ) }
                        >
                            <p>Edit</p>
                            <span>
                                <i className="admin-font adminfont-edit"></i>
                            </span>
                        </div>
                    ) }

                    { currentHoverOn === 'email_input' &&
                        currentEditSection === 'text' && (
                            <div className="setting-wrapper">
                                <button
                                    onClick={ ( e ) => {
                                        e.preventDefault();
                                        setCurrentEditSection( '' );
                                    } }
                                    className="wrapper-close"
                                >
                                    <i className="admin-font adminfont-cross"></i>
                                </button>

                                <div className="setting-section">
                                    <span className="label">
                                        Placeholder text
                                    </span>
                                    <div className="property-section">
                                        <BasicInput
                                            type="text"
                                            value={
                                                setting?.email_placeholder_text ||
                                                ''
                                            }
                                            onChange={ ( e ) =>
                                                onChange(
                                                    'email_placeholder_text',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ) }
                </div>

                <div className="button-section">
                    <ButtonCustomizer
                        text={ buttonText }
                        proSetting={ proSetting }
                        setting={ setting?.customize_btn as ButtonSettings }
                        onChange={ (
                            key,
                            value,
                            isRestoreDefaults = false
                        ) => {
                            const previousSetting =
                                setting?.customize_btn || {};

                            if ( isRestoreDefaults ) {
                                // cast value to ButtonSetting
                                onChange(
                                    'customize_btn',
                                    value as ButtonSetting
                                );
                            } else {
                                // cast value to string | number | boolean | undefined
                                onChange( 'customize_btn', {
                                    ...previousSetting,
                                    [ key ]: value as
                                        | string
                                        | number
                                        | boolean
                                        | undefined,
                                } );
                            }
                        } }
                    />
                </div>
            </div>
        </div>
    );
};

export default NotifimaFormCustomizer;
