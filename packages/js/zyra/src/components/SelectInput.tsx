/**
 * External dependencies
 */
import React from 'react';
import Select from 'react-select';
import type { MultiValue, SingleValue, ActionMeta } from 'react-select';

// Types
export interface SelectOptions {
	value: string;
	label?: string;
	index?: number;
}

export interface SelectInputProps {
	wrapperClass?: string;
	selectDeselect?: boolean;
	selectDeselectClass?: string;
	selectDeselectValue?: string;
	name?: string;
	onMultiSelectDeselectChange?: (
		e: React.MouseEvent< HTMLButtonElement >
	) => void;
	options: SelectOptions[];
	value?: string | string[];
	inputClass?: string;
	type?: 'single-select' | 'multi-select';
	onChange?: (
		newValue: SingleValue< SelectOptions > | MultiValue< SelectOptions >,
		actionMeta: ActionMeta< SelectOptions >
	) => void;
	onClick?: ( e: React.MouseEvent< HTMLInputElement > ) => void;
	proSetting?: boolean;
	description?: string;
	descClass?: string;
}

const SelectInput: React.FC< SelectInputProps > = ( {
	wrapperClass,
	selectDeselect,
	selectDeselectClass,
	selectDeselectValue,
	name,
	onMultiSelectDeselectChange,
	options,
	value,
	inputClass,
	type = 'single-select',
	onChange,
	proSetting,
	description,
	descClass,
} ) => {
	// Convert options to react-select format
	const optionsData: SelectOptions[] = options.map( ( option, index ) => ( {
		value: option.value,
		label: option.label,
		index,
	} ) );

	// Find default selected value
	const defaultValue = Array.isArray( value )
		? optionsData.filter( ( opt ) => new Set( value ).has( opt.value ) ) // If it's an array (multi-select), return null or handle differently
		: optionsData.find( ( opt ) => opt.value === value ) || null;

	return (
		<div className={ wrapperClass }>
			{ selectDeselect && (
				<button
					className={ selectDeselectClass }
					onClick={ ( e ) => {
						e.preventDefault();
						onMultiSelectDeselectChange?.( e );
					} }
				>
					{ selectDeselectValue }
				</button>
			) }
			<Select
				name={ name }
				className={ inputClass }
				value={ defaultValue }
				options={ optionsData }
				onChange={ ( newValue, actionMeta ) => {
					onChange?.( newValue, actionMeta );
				} }
				isMulti={ type === 'multi-select' }
			/>
			{ proSetting && <span className="admin-pro-tag">pro</span> }
			{ description && (
				<p
					className={ descClass }
					dangerouslySetInnerHTML={ { __html: description } }
				></p>
			) }
		</div>
	);
};

export default SelectInput;
