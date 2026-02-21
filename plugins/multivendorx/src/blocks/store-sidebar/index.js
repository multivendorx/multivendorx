import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType('multivendorx/store-sidebar', {
	edit() {
		return (
			<div className="multivendorx-store-sidebar-placeholder">
				<strong>{__('Store Sidebar', 'multivendorx')}</strong>
				<p>{__('Widgets render on frontend.', 'multivendorx')}</p>
			</div>
		);
	},
	save() {
		return null;
	},
});