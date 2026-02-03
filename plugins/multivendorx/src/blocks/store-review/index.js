import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType('multivendorx/store-review', {

    edit: () => {
        return (
            <>
                <h2>Store review</h2>
            </>
        );
    },

    save: () => {

        return (
            <h2>Store review</h2>
        );
    }
});
