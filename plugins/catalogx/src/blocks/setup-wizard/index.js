import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import SetupWizard from './SetupWizard';

// EditBlock for Gutenberg editor
const EditBlock = () => {
	const blockProps = useBlockProps();
	return (
		<div {...blockProps}>
			<SetupWizard />
		</div>
	);
};

// Register the block
registerBlockType('catalogx/setup-wizard', {
	apiVersion: 2,
	title: 'Setup Wizard',
	icon: 'welcome-widgets-menus',
	category: 'catalogx',
	supports: { html: false },

	edit: EditBlock,

	// Save outputs a placeholder div for frontend rendering
	save() {
		return <div id="catalogx-setup-wizard"></div>;
	},
});


