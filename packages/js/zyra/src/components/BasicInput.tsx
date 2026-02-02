// External Dependencies
import { MouseEvent, FocusEvent, useState, forwardRef, ReactNode } from 'react';

// Internal Dependencies
import DisplayButton from './DisplayButton';
import SelectInput from './SelectInput';

interface InputFeedback {
    type: string;
    message: string;
}

interface SelectOption {
    value: string;
    label: string;
}

type InputValue = string | number | Record<string, string>;

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
    preText?: Addon;
    postText?: Addon;
    preInsideText?: Addon;
    postInsideText?: Addon;
}

const BasicInput = forwardRef<HTMLInputElement, BasicInputProps>(
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
        },
        ref
    ) => {
        const [copied, setCopied] = useState(false);

        const mainValue =
            typeof value === 'object' && fieldKey
                ? value[fieldKey]
                : String(value);

        const updateValue = (newVal: string) => {
            if (typeof value === 'object' && fieldKey) {
                onChange({ ...value, [fieldKey]: newVal });
            } else {
                onChange(newVal);
            }
        };

        const renderAddon = (addon: Addon) => {
            if (typeof addon === 'string') {
                return <span dangerouslySetInnerHTML={{ __html: addon }} />;
            }

            if (!addon) {
                return addon;
            }

            if (addon.type === 'select') {
                const selected =
                    typeof value === 'object'
                        ? value[addon.key]
                        : addon.value;

                return (
                    <SelectInput
                        name={addon.key}
                        options={addon.options}
                        value={selected}
                        size={addon.size}
                        onChange={(opt) =>
                            onChange({
                                ...(typeof value === 'object' ? value : {}),
                                [addon.key]: opt.value,
                            })
                        }
                    />
                );
            }

            if (addon.type === 'text') {
                const textVal =
                    typeof value === 'object'
                        ? value[addon.key]
                        : addon.value;

                return (
                    <input
                        type="text"
                        className="addon-text-input"
                        style={{ width: addon.size ?? '80px' }}
                        placeholder={addon.placeholder}
                        value={textVal}
                        onChange={(e) =>
                            onChange({
                                ...(typeof value === 'object' ? value : {}),
                                [addon.key]: e.target.value,
                            })
                        }
                    />
                );
            }

            return null;
        };

        const randomKey = (len: number): string =>
            Array.from({ length: len }, () =>
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
                    Math.floor(Math.random() * 62)
                )
            ).join('');

        const handleGenerate = (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            updateValue(randomKey(8));
        };

        const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            updateValue('');
        };

        const handleCopy = (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            navigator.clipboard.writeText(mainValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        };

        return (
            <>
                <div
                    className={`setting-form-input ${wrapperClass || ''} ${
                        clickBtnName || generate ? 'input-button' : ''
                    } ${preInsideText || postInsideText ? 'inner-input' : ''}`}
                >
                    {inputLabel && <label htmlFor={id}>{inputLabel}</label>}

                    {type === 'button' ? (
                        <DisplayButton
                            wraperClass={inputClass || 'admin-btn default-btn'}
                            onClick={(e) =>
                                onclickCallback
                                    ? onclickCallback(e)
                                    : onClick?.(e as MouseEvent<HTMLInputElement>)
                            }
                        >
                            <span className="text">{name}</span>
                        </DisplayButton>
                    ) : (
                        <>
                            {preText && (
                                <span className="before">
                                    {renderAddon(preText)}
                                </span>
                            )}

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
                                    value={mainValue}
                                    onChange={(e) =>
                                        updateValue(e.target.value)
                                    }
                                    onChange={(e) => {
                                        const newVal = e.target.value;

                                        const hasObjectAddon =
                                            (preText &&
                                                typeof preText === 'object') ||
                                            (postText &&
                                                typeof postText === 'object') ||
                                            (postInsideText &&
                                                typeof postInsideText === 'object') ||
                                            (preInsideText &&
                                                typeof preInsideText === 'object');

                                        if (hasObjectAddon) {
                                            // Save as object with main value
                                            const base =
                                                typeof value === 'object'
                                                    ? value
                                                    : {
                                                          value:
                                                              typeof value === 'string'
                                                                  ? value
                                                                  : '',
                                                      };
                                            onChange({
                                                ...base,
                                                value: newVal,
                                            });
                                        } else {
                                            onChange(e);
                                        }
                                    }}
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
                                    <div className="color-value">{mainValue}</div>
                                )}

                                {postInsideText && (
                                    <span className="parameter">
                                        {renderAddon(postInsideText)}
                                    </span>
                                )}

                                {clickBtnName && (
                                    <DisplayButton
                                        wraperClass="admin-btn btn-purple input-btn"
                                        onClick={onclickCallback}
                                    >
                                        {clickBtnName}
                                    </DisplayButton>
                                )}

                                {generate &&
                                    (mainValue === '' ? (
                                        <DisplayButton
                                            wraperClass="admin-btn btn-purple input-btn"
                                            onClick={handleGenerate}
                                        >
                                            <>
                                                <i className="adminfont-star-icon"></i>
                                                <span className="text">
                                                    Generate
                                                </span>
                                            </>
                                        </DisplayButton>
                                    ) : (
                                        <>
                                            <DisplayButton
                                                wraperClass="clear-btn"
                                                onClick={handleClear}
                                            >
                                                <i className="adminfont-delete"></i>
                                            </DisplayButton>
                                            <DisplayButton
                                                wraperClass="copy-btn"
                                                onClick={handleCopy}
                                            >
                                                <>
                                                    <i className="adminfont-vendor-form-copy"></i>
                                                    <span
                                                        className={
                                                            !copied
                                                                ? 'tooltip'
                                                                : 'tooltip tool-clip'
                                                        }
                                                    >
                                                        {copied ? (
                                                            <>
                                                                <i className="adminfont-success-notification"></i>
                                                                Copied
                                                            </>
                                                        ) : (
                                                            'Copy to clipboard'
                                                        )}
                                                    </span>
                                                </>
                                            </DisplayButton>
                                        </>
                                    ))}
                            </div>

                            {postText && (
                                <span className="after">
                                    {renderAddon(postText)}
                                </span>
                            )}
                        </>
                    )}

                    {type === 'range' && (
                        <output className="settings-metabox-description">
                            {mainValue}
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

export default BasicInput;
