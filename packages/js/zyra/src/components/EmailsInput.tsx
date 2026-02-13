// External dependencies
import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';

// Internal dependencies
import '../styles/web/EmailsInput.scss';
import { BasicInputUI } from './BasicInput';

export interface EmailsInputProps {
    mode?: 'single' | 'multiple';
    max?: number;
    value?: string[];
    primary?: string;
    enablePrimary?: boolean;
    placeholder?: string;
    onChange?: (emails: string[], primary: string) => void;
}

const EmailsInput = forwardRef<HTMLInputElement, EmailsInputProps>(
    (
        {
            mode = 'multiple',
            max,
            value = [],
            primary = '',
            enablePrimary = true,
            placeholder = 'Enter email...',
            onChange,
        },
        ref
    ) => {
        const [emails, setEmails] = useState<string[]>(value);
        const [primaryEmail, setPrimaryEmail] = useState<string>(
            enablePrimary ? primary : ''
        );

        const [inputValue, setInputValue] = useState('');

        const inputRef = useRef<HTMLInputElement>(null);

        // Sync when parent updates props
        useEffect(() => {
            setEmails(value);
        }, [value]);

        useEffect(() => {
            setPrimaryEmail(enablePrimary ? primary : '');
        }, [primary, enablePrimary]);

        // expose inputRef externally
        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        const isValidEmail = useCallback((email: string) =>
            /^\S+@\S+\.\S+$/.test(email), []);

        const addEmail = useCallback(
            (email: string) => {
                email = email.trim();

                if (
                    !email ||
                    !isValidEmail(email) ||
                    emails.includes(email) ||
                    (max && emails.length >= max)
                ) {
                    return;
                }

                const updated = [...emails, email];
                setEmails(updated);

                const newPrimary = enablePrimary ? primaryEmail || email : '';

                if (enablePrimary && !primaryEmail) {
                    setPrimaryEmail(email);
                }

                setInputValue('');
                onChange?.(updated, newPrimary);
            },
            [emails, max, isValidEmail, enablePrimary, primaryEmail, onChange]
        );

        const removeEmail = useCallback(
            (email: string) => {
                const updated = emails.filter((e) => e !== email);

                let newPrimary = primaryEmail;

                if (enablePrimary && primaryEmail === email) {
                    newPrimary = updated[0] || '';
                    setPrimaryEmail(newPrimary);
                }

                setEmails(updated);
                onChange?.(updated, enablePrimary ? newPrimary : '');
            },
            [emails, primaryEmail, enablePrimary, onChange]
        );

        const togglePrimary = useCallback(
            (email: string) => {
                if (!enablePrimary || mode === 'single') return;

                setPrimaryEmail(email);
                onChange?.(emails, email);
            },
            [enablePrimary, mode, emails, onChange]
        );

        const handleKeyDown = (
            e: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (['Enter', ',', ' '].includes(e.key)) {
                e.preventDefault();
                addEmail(inputValue);
            }
        };

        // SINGLE MODE
        if (mode === 'single') {
            return (
                <BasicInputUI
                    type="email"
                    value={emails[0] || ''}
                    placeholder={placeholder}
                    onChange={(val) => {
                        const v = String(val).trim();
                        const updated = isValidEmail(v) ? [v] : [];
                        setEmails(updated);
                        onChange?.(updated, '');
                    }}
                />
            );
        }

        // MULTI MODE
        return (
            <div
                className="emails-section"
                onClick={() => inputRef.current?.focus()}
            >
                {emails.map((email) => (
                    <div
                        className={`email ${enablePrimary && primaryEmail === email
                            ? 'primary'
                            : ''
                            }`}
                        key={email}
                    >
                        {enablePrimary && (
                            <i
                                className={`stat-icon adminfont-star${primaryEmail === email ? ' primary' : '-o'
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePrimary(email);
                                }}
                            ></i>
                        )}
                        <span>{email}</span>
                        <i
                            className="adminfont-close close-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeEmail(email);
                            }}
                        ></i>
                    </div>
                ))}

                <div className="input-wrapper">
                    <BasicInputUI
                        ref={inputRef}
                        type="text"
                        inputClass={"email-input"}
                        value={inputValue}
                        placeholder={emails.length === 0 ? placeholder : ''}
                        onChange={(val) => setInputValue(String(val))}
                        onKeyDown={handleKeyDown}
                    />

                    { /* MAGIC INLINE SUGGESTION */}
                    {inputValue &&
                        !inputValue.endsWith(' ') &&
                        !inputValue.endsWith(',') &&
                        isValidEmail(inputValue) &&
                        !emails.includes(inputValue.trim()) && (
                            <div
                                className="inline-suggestion"
                                onClick={() => addEmail(inputValue.trim())}
                            >
                                <i className="adminfont-mail orange"></i>{' '}
                                {inputValue.trim()}
                            </div>
                        )}
                </div>
            </div>
        );
    }
);

export default EmailsInput;
