import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType('multivendorx/recent-product', {

    edit: () => {
        return (
            <>
                <h2>recent-product</h2>
            </>
        );
    },

    save: () => {

        return (
            <h2>recent-product</h2>
        );
    }
});
