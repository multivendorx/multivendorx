import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType('multivendorx/store-policy', {

    edit: () => {
        return (
            <>
                <h2>Store policy</h2>
            </>
        );
    },

    save: () => {

        return (
            <h2>Store policy</h2>
        );
    }
});
