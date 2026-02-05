import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { 
    useBlockProps,
    BlockControls,
    AlignmentToolbar
} from '@wordpress/block-editor';

registerBlockType('multivendorx/store-address', {

    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps({
            className: 'multivendorx-store-address-block',
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
                    <span className="dashicons dashicons-location"></span>
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
                <span className="dashicons dashicons-location"></span>
                <div className="multivendorx-store-address-block"></div>
            </div>
        );
    }
});

// document.addEventListener('DOMContentLoaded', () => {
// 	document
// 		.querySelectorAll('.multivendorx-store-email-block')
// 		.forEach(el => {
// 			el.textContent = StoreInfo.storeDetails.storeEmail;
// 		});
// });

