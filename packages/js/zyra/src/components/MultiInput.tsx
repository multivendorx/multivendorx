/**
 * External dependencies
 */
import React, { useState, ChangeEvent, FocusEvent } from 'react';
import "../styles/web/MultiInputString.scss";

// Types
interface MultiNumOption {
    key?: string;
    value: string | number;
    label?: string;
    name?: string;
    type?: string;
    labelAfterInput?: boolean;
    desc?: string;
    options?: { value: string; label: string; labelAfterInput: boolean }[];
}

interface MultiNumberProps {
    inputType: 'multi-number';
    parentWrapperClass?: string;
    childWrapperClass?: string;
    options: MultiNumOption[];
    value?: { key: string; value: string | number }[] | Record<string, { key: string; value: string | number }> | Record<string, string | number>;
    inputWrapperClass?: string;
    innerInputWrapperClass?: string;
    inputLabelClass?: string;
    inputClass?: string;
    labelAfterInput?: boolean;
    optionLabel?:string;
    onChange?: (e: ChangeEvent<HTMLInputElement>, keyName?: string, optionKey?: string, index?: number) => void;
}

interface MultiStringProps {
    inputType: 'multi-string';
    values?: string[];
    placeholder?: string;
    wrapperClass?: string;
    inputClass?: string;
    buttonClass?: string;
    listClass?: string;
    itemClass?: string;
    deleteBtnClass?: string;
    onStringChange?: (e: { target: { name?: string; value: string[] } }) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

interface CommonProps {
    id?: string;
    name?: string;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    idPrefix?: string;
    keyName?: string;
}

type MultiInputProps = (MultiNumberProps | MultiStringProps) & CommonProps;

const MultiInput: React.FC<MultiInputProps> = (props) => {
    const { inputType, proSetting, description, descClass } = props;
    const [inputValue, setInputValue] = useState("");

    // Normalize multi-number value
    const normalizeValue = (value: any): Record<string, string | number> => {
        if (Array.isArray(value)) {
            return value.reduce<Record<string, string | number>>((acc, cur) => {
                if (cur.key) acc[cur.key] = cur.value;
                return acc;
            }, {});
        }
        if (typeof value === 'object' && value !== null) {
            if (Object.values(value).every(v => typeof v !== 'object' || v === null)) {
                return value as Record<string, string | number>;
            }
            return Object.values(value).reduce<Record<string, string | number>>((acc, cur: any) => {
                if (cur?.key) acc[cur.key] = cur.value;
                return acc;
            }, {});
        }
        return {};
    };

    const renderRadioOptions = (option: MultiNumOption, selectedValue: string | number, idPrefix: string, keyName?: string, onChange?: Function, index?: number) => (
        <div className="toggle-setting-wrapper">
            <div></div>
            {option.options?.map((opt) => (
                <div
                    role="button"
                    tabIndex={0}
                    key={opt.value}
                    onClick={() => {
                        if (option.key) {
                            const fakeEvent = { target: { value: opt.value } } as ChangeEvent<HTMLInputElement>;
                            onChange?.(fakeEvent, keyName, option.key, index);
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
    );

    if (inputType === 'multi-number') {
        const {
            parentWrapperClass,
            childWrapperClass,
            options,
            value = {},
            inputWrapperClass,
            innerInputWrapperClass,
            inputClass,
            labelAfterInput = false,
            onChange,
            idPrefix = 'multi-input',
            keyName
        } = props as MultiNumberProps & CommonProps;

        const valueObject = normalizeValue(value);

        return (
            <div className={parentWrapperClass}>
                <div className={childWrapperClass}>
                    {options.map((option, index) => {
                        const selectedValue = option.key ? valueObject[option.key] ?? '' : '';
                        const isLabelAfterInput = option.labelAfterInput ?? labelAfterInput;
                        const labelJSX = <div className="input-unit">{option.label}</div>;

                        const inputJSX = option.type === 'radio' && option.options 
                            ? renderRadioOptions(option, selectedValue, idPrefix, keyName, onChange, index)
                            : (
                                <input
                                    id={`${idPrefix}-${option.key}`}
                                    className={inputClass || 'basic-input'}
                                    type={option.type || 'text'}
                                    name={option.name}
                                    value={selectedValue}
                                    min={option.type === "number" ? 0 : undefined}
                                    onChange={(e) => option.key && onChange?.(e, keyName, option.key, index)}
                                />
                            );

                        return (
                            <div key={option.key || index} className={`${inputWrapperClass} ${isLabelAfterInput ? 'suffix' : 'prefix'}`}>
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
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
                {description && (
                    <p
                        className={`${descClass} settings-metabox-description`}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                )}
            </div>
        );
    }

    // Multi-string rendering
    const {
        values = [],
        placeholder,
        wrapperClass,
        inputClass,
        buttonClass,
        listClass,
        itemClass,
        onStringChange,
        onFocus,
        onBlur,
        id,
        name
    } = props as MultiStringProps & CommonProps;

    const handleAdd = () => {
        if (inputValue.trim()) {
            const updatedValues = [...(Array.isArray(values) ? values : []), inputValue.trim()];
            onStringChange?.({ target: { name, value: updatedValues } });
            setInputValue("");
        }
    };

    const handleDelete = (val: string) => {
        const updatedValues = (Array.isArray(values) ? values : []).filter(item => item !== val);
        onStringChange?.({ target: { name, value: updatedValues } });
    };

    return (
        <div className={wrapperClass}>
            <div className="multi-input-row">
                <input
                    type="text"
                    id={id}
                    name={name}
                    value={inputValue}
                    placeholder={placeholder}
                    className={inputClass}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <button type="button" className={buttonClass || "add-button"} onClick={handleAdd}>
                    <i className="adminlib-vendor-form-add"></i>
                    Add
                </button>
            </div>

            {Array.isArray(values) && values.length > 0 && (
                <ul className={listClass || "multi-string-list"}>
                    {values.map((val, index) => (
                        <li key={index} className={itemClass}>
                            {val}
                            <i className="adminlib-cross" onClick={() => handleDelete(val)}></i>
                        </li>
                    ))}
                </ul>
            )}

            {proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span>}
            {description && (
                <p
                    className={`${descClass} settings-metabox-description`}
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}
        </div>
    );
};

export default MultiInput;