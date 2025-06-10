/**
 * External dependencies
 */
import React from 'react';

// Types
interface FormField {
	label: string;
}

interface TemplateSectionProps {
	formField: FormField;
	onChange: (key: string, value: string) => void;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({
	formField,
	onChange,
}) => {
	return (
		<div className="main-input-wrapper">
			{/* Render label */}
			<input
				className="input-label textArea-label"
				type="text"
				value={formField.label}
				placeholder="I am label"
				onChange={(event) => onChange('label', event.target.value)}
			/>
		</div>
	);
};

export default TemplateSection;
