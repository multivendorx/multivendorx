/**
 * External dependencies
 */
import React, { useState, ChangeEvent, FocusEvent } from 'react';
import "../styles/web/MultiInputString.scss";

// Types
interface MultiStringInputProps {
    id?: string;
    name?: string;
    values?: string[];
    placeholder?: string;
    wrapperClass?: string;
    inputClass?: string;
    buttonClass?: string;
    listClass?: string;
    itemClass?: string;
    deleteBtnClass?: string;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    onChange?: (e: { target: { name?: string; value: string[] } }) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

export const MultiStringInput: React.FC<MultiStringInputProps> = ({
    id,
    name,
    values = [],
    placeholder,
    wrapperClass,
    inputClass,
    buttonClass,
    listClass,
    itemClass,
    deleteBtnClass,
    proSetting,
    description,
    descClass,
    onChange,
    onFocus,
    onBlur,
}) => {
    const [inputValue, setInputValue] = useState<string>("");

    const handleAdd = () => {
        if (inputValue.trim() !== "") {
            const safeValues = Array.isArray(values) ? values : [];
            const updatedValues = [...safeValues, inputValue.trim()];
            onChange?.({ target: { name, value: updatedValues } });
            setInputValue("");
        }
    };

    const handleDelete = (val: string) => {
        const safeValues = Array.isArray(values) ? values : [];
        const updatedValues = safeValues.filter((item) => item !== val);
        onChange?.({ target: { name, value: updatedValues } });
    };

    return (
        <div className={wrapperClass}>
            {/* Input and Add Button */}
            <div className="multi-input-row">
                <input
                    type="text"
                    id={id}
                    name={name}
                    value={inputValue}
                    placeholder={placeholder}
                    className={inputClass}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <button
                    type="button"
                    className={buttonClass || "add-button"}
                    onClick={handleAdd}
                >
                    <i className="adminlib-vendor-form-add"></i>
                    Add
                </button>
            </div>

            {/* Added Values List */}
            {Array.isArray(values) && values.length > 0 && (
                <ul className={listClass || "multi-string-list"}>
                    {values.map((val, index) => (
                        <li key={index} className={itemClass}>
                            {val}
                            <i 
                            className="adminlib-cross"
                            onClick={() => handleDelete(val)}></i>
                        </li>
                    ))}
                </ul>
            )}

            {proSetting && <span className="admin-pro-tag">Pro</span>}

            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                ></p>
            )}
        </div>
    );
};

export default MultiStringInput;
