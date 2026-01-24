/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/ToggleSetting.scss';

// Types
interface Option {
    key?: string;
    value: string;
    label?: string;
    desc?: string;
    img?: string;
    icon?: string;
    customHtml?: string;
    proSetting?: boolean;
}

interface ToggleSettingProps {
    description?: string;
    options: Option[];
    wrapperClass?: string;
    descClass?: string;
    value: string | string[];
    onChange: ( value: string | string[] ) => void;
    proChanged?: () => void;
    proSetting?: boolean;
    khali_dabba?: boolean;
    iconEnable?: boolean;
    key?: string;
    preText?: string;
    postText?: string;
    multiSelect?: boolean;
    custom?: boolean;
}

const ToggleSetting: React.FC< ToggleSettingProps > = ( {
    description,
    options,
    wrapperClass,
    value,
    key,
    onChange,
    proChanged,
    khali_dabba,
    iconEnable = false,
    postText,
    preText,
    custom,
    multiSelect = false,
} ) => {
    const handleChange = ( optionValue: string, isPro: boolean ) => {
        if ( isPro && ! khali_dabba ) {
            proChanged?.();
            return;
        }

        if ( multiSelect ) {
            const current = Array.isArray( value ) ? value : [];
            let newValues: string[];
            if ( current.includes( optionValue ) ) {
                newValues = current.filter( ( v ) => v !== optionValue );
            } else {
                newValues = [ ...current, optionValue ];
            }
            onChange( newValues );
        } else {
            onChange( optionValue );
        }
    };

    return (
        <>
            <div className={`toggle-setting-container ${wrapperClass ? wrapperClass : ''}`}>
                { preText && <span className="before">{ preText }</span> }

                <div className={`toggle-setting-wrapper ${custom ? 'custom' : ''}`}>
                    { options.map( ( option ) => {
                        const isChecked = multiSelect
                            ? Array.isArray( value ) &&
                              value.includes( option.value )
                            : value === option.value;

                        return (
                            <div
                                role="button"
                                tabIndex={ 0 }
                                key={ option.key }
                                className="toggle-option"
                                onClick={ () =>
                                    handleChange(
                                        option.value,
                                        !! option.proSetting
                                    )
                                }
                            >
                                <input
                                    className="toggle-setting-form-input"
                                    type={ multiSelect ? 'checkbox' : 'radio' }
                                    id={ option.key }
                                    name={ key }
                                    value={ option.value }
                                    checked={ isChecked }
                                    readOnly
                                />
                                <label htmlFor={ option.key }>
                                    <span>
                                        { iconEnable ? (
                                            <i className={ option.value }></i>
                                        ) : option.img ? (
                                            <>
                                                <img src={ option.img } />
                                                { option.label }
                                            </>
                                        ) : option.icon ? (
                                            <>
                                                <i className={ option.icon }></i>
                                                { option.label }
                                            </>
                                        ) : (
                                            option.label
                                        ) }
                                    </span>
                                    {option.desc && (
                                        <div className="des">{option.desc}</div>
                                    )}
                                    {option.customHtml && (
                                        <div className="toggle-custom-wrapper" dangerouslySetInnerHTML={{ __html: option.customHtml }} />
                                    )}
                                </label>
                                {option.proSetting && ! khali_dabba && (
                                    <span className="admin-pro-tag">
                                        <i className="adminfont-pro-tag"></i>Pro
                                    </span>
                                )}
                            </div>
                        );
                    } ) }
                </div>
                { postText && <span className="after">{ postText }</span> }
            </div>
            { description && (
                <p
                    className="settings-metabox-description"
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </>
    );
};

export default ToggleSetting;
