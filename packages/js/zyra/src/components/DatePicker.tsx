/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HoverInputRender from './HoverInputRender';

// Types
interface FormField {
	label: string; // The text label for the input field
}

interface DatepickerProps {
	formField: FormField; // The form field object
	onChange: ( field: 'label', value: string ) => void; // Function to handle label change
}

const Datepicker: React.FC< DatepickerProps > = ( { formField, onChange } ) => {
	return (
		<HoverInputRender
			label={ formField.label }
			placeholder="Select date"
			onLabelChange={ ( newLabel ) => onChange( 'label', newLabel ) }
			renderStaticContent={ ( { label } ) => (
				<div className="edit-form-wrapper">
					<p>{ label }</p>
					<div className="settings-form-group-radio">
						<input className="basic-input" type="date" readOnly />
					</div>
				</div>
			) }
			renderEditableContent={ ( {
				label,
				onLabelChange,
				placeholder,
			} ) => (
				<>
					{ /* Editable label input */ }
					<input
						className="basic-input textArea-label"
						type="text"
						value={ label }
						placeholder={ placeholder }
						onChange={ ( event ) =>
							onLabelChange( event.target.value )
						}
					/>

					<input className="basic-input" type="date" readOnly />
				</>
			) }
		/>
	);
};

export default Datepicker;
