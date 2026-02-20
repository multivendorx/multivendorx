import { registerBlockType } from '@wordpress/blocks';

registerBlockType('multivendorx/store-sidebar', {
	edit() {
		return (
			<div className="multivendorx-store-sidebar-placeholder">
				<strong>Store Sidebar</strong>
				<p>Widgets render on frontend.</p>
			</div>
		);
	},
	save() {
		return null;
	},
});
