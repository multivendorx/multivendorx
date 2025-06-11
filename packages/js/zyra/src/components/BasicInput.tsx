/**
 * External dependencies
 */
import React, { ChangeEvent, MouseEvent, FocusEvent } from 'react';

/**
 * Internal dependencies
 */

// Types
export interface BasicInputProps {
	wrapperClass?: string;
	inputLabel?: string;
	inputClass?: string;
	id?: string;
	type?:
		| 'text'
		| 'button'
		| 'number'
		| 'color'
		| 'password'
		| 'email'
		| 'file'
		| 'range'
		| 'url';
	name?: string;
	value?: string | number;
	placeholder?: string;
	min?: number;
	max?: number;
	onChange?: ( e: ChangeEvent< HTMLInputElement > ) => void;
	onClick?: ( e: MouseEvent< HTMLInputElement > ) => void;
	onMouseOver?: ( e: MouseEvent< HTMLInputElement > ) => void;
	onMouseOut?: ( e: MouseEvent< HTMLInputElement > ) => void;
	onFocus?: ( e: FocusEvent< HTMLInputElement > ) => void;
	onBlur?: ( e: FocusEvent< HTMLInputElement > ) => void;
	parameter?: string;
	proSetting?: boolean;
	description?: string;
	descClass?: string;
	rangeUnit?: string;
	disabled?: boolean;
}

const BasicInput: React.FC< BasicInputProps > = ( {
	wrapperClass,
	inputLabel,
	inputClass,
	id,
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
	parameter,
	proSetting,
	description,
	descClass,
	rangeUnit,
	disabled = false,
} ) => {
	return (
		<div className={ wrapperClass }>
			{ inputLabel && <label htmlFor={ id }>{ inputLabel }</label> }
			<input
				className={ [ 'basic-input', inputClass ].join( ' ' ) }
				id={ id }
				type={ type }
				name={ name }
				placeholder={ placeholder }
				{ ...( type !== 'file' && onChange ? { value } : {} ) }
				{ ...( type === 'number' || type === 'range'
					? { min, max }
					: {} ) }
				onChange={ onChange }
				onClick={ onClick }
				onMouseOver={ onMouseOver }
				onMouseOut={ onMouseOut }
				onFocus={ onFocus }
				onBlur={ onBlur }
				disabled={ disabled }
			/>
			{ parameter && (
				<span
					className="parameter"
					dangerouslySetInnerHTML={ { __html: parameter } }
				/>
			) }
			{ proSetting && <span className="admin-pro-tag">pro</span> }
			{ description && (
				<p
					className={ descClass }
					dangerouslySetInnerHTML={ { __html: description } }
				/>
			) }
			{ type === 'range' && (
				<output className={ descClass }>
					{ value ? value : 0 }
					{ rangeUnit }
				</output>
			) }
		</div>
	);
};

export default BasicInput;
