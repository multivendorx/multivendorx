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
    img?: string;
    proSetting?: boolean;
}

interface ToggleSettingProps {
    description?: string;
    options: Option[];
    wrapperClass?: string;
    descClass?: string;
    value: string;
    onChange: ( value: string ) => void;
    proChanged?: () => void;
    proSetting?: boolean;
    khali_dabba?: boolean;
    iconEnable?: boolean; // <-- new prop to render icons
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
    description,
    options,
    descClass = '',
    value,
    onChange,
    proChanged,
    proSetting = false,
    khali_dabba,
    iconEnable = false, // default false
}) => {
    return (
        <>
            <div className="toggle-setting-container">
                <div className="toggle-setting-wrapper">
                    {options.map((option) => (
                        <div
                            role="button"
                            tabIndex={0}
                            key={option.key}
                            onClick={() => {
                                if (option.proSetting && !khali_dabba) {
                                    proChanged?.();
                                } else {
                                    onChange(option.value);
                                }
                            }}
                        >
                            <input
                                className="toggle-setting-form-input"
                                type="radio"
                                id={option.key}
                                name="approve_vendor"
                                value={option.value}
                                checked={value === option.value}
                                readOnly // Prevents React warning for controlled components
                            />
                            <label htmlFor={option.key}>
                                {iconEnable ? (
                                    <i className={option.value}></i> // render icon if icon=true
                                ) : option.img ? (
                                    <img src={option.img} />
                                ) : (
                                    option.label
                                )}
                            </label>
                            {option.proSetting && !khali_dabba && (
                                <span className="admin-pro-tag">Pro</span>
                            )}
                        </div>
                    ))}
                </div>
                {proSetting && <span className="admin-pro-tag">Pro</span>}
            </div>
            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                ></p>
            )}
        </>
    );
};

export default ToggleSetting;
