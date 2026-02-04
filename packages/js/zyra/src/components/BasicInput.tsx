// External Dependencies
import { MouseEvent, FocusEvent, useState, forwardRef, ReactNode } from 'react';

// Internal Dependencies
import AdminButton from './UI/AdminButton';
import { FieldComponent } from './types';

interface InputFeedback {
    type: string;
    message: string;
}

interface SelectOption {
    value: string;
    label: string;
}

type InputValue = string | number;

type Addon =
    | string
    | ReactNode
    | {
        type: 'select';
        key: string;
        options: SelectOption[];
        value?: string;
        size?: string;
    }
    | {
        type: 'text';
        key: string;
        placeholder?: string;
        value?: string;
        size?: string;
    };

interface BasicInputProps {
    wrapperClass?: string;
    inputLabel?: string;
    inputClass?: string;
    id?: string;
    fieldKey?: string;
    type?:
    | 'text'
    | 'button'
    | 'number'
    | 'color'
    | 'password'
    | 'email'
    | 'file'
    | 'range'
    | 'time'
    | 'url';
    name?: string;
    value: InputValue;
    placeholder?: string;
    min?: number;
    max?: number;
    onChange: (value: InputValue) => void;
    onClick?: (e: MouseEvent<HTMLInputElement>) => void;
    onMouseOver?: (e: MouseEvent<HTMLInputElement>) => void;
    onMouseOut?: (e: MouseEvent<HTMLInputElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    generate?: boolean;
    clickBtnName?: string;
    onclickCallback?: (e: MouseEvent<HTMLButtonElement>) => void;
    msg?: InputFeedback;
    description?: string;
    rangeUnit?: string;
    disabled?: boolean;
    readOnly?: boolean;
    size?: string;
    required?: boolean;
    hasAccess?: boolean;
    preText?: Addon;
    postText?: Addon;
    preInsideText?: Addon;
    postInsideText?: Addon;
}

const BasicInputUI = forwardRef<HTMLInputElement, BasicInputProps>(
    (
        {
            wrapperClass,
            inputLabel,
            inputClass,
            id,
            fieldKey,
            type = 'text',
            name = 'basic-input',
            value,
            placeholder,
            min,
            max,
            onChange,
            onClick,
            onMouseOver,
            onMouseOut,
            onFocus,
            onBlur,
            preText,
            postText,
            preInsideText,
            postInsideText,
            size,
            generate,
            clickBtnName,
            onclickCallback,
            msg,
            description,
            rangeUnit,
            disabled = false,
            readOnly = false,
            required = false,
            hasAccess
        },
        ref
    ) => {
        console.log('hasAccess', hasAccess)
        console.log('value', value)
        const [copied, setCopied] = useState(false);

        const renderAddon = (addon: Addon) => {
            if (typeof addon === 'string') {
                return <span dangerouslySetInnerHTML={{ __html: addon }} />;
            }

            return null;
        };

        // const randomKey = (len: number): string =>
        //     Array.from({ length: len }, () =>
        //         'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
        //             Math.floor(Math.random() * 62)
        //         )
        //     ).join('');

        // const handleGenerate = (e: MouseEvent<HTMLButtonElement>) => {
        //     e.preventDefault();
        //     if (onChange) {
        //         const event = {
        //             target: { value: randomKey(8) },
        //         } as React.ChangeEvent<HTMLInputElement>;
        //         onChange(event);
        //     }
        // };

        // const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
        //     e.preventDefault();
        //     if (onChange) {
        //         const event = {
        //             target: { value: '' },
        //         } as React.ChangeEvent<HTMLInputElement>;
        //         onChange(event);
        //     }
        // };

        // const handleCopy = (e: MouseEvent<HTMLButtonElement>) => {
        //     e.preventDefault();
        //     navigator.clipboard.writeText(mainValue);
        //     setCopied(true);
        //     setTimeout(() => setCopied(false), 3000);
        // };

        return (
            <>
                <div
                    className={`setting-form-input ${wrapperClass || ''} ${clickBtnName || generate ? 'input-button' : ''
                        } ${preInsideText || postInsideText ? 'inner-input' : ''}`}
                >
                    {inputLabel && <label htmlFor={id}>{inputLabel}</label>}

                    {type === 'button' ? (
                        <AdminButton
                            buttons={{
                                text: name,
                                onClick: () => onclickCallback
                                    ? onclickCallback(e)
                                    : onClick?.(e as MouseEvent<HTMLInputElement>)
                            }}
                        />
                    ) : (
                        <>
                            <div
                                className="input-wrapper"
                                style={{ width: size || '100%' }}
                            >
                                {preInsideText && (
                                    <span className="pre">
                                        {renderAddon(preInsideText)}
                                    </span>
                                )}

                                <input
                                    ref={ref}
                                    id={id}
                                    className={`basic-input ${inputClass ?? ''}`}
                                    type={type}
                                    name={name}
                                    placeholder={placeholder}
                                    min={
                                        type === 'number' || type === 'range'
                                            ? min
                                            : undefined
                                    }
                                    max={
                                        type === 'number' || type === 'range'
                                            ? max
                                            : undefined
                                    }
                                    value={value}
                                    onChange={(e) =>
                                        onChange(e.target.value)
                                    }
                                    onClick={onClick}
                                    onMouseOver={onMouseOver}
                                    onMouseOut={onMouseOut}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    required={required}
                                />

                                {type === 'color' && (
                                    <div className="color-value">{value ?? ''}</div>
                                )}

                                {postInsideText && (
                                    <span className="parameter">
                                        {renderAddon(postInsideText)}
                                    </span>
                                )}
                            </div>
                        </>
                    )}

                    {type === 'range' && (
                        <output className="settings-metabox-description">
                            {value ?? ''}
                            {rangeUnit}
                        </output>
                    )}
                </div>

                {description && (
                    <p
                        className="settings-metabox-description"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                )}

                {msg && <div className={msg.type}>{msg.message}</div>}
            </>
        );
    }
);

const BasicInput: FieldComponent = {
  render: ({ field, value, onChange, canAccess }) => (
    <BasicInputUI
      wrapperClass={field.wrapperClass}
      inputClass={field.class}
      description={field.desc}
      fieldKey={field.key}
      id={field.id}
      name={field.name}
      type={field.type}
      placeholder={field.placeholder}
      inputLabel={field.inputLabel}
      rangeUnit={field.rangeUnit}
      min={field.min ?? 0}
      max={field.max ?? 50}
      value={value}
      size={field.size}
      hasAccess={canAccess}
      onChange={(val) => {
        if (!canAccess) return;
        onChange(field.key, val)
      }}
    />
  ),

  validate: (field, value) => {
    if (field.required && !value?.[field.key]) {
      return `${field.label} is required`;
    }
    return null;
  },
};

export default BasicInput;

