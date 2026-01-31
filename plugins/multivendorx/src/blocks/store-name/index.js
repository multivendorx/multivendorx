import { registerBlockType } from '@wordpress/blocks';

registerBlockType('multivendorx/store-name', {
    edit() {
        return <h2>Store Name</h2>;
    },

    save() {
        return <h2 className="multivendorx-store-name"></h2>;
    },
});

document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelectorAll('.multivendorx-store-name')
        .forEach(el => {
            el.textContent = StoreInfo.storeDetails.storeName;
        });
});

