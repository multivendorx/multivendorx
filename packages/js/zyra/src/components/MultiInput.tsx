/**
 * External dependencies
 */
import React, { useState, FocusEvent } from 'react';
import "../styles/web/MultiInputString.scss";

// Types
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
}

type MultiInputProps = MultiStringProps & CommonProps;

const MultiInput: React.FC<MultiInputProps> = (props) => {
    const { 
        values = [], 
        placeholder, 
        wrapperClass, 
        inputClass, 
        buttonClass, 
        listClass, 
        itemClass, 
        deleteBtnClass, 
        onStringChange, 
        onFocus, 
        onBlur, 
        id, 
        name, 
        proSetting, 
        description, 
        descClass 
    } = props;

    const [inputValue, setInputValue] = useState("");

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
                <ul className={listClass || "multi-string-list"}>
                    {Array.isArray(values) && values.map((val, index) => (
                        <li key={index} className={itemClass}>
                            <div>{val}</div>
                            <span 
                                className={deleteBtnClass || "admin-btn btn-red"} 
                                onClick={() => handleDelete(val)}
                            >
                                <i className="adminlib-delete"></i>Remove
                            </span>
                        </li>
                    ))}
                    <li>
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
                        <span 
                            className={buttonClass || "admin-btn btn-purple"} 
                            onClick={handleAdd}
                        >
                            <i className="adminlib-vendor-form-add"></i>
                            Add
                        </span>
                    </li>
                </ul>
            </div>

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
