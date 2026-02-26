import React, { useState, useEffect, useRef } from 'react';
import { BasicInputUI } from './BasicInput';
import { AdminButtonUI } from './AdminButton';
import "../styles/web/InputWithSuggestions.scss";

interface InputWithSuggestionsProps {
    suggestions: string[];
    value?: string[];
    onChange?: (list: string[]) => void;
    placeholder?: string;
    addButtonLabel?: string;
}

const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({
    suggestions = [],
    value = [],
    onChange,
    placeholder = 'Type something...',
    addButtonLabel = 'Add',
}) => {
    const [inputValue, setInputValue] = useState('');
    const [items, setItems] = useState<string[]>(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal list with parent value
    useEffect(() => {
        setItems(value);
    }, [value]);

    const filteredSuggestions =
        inputValue.trim() === ''
            ? []
            : suggestions.filter(
                (suggestion) =>
                    suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !items.includes(suggestion)
            );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                [];
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (!trimmed || items.includes(trimmed)) {
            return;
        } // prevent duplicates
        const newList = [...items, trimmed];
        setItems(newList);
        setInputValue('');
        if (onChange) {
            onChange(newList);
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        if (!items.includes(suggestion)) {
            const newList = [...items, suggestion];
            setItems(newList);
            if (onChange) {
                onChange(newList);
            }
        }
        setInputValue('');
    };

    const handleRemove = (item: string) => {
        const newList = items.filter((i) => i !== item);
        setItems(newList);
        if (onChange) {
            onChange(newList);
        }
    };

    return (
        <div className="input-with-suggestions-wrapper" ref={wrapperRef}>
            { /* Added items list */}
            <div className="tag-list">
                {items.map((item) => (
                    <span key={item} className="admin-badge blue">
                        {item}
                        <span
                            className="remove-icon"
                            onClick={() => handleRemove(item)}
                        >
                            <i className="delete-icon adminfont-delete" />
                        </span>
                    </span>
                ))}
            </div>

            <div className="dropdown-field">
                <BasicInputUI
                    name="title"
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={(e) => setInputValue(e)}
                />
                <AdminButtonUI
                    buttons={[{
                        icon: 'plus',
                        text: addButtonLabel,
                        color: 'purple',
                        onClick: handleAdd,
                    }]}
                />
                { /* Suggestions dropdown */}
                {filteredSuggestions.length > 0 && (
                    <ul className="input-dropdown">
                        {filteredSuggestions.map((suggestion) => (
                            <li className="dropdown-item"
                                key={suggestion}
                                onClick={() => handleSelectSuggestion(suggestion)}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default InputWithSuggestions;