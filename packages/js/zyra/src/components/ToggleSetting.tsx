/**
 * External dependencies
 */
import React from "react";

/**
 * Intarnal dependencies
 */
import "../styles/web/ToggleSetting.scss";

// Types
interface Option {
    key?: string;
    value: string;
    label?: string;
}

interface ToggleSettingProps {
    description?: string;
    options: Option[];
    wrapperClass?: string;
    descClass?: string;
    value: string;
    onChange: ( value: string ) => void;
    proSetting?: boolean;
}

const ToggleSetting: React.FC< ToggleSettingProps > = ( {
    description,
    options,
    wrapperClass = "",
    descClass = "",
    value,
    onChange,
    proSetting = false,
} ) => {
    return (
        <section className={ wrapperClass }>
            <div className="toggle-setting-container">
                <ul>
                    { options.map( ( option ) => (
                        <li
                            role="button"
                            tabIndex={0}
                            key={ option.key }
                            onClick={ () => onChange( option.value ) }
                        >
                            <input
                                className="toggle-setting-form-input"
                                type="radio"
                                id={ option.key }
                                name="approve_vendor"
                                value={ option.value }
                                checked={ value === option.value }
                                readOnly // Prevents React warning for controlled components
                            />
                            <label htmlFor={ option.key }>
                                { option.label }
                            </label>
                        </li>
                    ) ) }
                </ul>
            </div>
            { proSetting && <span className="admin-pro-tag">pro</span> }
            { description && (
                <p
                    className={ descClass }
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </section>
    );
};

export default ToggleSetting;
