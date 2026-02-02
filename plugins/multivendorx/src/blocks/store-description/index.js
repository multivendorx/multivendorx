import { registerBlockType } from '@wordpress/blocks';

registerBlockType('multivendorx/store-description', {
	edit() {
		return <h2>Demo Description</h2>;
	},

	save() {
		return <p className="multivendorx-store-description"></p>;
	},
});

document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.multivendorx-store-description')
		.forEach(el => {
			el.textContent = StoreInfo.storeDetails.storeDescription;
		});
});

