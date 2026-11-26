/* global appLocalizer */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { createRoot } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { configureZyra } from '@zyra/core';
import SetupWizard from './SetupWizard';

configureZyra(appLocalizer);

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
registerBlockType('multivendorx/setup-wizard', {
	apiVersion: 3,
	title: 'Setup Wizard',
	icon: 'welcome-widgets-menus',
	category: 'multivendorx',
	supports: { html: false },

	edit: EditBlock,

	// Save outputs a placeholder div for frontend rendering
	save() {
		return <div id="multivendorx-setup-wizard"></div>;
	},
});

// Render on frontend
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('multivendorx-setup-wizard');
	if (element) {
		createRoot(element).render(
			<BrowserRouter>
				<SetupWizard />
			</BrowserRouter>
		);
	}
});
