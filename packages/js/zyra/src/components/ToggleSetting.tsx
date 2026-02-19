// External dependencies
import React from 'react';

// Internal dependencies
import '../styles/web/ToggleSetting.scss';
import { FieldComponent } from './types';

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
    options: Option[];
    wrapperClass?: string;
    value: string | string[];
    onChange: ( value: string | string[] ) => void;
    proSetting?: boolean;
    iconEnable?: boolean;
    key?: string;
    multiSelect?: boolean;
    custom?: boolean;
    canAccess?: boolean;
    appLocalizer?: any;
    onBlocked?: (type: 'pro', payload?: string) => void;
}

export const ToggleSettingUI: React.FC< ToggleSettingProps > = ( {
    options,
    wrapperClass,
    value,
    key,
    onChange,
    iconEnable = false,
    custom,
    multiSelect = false,
    appLocalizer,
    onBlocked
} ) => {
    const block = (option: Option) => {
        // Check pro setting
        if (option.proSetting && !appLocalizer.khali_dabba) {
            onBlocked?.('pro');
            return true;
        }
        return false;
    };

    const handleChange = ( optionValue: string, option: Option ) => {
        // Check if option is blocked (pro)
        if (block(option)) {
            return;
        }

        if ( multiSelect ) {
            const current = Array.isArray( value ) ? value : [];
            let newValues: string[];
            if ( current.includes( optionValue ) ) {
                newValues = current.filter( ( compareValue ) => compareValue !== optionValue );
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

                <div className={`toggle-setting-wrapper ${custom ? 'custom' : ''}`}>
                    { options.map( ( option ) => {
                        const isChecked = multiSelect
                            ? Array.isArray( value ) &&
                              value.includes( option.value )
                            : value === option.value;
                        const isProOption = !!option.proSetting;

                        return (
                            <div
                                role="button"
                                tabIndex={ 0 }
                                key={ option.key }
                                className="toggle-option"
                                onClick={ () =>
                                    handleChange(
                                        option.value,
                                        option
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
                                                <i className={`adminfont-${option.icon} `}></i>
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
                                {isProOption && !appLocalizer.khali_dabba && (
                                    <span className="admin-pro-tag">
                                        <i className="adminfont-pro-tag"></i>Pro
                                    </span>
                                )}
                            </div>
                        );
                    } ) }
                </div>
            </div>
        </>
    );
};

const ToggleSetting: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer, onBlocked }) => (
        <ToggleSettingUI
            wrapperClass={field.wrapperClass}
            key={field.key}
            iconEnable={field.iconEnable} // If true, will display the toggle value as an icon
            custom={field.custom}
            multiSelect={field.multiSelect} // If true, allows selecting multiple options (checkboxes), else single select (radio)
            canAccess={canAccess}
            appLocalizer={appLocalizer}
            onBlocked={onBlocked}
            options={
                Array.isArray(field.options)
                    ? field.options.map((opt) => ({
                            ...opt,
                            value: String(opt.value), // this can be an icon class
                        }))
                    : []
            }
            value={
                field.multiSelect
                    ? Array.isArray(value)
                        ? value
                        : [
                                String(
                                    value ??
                                        field.defaultValue ??
                                        ''
                                ),
                            ]
                    : String(
                            value ?? field.defaultValue ?? ''
                        )
            }
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val)
            }}
        />
    ),

    validate: (field, value) => {
        if (field.required && !value?.[field.key]) {
            return `${field.label} is required`;
        }

        return null;
    },

};

export default ToggleSetting;