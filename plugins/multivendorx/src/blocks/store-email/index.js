import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { 
    useBlockProps,
    BlockControls,
    AlignmentToolbar
} from '@wordpress/block-editor';

registerBlockType('multivendorx/store-email', {

    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps({
            className: 'multivendorx-store-email-block',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }
        });

        return (
            <>
                <BlockControls>
                    <AlignmentToolbar
                        value={attributes.align}
                        onChange={(nextAlign) => {
                            setAttributes({ align: nextAlign });
                        }}
                    />
                </BlockControls>

                <div {...blockProps}>
                    <span className="dashicons dashicons-email"></span>
                    <span>store@gmail.com</span>
                </div>
            </>
        );
    },

    save: () => {
        const blockProps = useBlockProps.save({
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }
        });

        return (
            <div {...blockProps}>
                <span className="dashicons dashicons-email"></span>
                <div className="multivendorx-store-email-block"></div>
            </div>
        );
    }
});