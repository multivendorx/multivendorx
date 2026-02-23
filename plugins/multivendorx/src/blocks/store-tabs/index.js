import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreTabs from './StoreTabs';

const Edit = () => {
	return (
		<div
			style={{
				padding: '16px',
				border: '1px dashed #ccc',
				background: '#fafafa',
				textAlign: 'center',
				fontSize: '14px',
			}}
		>
			<strong>{__('Store Tabs', 'multivendorx')}</strong>
			<p style={{ marginTop: '0.5rem', color: '#666' }}>
				{__(
					'This block renders store tabs on the frontend.',
					'multivendorx'
				)}
			</p>
		</div>
	);
};
registerBlockType('multivendorx/store-tabs', {
	apiVersion: 2,
	edit: Edit,
	save() {
		return <div id="multivendorx-store-tabs"></div>;
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const el = document.getElementById('multivendorx-store-tabs');

	if (!el) {
		return;
	}

	render(
		<BrowserRouter>
			<StoreTabs />
		</BrowserRouter>,
		el
	);
});
