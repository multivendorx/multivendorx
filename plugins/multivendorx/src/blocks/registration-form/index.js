import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import RegistrationForm from './registrationForm';

// Edit component (no attributes needed for this form)
const EditBlock = () => {
	const blockProps = useBlockProps();
	return (
		<div {...blockProps}>
			<RegistrationForm />
		</div>
	);
};

// Register the block
registerBlockType('multivendorx/registration-form', {
	apiVersion: 2,
	title: 'Registration Form',
	icon: 'admin-users',
	category: 'multivendorx-shortcodes',
	supports: { html: false },

	edit: EditBlock,

	// Save function just outputs a placeholder <div> for frontend rendering
	save() {
		return <div id="multivendorx-registration-form"></div>;
	},
});

// Frontend render
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('multivendorx-registration-form');
	if (element) {
		render(
			<BrowserRouter>
				<RegistrationForm />
			</BrowserRouter>,
			element
		);
	}
});
