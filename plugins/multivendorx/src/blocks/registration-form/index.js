import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

// The form itself is a VuloForm form, rendered on the server; the editor shows a placeholder.
const EditBlock = () => {
	const blockProps = useBlockProps();
	return (
		<div {...blockProps}>
			<p>{__('Store registration form (built with VuloForm).', 'multivendorx')}</p>
		</div>
	);
};

// Register the block
registerBlockType('multivendorx/registration-form', {
	apiVersion: 3,
	title: 'Registration Form',
	icon: 'admin-users',
	category: 'multivendorx-shortcodes',
	supports: { html: false },

	edit: EditBlock,

	// Kept as before so existing blocks stay valid; the front end is rendered by render.php.
	save() {
		return <div id="multivendorx-registration-form"></div>;
	},
});

