import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { 
    useBlockProps,
    BlockControls,
    AlignmentToolbar
} from '@wordpress/block-editor';

registerBlockType('multivendorx/store-phone', {

    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps({
            className: 'multivendorx-store-phone-block',
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
                    <span className="dashicons dashicons-phone"></span>
                    <span>+91 9874563210</span>
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
                <span className="dashicons dashicons-phone"></span>
                <div className="multivendorx-store-phone-block"></div>
            </div>
        );
    }
});

document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.multivendorx-store-phone-block')
		.forEach(el => {
			el.textContent = StoreInfo.storeDetails.storePhone;
		});
});
