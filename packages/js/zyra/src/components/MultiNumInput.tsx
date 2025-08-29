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
    options?: { value: string; label: string; labelAfterInput: boolean }[]; // for radio options
}

interface MultiNumInputProps {
    parentWrapperClass?: string;
    childWrapperClass?: string;
    options: MultiNumOption[];
    value?: { key: string; value: string | number }[] | Record<string, { key: string; value: string | number }> | Record<string, string | number>;
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
    value = {},
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
    // Normalize value to simple key-value object
    const valueObject: Record<string, string | number> = (() => {
        if (Array.isArray(value)) {
            // Array of {key, value}
            return value.reduce<Record<string, string | number>>((acc, cur) => {
                if (cur.key) acc[cur.key] = cur.value;
                return acc;
            }, {});
        } else if (typeof value === 'object' && value !== null) {
            // Check if already flat key-value object
            const valuesArePrimitive = Object.values(value).every(
                v => typeof v !== 'object' || v === null
            );
            if (valuesArePrimitive) return value as Record<string, string | number>;

            // Otherwise flatten nested {key,value} objects
            return Object.values(value as Record<string, { key: string; value: string | number }>).reduce<Record<string, string | number>>(
                (acc, cur) => {
                    if (cur?.key) acc[cur.key] = cur.value;
                    return acc;
                },
                {}
            );
        }
        return {};
    })();

    return (
        <div className={parentWrapperClass}>
            <div className={childWrapperClass}>
                {options.map((option, index) => {
                    const selectedValue = option.key ? valueObject[option.key] ?? '' : '';

                    const isLabelAfterInput =
                        typeof option.labelAfterInput === 'boolean'
                            ? option.labelAfterInput
                            : labelAfterInput;

                    const labelJSX = <div className="input-unit">{option.label}</div>;

                    const inputJSX =
                        option.type === 'radio' && Array.isArray(option.options) ? (
                            <div className="toggle-setting-wrapper">
                                {option.options.map((opt) => (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        key={opt.value}
                                        onClick={() => {
                                            if (option.key) {
                                                const fakeEvent = {
                                                    target: { value: opt.value },
                                                } as ChangeEvent<HTMLInputElement>;
                                                onChange?.(
                                                    fakeEvent,
                                                    keyName,
                                                    option.key,
                                                    index
                                                );
                                            }
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
                                        <label htmlFor={`${idPrefix}-${option.key}-${opt.value}`}>
                                            {opt.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <input
                                id={`${idPrefix}-${option.key}`}
                                className={inputClass || 'basic-input'}
                                type={option.type || 'text'}
                                name={option.name}
                                value={selectedValue}
                                onChange={(e) => option.key && onChange?.(e, keyName, option.key, index)}
                            />
                        );

                    return (
                        <div
                            key={option.key || index}
                            className={`${inputWrapperClass} ${isLabelAfterInput ? 'suffix' : 'prefix'}`}
                        >
                            <div className={innerInputWrapperClass}>
                                {!isLabelAfterInput && labelJSX}
                                {inputJSX}
                                {isLabelAfterInput && labelJSX}

                                {proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span>}
                            </div>

                            {option.desc && (
                                <p
                                    className={`${descClass} settings-metabox-description`}
                                    dangerouslySetInnerHTML={{ __html: option.desc }}
                                ></p>
                            )}
                        </div>
                    );
                })}
            </div>

            {description && (
                <p
                    className={`${descClass} settings-metabox-description`}
                    dangerouslySetInnerHTML={{ __html: description }}
                ></p>
            )}
        </div>
    );
};

export default MultiNumInput;
