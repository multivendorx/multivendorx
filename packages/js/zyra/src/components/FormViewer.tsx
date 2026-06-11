// External dependencies
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import type { MultiValue, SingleValue } from 'react-select';

// Internal dependencies
import CustomRecaptcha from './CustomRecaptcha';
import { CountryCodes } from './fieldUtils';

// ─── Types ───────────────────────────────────────────────────────────────────

type InputValue =
    | string
    | number
    | boolean
    | File
    | string[]
    | { country_code: string; phone: string }
    | null
    | undefined;

type AddressSubField = {
    key: string;
    label: string;
    type: 'text' | 'select';
    required?: boolean;
    placeholder?: string;
};

type FormMessages = {
	fieldRequired?: string;
	invalidEmail?: string;
	termsRequired?: string;
};

declare global {
    interface Window {
        grecaptcha?: {
            ready: (callback: () => void) => void;
            execute: (
                siteKey: string,
                options: { action: string }
            ) => Promise<string>;
        };
    }
}

interface Option {
    value: string;
    label: string;
    isDefault?: boolean;
}

interface Field {
    id: string;
    type: string;
    name?: string;
    text?: string;
    html?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    charlimit?: number;
    row?: number;
    col?: number;
    disabled?: boolean;
    options?: Option[];
    sitekey?: string;
    key?: string;
    fields?: AddressSubField[];
    style?: string;
}

interface ButtonSetting {
    button_text?: string;
    [key: string]: string | number | boolean | undefined;
}

interface FormFields {
    formfieldlist: Field[];
    butttonsetting?: ButtonSetting;
}

interface FormViewerProps {
    formFields: FormFields;
    response?: Record<string, string | number | File | undefined>;
    onSubmit: (
        data: Record<string, string | number | File | undefined>
    ) => void;
    countryList?: Option[];
    stateList?: Record<string, Option[] | Record<string, string>>;
    formMessages?: FormMessages;
    onClose?: () => void;
}

// ─── Placeholder Helpers ─────────────────────────────────────────────────────

type FormDataType = { default_placeholder: { name: string; email: string } };

const enquiryFormData: FormDataType = {
    default_placeholder: { name: '', email: '' },
};
const wholesaleFormData: FormDataType = {
    default_placeholder: { name: '', email: '' },
};
const enquiryCartTable: FormDataType = {
    default_placeholder: { name: '', email: '' },
};

const getDefaultPlaceholder = (key: 'name' | 'email'): string | undefined =>
    enquiryFormData?.default_placeholder?.[key] ??
    wholesaleFormData?.default_placeholder?.[key] ??
    enquiryCartTable?.default_placeholder?.[key];

// ─── Shared FormRow Wrapper ───────────────────────────────────────────────────

const FormRow: React.FC<{
    label?: string;
    fieldName?: string;
    error?: string;
    children: React.ReactNode;
}> = ({ label, fieldName, error, children }) => (
    <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
        {label && <label htmlFor={fieldName}>{label}</label>}
        {children}
        {error && <span className="error-text">{error}</span>}
    </p>
);

// ─── Sub-Components ───────────────────────────────────────────────────────────

const Checkboxes: React.FC<{
    options: Option[];
    onChange: (data: string[]) => void;
}> = ({ options, onChange }) => {
    const [checkedItems, setCheckedItems] = useState<Option[]>(
        options.filter(({ isDefault }) => isDefault)
    );

    useEffect(() => {
        onChange(checkedItems.map((item) => item.value));
    }, [checkedItems, onChange]);

    const handleChange = (option: Option, checked: boolean) => {
        const updated = checkedItems.filter(
            (item) => item.value !== option.value
        );
        if (checked) {
            updated.push(option);
        }
        setCheckedItems(updated);
    };

    return (
        <>
            {options.map((option) => (
                <label
                    key={option.value}
                    htmlFor={option.value}
                    className="woocommerce-form__label woocommerce-form__label-for-checkbox"
                >
                    <input
                        type="checkbox"
                        className="woocommerce-form__input woocommerce-form__input-checkbox"
                        id={option.value}
                        checked={
                            !!checkedItems.find(
                                (item) => item.value === option.value
                            )
                        }
                        onChange={(e) => handleChange(option, e.target.checked)}
                    />
                    <span>{option.label}</span>
                </label>
            ))}
        </>
    );
};

