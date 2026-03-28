// External dependencies
import React from 'react';

// Internal dependencies
import '../styles/web/ChoiceToggle.scss';
import { FieldComponent, ZyraVariable } from './fieldUtils';

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
    requiredPlugin?: string;
    moduleEnabled?: string;
}

interface ChoiceToggleProps {
    options?: Option[];
    wrapperClass?: string;
    value: string | string[];
    onChange: (value: string | string[]) => void;
    proSetting?: boolean;
    iconEnable?: boolean;
    key?: string;
    multiSelect?: boolean;
    custom?: boolean;
    canAccess?: boolean;
    modules?: string[];
    onBlocked?: (type: 'pro' | 'plugin' | 'module', payload?: Option) => void;
}

function formatModuleLabel(moduleKey: string): string {
    return moduleKey
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const ChoiceToggleUI: React.FC<ChoiceToggleProps> = ({
    options,
    wrapperClass,
    value,
    key,
    onChange,
    iconEnable = false,
    custom,
    multiSelect = false,
    modules,
    onBlocked,
}) => {
    const block = (option: Option) => {
        // Check pro setting
        if (option.proSetting && !ZyraVariable.khali_dabba) {
            onBlocked?.('pro');
            return true;
        }
        if (option.moduleEnabled && !modules.includes(option.moduleEnabled)) {
            onBlocked?.('module', option.moduleEnabled);
            return true;
        }

        if (
            option.requiredPlugin &&
            !(ZyraVariable.active_plugins || []).includes(option.requiredPlugin)
        ) {
            onBlocked?.('plugin', option);
            return true;
        }
        return false;
    };
    const handleChange = (selectedOptionValue: string, option: Option) => {
        // Check if option is blocked (pro)
        if (block(option)) {
            return;
        }

        if (multiSelect) {
            const current = Array.isArray(value) ? value : [];
            let newValues: string[];
            if (current.includes(selectedOptionValue)) {
                newValues = current.filter(
                    (compareValue) => compareValue !== selectedOptionValue
                );
            } else {
                newValues = [...current, selectedOptionValue];
            }
            onChange(newValues);
        } else {
            onChange(selectedOptionValue);
        }
    };

    return (
        <>
            <div
                className={`choice-toggle-container ${
                    wrapperClass ? wrapperClass : ''
                }`}
            >
                <div
                    className={`choice-toggle-wrapper ${
                        custom ? 'custom' : ''
                    }`}
                >
                    {options.map((option) => {
                        const isChecked = multiSelect
                            ? Array.isArray(value) &&
                              value.includes(option.value)
                            : value === option.value;
                        const isProOption = !!option.proSetting;

                        return (
                            <div
                                role="button"
                                tabIndex={0}
                                key={option.key}
                                className="toggle-option"
                            >
                                <input
                                    className="choice-toggle-form-input"
                                    type={multiSelect ? 'checkbox' : 'radio'}
                                    id={option.key}
                                    name={key}
                                    value={option.value}
                                    checked={isChecked}
                                    readOnly
                                    onClick={() =>
                                        handleChange(option.value, option)
                                    }
                                />
                                <label htmlFor={option.key}>
                                    <span>
                                        {iconEnable ? (
                                            <i className={option.value}></i>
                                        ) : option.img ? (
                                            <>
                                                <img src={option.img} />
                                                {option.label}
                                            </>
                                        ) : option.icon ? (
                                            <>
                                                <i
                                                    className={`adminfont-${option.icon} `}
                                                ></i>
                                                {option.label}
                                            </>
                                        ) : (
                                            option.label
                                        )}
                                    </span>
                                    {/* Module-locked badge */}
                                    {!option.proSetting &&
                                        option.moduleEnabled &&
                                        !modules.includes(
                                            option.moduleEnabled
                                        ) && (
                                            <span className="admin-pro-tag module">
                                                <i
                                                    className={`adminfont-${option.moduleEnabled}`}
                                                />
                                                {formatModuleLabel(
                                                    option.moduleEnabled
                                                )}
                                                <i className="adminfont-lock" />
                                            </span>
                                        )}

                                    {option.desc && (
                                        <div className="des">{option.desc}</div>
                                    )}
                                    {option.customHtml && (
                                        <div
                                            className="choice-toggle-custom-wrapper"
                                            dangerouslySetInnerHTML={{
                                                __html: option.customHtml,
                                            }}
                                        />
                                    )}
                                </label>
                                {isProOption && !ZyraVariable.khali_dabba && (
                                    <span className="admin-pro-tag">
                                        <i className="adminfont-pro-tag"></i>Pro
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

const ChoiceToggle: FieldComponent = {
    render: ({ field, value, onChange, canAccess, modules, onBlocked }) => (
        <ChoiceToggleUI
            wrapperClass={field.wrapperClass}
            key={field.key}
            iconEnable={field.iconEnable} // If true, will display the toggle value as an icon
            custom={field.custom}
            multiSelect={field.multiSelect} // If true, allows selecting multiple options (checkboxes), else single select (radio)
            canAccess={canAccess}
            modules={modules}
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
                        : value
                          ? [String(value)]
                          : []
                    : String(value ?? field.defaultValue ?? '')
            }
            onChange={(val) => {
                if (!canAccess) {
                    return;
                }
                onChange(val);
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

export default ChoiceToggle;
