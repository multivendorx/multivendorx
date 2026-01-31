import { registerBlockType } from '@wordpress/blocks';

registerBlockType('multivendorx/store-email', {
    edit() {
        return <h2>Store Email</h2>;
    },

    save() {
        return <h2 className="multivendorx-store-email"></h2>;
    },
});

document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelectorAll('.multivendorx-store-email')
        .forEach(el => {
            el.textContent = StoreInfo.storeDetails.storeName;
        });
});