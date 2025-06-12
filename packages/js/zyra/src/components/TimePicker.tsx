/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HoverInputRender from './HoverInputRender';

// Types
interface TimePickerProps {
	formField: { label: string };
	onChange: ( field: string, value: string ) => void;
}

const TimePicker: React.FC< TimePickerProps > = ( { formField, onChange } ) => {
	return (
		<HoverInputRender
			label={ formField.label }
			placeholder="Select time"
			onLabelChange={ ( newLabel ) => onChange( 'label', newLabel ) }
			renderStaticContent={ ( { label } ) => (
				<div className="edit-form-wrapper">
					<p>{ label }</p>
					<div className="settings-form-group-radio">
						<input className="basic-input" type="time" readOnly />
					</div>
				</div>
			) }
			renderEditableContent={ ( { label, onLabelChange } ) => (
				<>
					<input
						className="basic-input textArea-label"
						type="text"
						value={ label }
						onChange={ ( event ) =>
							onLabelChange( event.target.value )
						}
					/>
					<input className="basic-input" type="time" readOnly />
				</>
			) }
		/>
	);
};

export default TimePicker;
