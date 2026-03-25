// External dependencies
import React, {
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
    useCallback,
    useEffect,
} from 'react';

// Internal dependencies
import '../styles/web/EmailsInput.scss';
import { BasicInputUI } from './BasicInput';
import { FieldComponent } from './fieldUtils';

export interface EmailsInputProps {
    mode?: 'single' | 'multiple';
    max?: number;
    value?: string[];
    primary?: string;
    enablePrimary?: boolean;
    placeholder?: string;
    onChange?: (list: string[], primary: string) => void;
}

export const EmailsInputUI = forwardRef<HTMLInputElement, EmailsInputProps>(
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
        const [list, setList] = useState<string[]>(value);
        const [primaryEmail, setPrimaryEmail] = useState<string>(
            enablePrimary ? primary : ''
        );
        const [inputValue, setInputValue] = useState('');

        const inputRef = useRef<HTMLInputElement>(null);

        const isMultiple = mode === 'multiple';
        const hasEmail = list.length > 0;

        // Sync with parent props
        useEffect(() => {
            setList(value);
        }, [value]);

        useEffect(() => {
            setPrimaryEmail(enablePrimary ? primary : '');
        }, [primary, enablePrimary]);

        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        const isValidEmail = useCallback(
            (email: string) => /^\S+@\S+\.([a-zA-Z]{2,})$/.test(email),
            []
        );

        const addEmail = useCallback(
            (email: string) => {
                email = email.trim();

                if (
                    !email ||
                    !isValidEmail(email) ||
                    list.includes(email) ||
                    (max && list.length >= max)
                ) {
                    return;
                }

                const updated = [...list, email];
                setList(updated);

                let newPrimary = primaryEmail;

                if (enablePrimary && isMultiple && updated.length === 1) {
                    setPrimaryEmail(email);
                    newPrimary = email;
                }

                setInputValue('');
                onChange?.(updated, newPrimary);
            },
            [
                list,
                max,
                isValidEmail,
                enablePrimary,
                isMultiple,
                primaryEmail,
                onChange,
            ]
        );

        const removeEmail = useCallback(
            (email: string) => {
                const updated = list.filter((e) => e !== email);

                if (enablePrimary && primaryEmail === email) {
                    setPrimaryEmail(updated[0] || '');
                }

                setList(updated);
                onChange?.(updated, enablePrimary ? updated[0] || '' : '');
            },
            [list, primaryEmail, enablePrimary, onChange]
        );

        const togglePrimary = useCallback(
            (email: string) => {
                if (!enablePrimary || !isMultiple) {
                    return;
                }
                setPrimaryEmail(email);
                onChange?.(list, email);
            },
            [enablePrimary, isMultiple, list, onChange]
        );

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (['Enter', ',', ' '].includes(e.key)) {
                e.preventDefault();
                addEmail(inputValue);
            }
        };

        const isInputReadOnly = !isMultiple && hasEmail;
        const trimmedInput = inputValue.trim();

        const canShowSuggestion =
            !isInputReadOnly &&
            trimmedInput &&
            isValidEmail(trimmedInput) &&
            (!isMultiple || !list.includes(trimmedInput));

        return (
            <div
                className="emails-section"
                onClick={() => !isInputReadOnly && inputRef.current?.focus()}
            >
                {list.map((email) => (
                    <div
                        className={`email ${
                            enablePrimary && primaryEmail === email
                                ? 'primary'
                                : ''
                        }`}
                        key={email}
                    >
                        {enablePrimary && isMultiple && (
                            <i
                                className={`stat-icon adminfont-star${
                                    primaryEmail === email ? ' primary' : '-o'
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
                        type="email"
                        inputClass="email-input"
                        value={inputValue}
                        placeholder={placeholder}
                        onChange={(val) => setInputValue(String(val))}
                        onKeyDown={handleKeyDown}
                        readOnly={isInputReadOnly}
                    />

                    {canShowSuggestion && (
                        <div
                            className="inline-suggestion"
                            onClick={() => addEmail(trimmedInput)}
                        >
                            <i className="adminfont-mail orange"></i>{' '}
                            {trimmedInput}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);


const EmailsInput: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <EmailsInputUI
            mode={field.mode}
            max={field.max}
            value={value?.list || []}
            primary={value?.primary || ''}
            enablePrimary={field.enablePrimary}
            placeholder={field.placeholder}
            onChange={(list, primary) =>
                onChange?.({
                    list,
                    primary,
                })
            }
        />
    ),

    validate: () => {
        return null;
    },
};

export default EmailsInput;
