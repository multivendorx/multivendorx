import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import ContactForm from './ContactForm';
import { initializeModules } from 'zyra';

initializeModules(storesList, 'multivendorx', 'free', 'modules');

const EditBlock = (props) => {
	const { attributes, setAttributes } = props;
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title="Contact Settings">
					<TextControl
						label="Recipient Email"
						value={attributes.recipient}
						onChange={(value) =>
							setAttributes({ recipient: value })
						}
					/>
				</PanelBody>
			</InspectorControls>

			<ContactForm recipient={attributes.recipient} />
		</div>
	);
};

registerBlockType('multivendorx/contact-info', {
	apiVersion: 2,
	title: 'Contact Info (w)',
	icon: 'email',
	category: 'widgets',
	supports: { html: false },

	attributes: {
		recipient: {
			type: 'string',
			default: '',
		},
	},

	edit: EditBlock,

	save({ attributes }) {
		return (
			<div
				id="contact-form"
				data-attributes={JSON.stringify(attributes)}
			></div>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('contact-form');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);

		render(
			<BrowserRouter>
				<ContactForm {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});
