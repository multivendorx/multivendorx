import React, { useState, ChangeEvent, MouseEvent } from 'react';

interface MultiStringInputProps {
    wrapperClass?: string;
    inputLabel?: string;
    inputClass?: string;
    buttonClass?: string;
    valueListClass?: string;
    placeholder?: string;
    name?: string;
    description?: string;
    descClass?: string;
    value?: string[];
    onChange?: (values: string[]) => void;
}

const MultiStringInput: React.FC<MultiStringInputProps> = ({
    wrapperClass,
    inputLabel,
    inputClass,
    buttonClass,
    valueListClass,
    placeholder = 'Enter value',
    name = 'multi-string-input',
    description,
    descClass,
    value = [],
    onChange = () => {},
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleAddValue = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (trimmed) {
            onChange([...value, trimmed]);
            setInputValue('');
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    return (
        <div className={wrapperClass}>
            {inputLabel && <label>{inputLabel}</label>}

            <div className="multi-input-wrap">
                <input
                    type="text"
                    name={name}
                    className={`basic-input ${inputClass || ''}`}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleChange}
                />
                <button
                    onClick={handleAddValue}
                    className={`admin-btn btn-purple ${buttonClass || ''}`}
                >
                    <i className="adminlib-plus-icon"></i>
                </button>
            </div>

            {value.length > 0 && (
                <ul className={`value-list ${valueListClass || ''}`}>
                    {value.map((val, idx) => (
                        <li key={idx}>{val}</li>
                    ))}
                </ul>
            )}

            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}
        </div>
    );
};

export default MultiStringInput;
