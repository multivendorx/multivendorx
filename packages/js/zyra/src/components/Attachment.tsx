/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/Attachment.scss';

// Types
interface FormField {
	label: string;
	placeholder?: string;
}

interface AttachmentProps {
	formField: FormField;
	onChange: ( field: string, value: string ) => void;
}

const Attachment: React.FC< AttachmentProps > = ( { formField, onChange } ) => {
	return (
		<div className="main-input-wrapper">
			{ /* Render label */ }
			<input
				className="basic-input textArea-label"
				type="text"
				value={ formField.label }
				placeholder={ formField.placeholder }
				onChange={ ( event ) =>
					onChange( 'label', event.target.value )
				}
			/>

			{ /* Render attachments */ }
			{ /* Check in catalogx (label frontend)*/ }
			<div className="attachment-section">
				{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
				<label htmlFor="dropzone-file" className="attachment-label">
					<div className="wrapper">
						<i className="adminlib-cloud-upload"></i>
						<p className="heading">
							<span>{ 'Click to upload' }</span>{ ' ' }
							{ 'or drag and drop' }
						</p>
					</div>
				</label>
			</div>
		</div>
	);
};

export default Attachment;
