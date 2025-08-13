/**
 * External dependencies
 */
import React, { ChangeEvent } from 'react';

// Types
interface MultiNumOption {
    key?: string;
    value: string | number;
    label?: string;
    name?: string;
    type?: string;
    labelAfterInput?: boolean;
    desc?: string; // optional description per option
    options?: { value: string; label: string,labelAfterInput:boolean }[]; // for radio options
}

interface MultiNumInputProps {
    parentWrapperClass?: string;
    childWrapperClass?: string;
    options: MultiNumOption[];
    value?: { key: string; value: string | number }[];
    inputWrapperClass?: string;
    innerInputWrapperClass?: string;
    inputLabelClass?: string;
    inputClass?: string;
    idPrefix?: string;
    keyName?: string;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    labelAfterInput?: boolean; // default for all if option doesn't override
    onChange?: (
        e: ChangeEvent<HTMLInputElement>,
        keyName?: string,
        optionKey?: string,
        index?: number
    ) => void;
}

const MultiNumInput: React.FC<MultiNumInputProps> = ({
    parentWrapperClass,
    childWrapperClass,
    options,
    value = [],
    inputWrapperClass,
    innerInputWrapperClass,
    inputLabelClass,
    inputClass,
    idPrefix = 'multi-num',
    keyName,
    proSetting,
    description,
    descClass,
    labelAfterInput = false,
    onChange,
}) => {
    return (
        <div className={parentWrapperClass}>
            <div className={childWrapperClass}>
                {options.map((option, index) => {
                    const selectedValue =
                        value.find((val) => val.key === option.key)?.value ?? '';

                    // ✅ Check option.labelAfterInput first, fallback to global prop
                    const isLabelAfterInput =
                        typeof option.labelAfterInput === 'boolean'
                            ? option.labelAfterInput
                            : labelAfterInput;
                            console.log("jhds", option)
                    const labelJSX = (
                        <div className={inputLabelClass || ''}>
                            {option.label}
                        </div>
                    );

                    const inputJSX =
                        option.type === 'radio' && Array.isArray(option.options) ? (
                            <div className="toggle-setting-wrapper">
                                {option.options.map((opt) => (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        key={opt.value}
                                        onClick={() => {
                                            const fakeEvent = {
                                                target: { value: opt.value },
                                            } as ChangeEvent<HTMLInputElement>;
                                            onChange?.(
                                                fakeEvent,
                                                keyName,
                                                option.key,
                                                index
                                            );
                                        }}
                                    >
                                        <input
                                            className="toggle-setting-form-input"
                                            type="radio"
                                            id={`${idPrefix}-${option.key}-${opt.value}`}
                                            name={`${idPrefix}-${option.key}`}
                                            value={opt.value}
                                            checked={selectedValue === opt.value}
                                            readOnly
                                        />
                                        <label
                                            htmlFor={`${idPrefix}-${option.key}-${opt.value}`}
                                        >
                                            {opt.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <input
                                id={`${idPrefix}-${option.key}`}
                                className={`${inputClass} basic-input`}
                                type={option.type || 'text'}
                                name={option.name}
                                value={selectedValue}
                                onChange={(e) =>
                                    onChange?.(e, keyName, option.key, index)
                                }
                            />
                        );

                    return (
                        <div key={option.key} className={inputWrapperClass}>
                            <div className={innerInputWrapperClass}>
                                {!isLabelAfterInput && labelJSX}
                                {inputJSX}
                                {isLabelAfterInput && labelJSX}

                                {proSetting && (
                                    <span className="admin-pro-tag">pro</span>
                                )}
                            </div>

                            {/* Per-option description */}
                            {option.desc && (
                                <p
                                    className={descClass}
                                    dangerouslySetInnerHTML={{
                                        __html: option.desc,
                                    }}
                                ></p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Component-level description */}
            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                ></p>
            )}
        </div>
    );
};

export default MultiNumInput;
