// External Dependencies
import { MouseEvent, FocusEvent, useState, forwardRef, ReactNode } from 'react';

// Internal Dependencies
import { FieldComponent } from './types';

interface InputFeedback {
    type: string;
    message: string;
}

type InputValue = string | number | FileList;

interface BasicInputProps {
    id?: string;
    type?:
    | 'text'
    | 'number'
    | 'color'
    | 'password'
    | 'email'
    | 'file'
    | 'range';
    name?: string;
    placeholder?: string;
    value: InputValue;
    required?: boolean;
    inputClass?: string;
    inputLabel?: string;
    wrapperClass?: string;
    disabled?: boolean;
    readOnly?: boolean;
    size?: string;
    minNumber?: number;
    maxNumber?: number;
    onChange: (value: InputValue) => void;
    onClick?: (e: MouseEvent<HTMLInputElement>) => void;
    onMouseOver?: (e: MouseEvent<HTMLInputElement>) => void;
    onMouseOut?: (e: MouseEvent<HTMLInputElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    msg?: InputFeedback;
    rangeUnit?: string;
    preText?: string;
    postText?: string;
    multiple?: boolean;
}

export const BasicInputUI = forwardRef<HTMLInputElement, BasicInputProps>(
    (
        {
            id,
            type = 'text',
            name = 'basic-input',
            placeholder,
            value,
            required = false,
            inputClass,
            inputLabel,
            wrapperClass,
            disabled = false,
            readOnly = false,
            size,
            minNumber,
            maxNumber,
            onChange,
            onClick,
            onMouseOver,
            onMouseOut,
            onFocus,
            onBlur,
            onKeyDown,
            msg,
            rangeUnit,
            preText,
            postText,
            multiple
        },
        ref
    ) => {
        return (
            <>
                    {inputLabel && <label htmlFor={id}>{inputLabel}</label>}

					<div className={`setting-form-input input-wrapper ${wrapperClass || ''} `} style={{ width: size || '100%' }}>
						{preText && (
							<span className="pre">
                                <span dangerouslySetInnerHTML={{ __html: preText }} />
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
									? minNumber
									: undefined
							}
							max={
								type === 'number' || type === 'range'
									? maxNumber
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
                            onKeyDown={onKeyDown}
							disabled={disabled}
							readOnly={readOnly}
							required={required}
							multiple={multiple}
						/>

						{type === 'color' && (
							<div className="color-value">{value ?? ''}</div>
						)}
                        
                        {postText && (
							<span className="parameter">
                                <span dangerouslySetInnerHTML={{ __html: postText }} />
							</span>
						)}
    
					</div>

                    {type === 'range' && (
                        <output className="settings-metabox-description">
                            {value ?? ''}
                            {rangeUnit}
                        </output>
                    )}
                {msg && <div className={msg.type}>{msg.message}</div>}
            </>
        );
    }
);

const BasicInput: FieldComponent = {
  	render: ({ field, value, onChange, canAccess, appLocalizer }) => (
		<BasicInputUI
            wrapperClass={field.wrapperClass}
            inputClass={field.class}
            id={field.id}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            inputLabel={field.inputLabel}
            rangeUnit={field.rangeUnit}
            minNumber={field.minNumber ?? 0}
            maxNumber={field.maxNumber ?? 50}
            preText={field.preText}
            postText={field.postText}
            value={value}
            size={field.size}
            multiple={field.multiple}
            readOnly={field.readOnly}
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val)
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