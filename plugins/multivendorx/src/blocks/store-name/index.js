import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType('multivendorx/store-name', {
    edit({ context }) {
        const blockProps = useBlockProps();

        const storeName =
            context?.['multivendorx/storeName'] ?? 'Demo Store';

        return <h2 {...blockProps}>{storeName}</h2>;
    },

    save() {
        const blockProps = useBlockProps.save();

        return (
            <h2
                {...blockProps}
                data-wp-interactive="multivendorx/store"
                data-wp-text="state.storeName"
            />
        );
    },
});