const Radio: React.FC<{
    options: Option[];
    onChange: (value: string | undefined) => void;
}> = ({ options, onChange }) => {
    const [selected, setSelected] = useState<string | undefined>(
        options.find(({ isDefault }) => isDefault)?.value
    );

    useEffect(() => {
        onChange(selected);
    }, [selected, onChange]);

    return (
        <div className="multiselect-container items-wrapper">
            {options.map((option, index) => (
                <label
                    key={option.value}
                    className="woocommerce-form__label woocommerce-form__label-for-radio"
                    data-index={index}
                    htmlFor={option.value}
                >
                    <input
                        type="radio"
                        className="woocommerce-form__input woocommerce-form__input-radio"
                        id={option.value}
                        value={option.value}
                        checked={selected === option.value}
                        onChange={(e) => setSelected(e.target.value)}
                    />
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    );
};

const Multiselect: React.FC<{
    options: Option[];
    onChange: (value: string[] | string | null) => void;
    isMulti?: boolean;
}> = ({ options = [], onChange, isMulti = false }) => {
    const [selectedOptions, setSelectedOptions] = useState<
        MultiValue<Option> | SingleValue<Option>
    >(
        isMulti
            ? options.filter(({ isDefault }) => isDefault)
            : options.find(({ isDefault }) => isDefault) || null
    );

    const handleChange = (
        newValue: MultiValue<Option> | SingleValue<Option>
    ) => {
        setSelectedOptions(newValue);
        if (isMulti) {
            onChange(
                Array.isArray(newValue) ? newValue.map((o) => o.value) : []
            );
        } else {
            onChange(newValue ? (newValue as Option).value : null);
        }
    };

    return (
        <Select
            isMulti={isMulti}
            value={selectedOptions}
            onChange={handleChange}
            options={options}
        />
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FormViewer: React.FC<FormViewerProps> = ({
    formFields,
    onClose,
    response,
    onSubmit,
    countryList,
    stateList,
    formMessages={},
}) => {
    const [inputs, setInputs] = useState<Record<string, InputValue>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fileName, setFileName] = useState<string>('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaError, setCaptchaError] = useState<boolean>(false);
    const [isCaptchaValid, setIsCaptchaValid] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const formList = formFields.formfieldlist || [];
    const buttonField = formList.find((f) => f.type === 'button');
    const otherFields = formList
    .filter((f) => f.type !== 'button')
    .sort((a, b) => {
        // push richtext to the end
        if (a.type === 'richtext') {
            return 1;
        }

        if (b.type === 'richtext') {
            return -1;
        }

        return 0;
    });
    const recaptchaField = formList.find((f) => f.type === 'recaptcha');
    const siteKey = recaptchaField?.sitekey || null;
    const defaultDate = new Date().getFullYear() + '-01-01';

    useEffect(() => {
        if (response) {
            setInputs(response);
        }
    }, [response]);

    useEffect(() => {
        if (!siteKey) {
            return;
        }

        const loadRecaptcha = () => {
            window.grecaptcha?.ready(() => {
                window.grecaptcha
                    ?.execute(siteKey, { action: 'form_submission' })
                    .then(setCaptchaToken)
                    .catch(() => setCaptchaError(true));
            });
        };

        if (!window.grecaptcha) {
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            script.async = true;
            script.onload = loadRecaptcha;
            script.onerror = () => setCaptchaError(true);
            document.body.appendChild(script);
        } else {
            loadRecaptcha();
        }
    }, [siteKey]);

    const handleChange = (name: string, value: InputValue) => {
        setInputs((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleFileChange = (
        name: string,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setInputs((prev) => ({ ...prev, [name]: file }));
            // Clear error for this field
            if (errors[name]) {
                setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated[name];
                    return updated;
                });
            }
        }
    };

    const handleCaptchaValidation = (valid: boolean) => {
        setIsCaptchaValid(valid);
    };

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const error: Record<string, string> = {};
        const customCaptchaField = formList.find(
            (f) => f.type === 'custom-recaptcha'
        );

        setSubmitted(true);
        if (
            customCaptchaField &&
            !isCaptchaValid
        ) {
            setErrors((prev) => ({
                ...prev,
                [customCaptchaField.label || customCaptchaField.id]:
                    'Invalid security code.',
            }));
            return;
        }

        const isValidEmail = (email: string) =>
            /^\S+@\S+\.([a-zA-Z]{2,})$/.test(email);

        formList.forEach((field) => {
            if (field.disabled || !field.name) {
                return;
            }

            const value = inputs[field.name];

            if (field.name === 'name') {
                if (!value || (typeof value === 'string' && !value.trim())) {
                    error[field.name] = formMessages.fieldRequired?.replace( '%s', field.label || 'Store Name' );
                }
                return;
            }

            if (field.type === 'email') {
                if (!isValidEmail(value as string)) {
                    error[field.name] = formMessages.invalidEmail;
                }
                return;
            }

            // ✅ NORMAL REQUIRED FIELDS
            if (!field.required) {
                return;
            }

            switch (field.type) {
                case 'text':
                case 'email':
                case 'textarea':
                case 'datepicker':
                case 'timepicker':
                    if (
                        !value ||
                        (typeof value === 'string' && !value.trim())
                    ) {
                        error[field.name] = formMessages.fieldRequired?.replace('%s', field.label || '');
                    }
                    break;
                case 'checkboxes':
                case 'multi-select':
                    if (!Array.isArray(value) || value.length === 0) {
                        error[field.name] = formMessages.fieldRequired?.replace('%s', field.label || '');
                    }
                    break;
                case 'dropdown':
                case 'radio':
                case 'attachment':
                    if (!value) {
                        error[field.name] = formMessages.fieldRequired?.replace('%s', field.label || '');
                    }
                    break;
                case 'richtext':
                    if (!value) {
                        error[field.name] = formMessages.termsRequired;
                    }
                    break;
            }
        });

        if (Object.keys(error).length) {
            setErrors(error);
            return;
        }

        setErrors({});

        const submitData: Record<
            string,
            | string
            | number
            | File
            | { country_code: string; phone: string }
            | undefined
        > = {};
        for (const key in inputs) {
            const value = inputs[key];
            if (value !== undefined && value !== null) {
                submitData[key] = value as
                    | string
                    | number
                    | File
                    | { country_code: string; phone: string }
                    | undefined;
            }
        }
        onSubmit(submitData);
    };

    // ─── Field Renderer ───────────────────────────────────────────────────────

    const renderField = (field: Field) => {
        if (field.disabled) {
            return null;
        }

        const name = field.name ?? '';
        const error = errors[name];

        switch (field.type) {
            case 'title':
                return <h2 key={field.id}>{field.text}</h2>;

            case 'section':
                return (
                    <p
                        key={field.id}
                        className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide"
                    >
                        {field.label}
                    </p>
                );

            case 'divider':
                return (
                    <p key={field.id} className="section-divider-container" />
                );

            case 'text':
                if (
                    field.name === 'store-phone' ||
                    field.label === 'Store Phone' ||
                    field.label === 'Phone'
                ) {
                    const value =
                        (inputs[name] as {
                            country_code?: string;
                            phone?: string;
                        }) || {};

                    return (
                        <FormRow
                            key={field.id}
                            label={field.label}
                            fieldName={name}
                            error={error}
                        >
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {/* Country Code Dropdown */}
                                <div style={{ minWidth: '140px' }}>
                                    <select
                                        value={value.country_code || ''}
                                        onChange={(e) =>
                                            handleChange(name, {
                                                ...value,
                                                country_code: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            Select country code
                                        </option>

                                        {CountryCodes.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Phone Input */}
                                <input
                                    type="text"
                                    className="input-text"
                                    value={value.phone || ''}
                                    placeholder={field.placeholder}
                                    onChange={(e) =>
                                        handleChange(name, {
                                            ...value,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </FormRow>
                    );
                }

                // ✅ DEFAULT TEXT FIELD
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <input
                            type="text"
                            name={field.id}
                            className="input-text"
                            value={(inputs[name] as string) || ''}
                            placeholder={field.placeholder}
                            onChange={(e) => handleChange(name, e.target.value)}
                            required={field.required}
                            maxLength={field.charlimit}
                        />
                    </FormRow>
                );

            case 'email':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <input
                            type="email"
                            name={name}
                            className="input-text"
                            value={
                                (inputs[name] as string) ||
                                getDefaultPlaceholder('email') ||
                                ''
                            }
                            placeholder={field.placeholder}
                            onChange={(e) => handleChange(name, e.target.value)}
                            required={field.required}
                            maxLength={field.charlimit}
                        />
                    </FormRow>
                );

            case 'textarea':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <textarea
                            name={field.id}
                            className="input-text"
                            value={(inputs[name] as string) || ''}
                            placeholder={field.placeholder}
                            onChange={(e) => handleChange(name, e.target.value)}
                            required={field.required}
                            maxLength={field.charlimit}
                            rows={field.row}
                            cols={field.col}
                        />
                    </FormRow>
                );

            case 'checkboxes':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <Checkboxes
                            options={field.options || []}
                            onChange={(data) => handleChange(name, data)}
                        />
                    </FormRow>
                );

            case 'multi-select':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <div className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <Multiselect
                                options={field.options ?? []}
                                onChange={(data) => handleChange(name, data)}
                                isMulti
                            />
                        </div>
                    </FormRow>
                );

            case 'dropdown':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <div className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <Multiselect
                                options={field.options ?? []}
                                onChange={(data) => handleChange(name, data)}
                            />
                        </div>
                    </FormRow>
                );

            case 'radio':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <Radio
                            options={field.options ?? []}
                            onChange={(data) => handleChange(name, data)}
                        />
                    </FormRow>
                );

            case 'recaptcha':
                return (
                    <p
                        key={field.id}
                        className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide"
                    >
                        <div className="recaptcha-wrapper">
                            <input
                                type="hidden"
                                name="g-recaptcha-response"
                                value={captchaToken as string}
                                className="input-text"
                            />
                        </div>
                    </p>
                );

            case 'attachment':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <input
                            readOnly
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(name, e)}
                        />
                    </FormRow>
                );

            case 'datepicker':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <div className="date-picker-wrapper">
                            <input
                                type="date"
                                className="input-text"
                                value={(inputs[name] as string) || defaultDate}
                                onChange={(e) =>
                                    handleChange(name, e.target.value)
                                }
                            />
                        </div>
                    </FormRow>
                );

            case 'timepicker':
                return (
                    <FormRow
                        key={field.id}
                        label={field.label}
                        fieldName={name}
                        error={error}
                    >
                        <input
                            type="time"
                            className="input-text"
                            value={(inputs[name] as string) || ''}
                            onChange={(e) => handleChange(name, e.target.value)}
                        />
                    </FormRow>
                );

            case 'address': {
                const subFields: AddressSubField[] = field.fields?.length
                    ? field.fields
                    : [
                          {
                              key: 'address',
                              label: 'Address Line 1',
                              type: 'text',
                              required: true,
                          },
                          {
                              key: 'address_2',
                              label: 'Address Line 2',
                              type: 'text',
                          },
                          {
                              key: 'city',
                              label: 'City',
                              type: 'text',
                              required: true,
                          },
                          { key: 'country', label: 'Country', type: 'select' },
                          { key: 'state', label: 'State', type: 'select' },
                          {
                              key: 'zip',
                              label: 'Postal Code',
                              type: 'text',
                              required: true,
                          },
                      ];

                return (
                    <fieldset key={field.id}>
                        <legend>{field.label}</legend>
                        {subFields.map((subField) => {
                            const inputName = subField.key;
                            const subValue = inputs[inputName] ?? '';

                            if (subField.type === 'text') {
                                return (
                                    <p
                                        key={subField.key}
                                        className="woocommerce-form-row form-row"
                                    >
                                        <label>{subField.label}</label>
                                        <input
                                            type="text"
                                            className="input-text"
                                            value={subValue as string}
                                            placeholder={subField.placeholder}
                                            required={subField.required}
                                            onChange={(e) =>
                                                handleChange(
                                                    inputName,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </p>
                                );
                            }

                            if (subField.type === 'select') {
                                let options: Option[] = [];

                                if (subField.key === 'country') {
                                    options = countryList || [];
                                } else if (subField.key === 'state') {
                                    const selectedCountry = inputs['country'];
                                    const rawStates =
                                        stateList?.[selectedCountry as string];

                                    if (Array.isArray(rawStates)) {
                                        options = rawStates;
                                    } else if (
                                        rawStates &&
                                        typeof rawStates === 'object'
                                    ) {
                                        options = Object.entries(rawStates).map(
                                            ([code, label]) => ({
                                                value: code,
                                                label: String(label),
                                            })
                                        );
                                    }
                                }

                                return (
                                    <p
                                        key={subField.key}
                                        className="woocommerce-form-row form-row"
                                    >
                                        <label>{subField.label}</label>
                                        <Multiselect
                                            options={options}
                                            onChange={(val) =>
                                                handleChange(inputName, val)
                                            }
                                        />
                                    </p>
                                );
                            }

                            return null;
                        })}
                    </fieldset>
                );
            }

            case 'button':
                    return (
                        <p key={field.id} className="woocommerce-form-row form-row">
                            <button 
                                className="woocommerce-button button wp-element-button"
                                style={field.style ? JSON.parse(field.style) : {}}
                                onClick={(e) => {
                                    const captcha = formList.find(
                                        (f) => f.type === 'recaptcha'
                                    );
                                    if (captcha?.disabled === false) {
                                        if (captchaError || !captchaToken) {
                                            return;
                                        }
                                    }
                                    handleSubmit(e);
                                }}
                            >
                                {field.label || field.placeholder || 'Submit'}
                            </button>
                        </p>
                    );
            case 'richtext':
                return (
                    <label
                        key={field.id}
                        className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide terms-checkbox"
                    >
                        <input
                            type="checkbox"
                            checked={Boolean(inputs[name])}
                            className='woocommerce-form__input woocommerce-form__input-checkbox'
                            onChange={(e) =>
                                handleChange(name, e.target.checked)
                            }
                        />

                        <span
                            className="richtext-content"
                            dangerouslySetInnerHTML={{
                                __html: field.html || '',
                            }}
                        />

                        {error && (
                            <span className="error-text">
                                {error}
                            </span>
                        )}
                    </label>
                );

            case 'custom-recaptcha':
                return (
                    <CustomRecaptcha
                        captchaValid={handleCaptchaValidation}
                        submitted={submitted}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <form className="woocommerce-form woocommerce-form-login login">
            {onClose && ( <i className='close-icon dashicons dashicons-no-alt' onClick={onClose}></i> )}
            {otherFields.map(renderField)}
            {buttonField && renderField(buttonField)}
        </form>
    );
};

export default FormViewer;
