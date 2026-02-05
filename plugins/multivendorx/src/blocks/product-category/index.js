import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType('multivendorx/product-category', {

    edit: () => {
        return (
            <h2 >product-category</h2>
        );
    },

    save: () => {
        return (
            <h2 className="multivendorx-product-category"></h2>
        );
    }
});


