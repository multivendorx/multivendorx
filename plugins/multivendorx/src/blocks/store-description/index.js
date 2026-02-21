import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';

const TEXT_DOMAIN = 'multivendorx';

registerBlockType('multivendorx/store-description', {
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps({
			className: 'multivendorx-store-description',
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

				<p {...blockProps}>
					{__(
						`Lorem Ipsum is simply dummy text of the printing and
typesetting industry. Lorem Ipsum has been the industry's
standard dummy text ever since the 1500s`,
						TEXT_DOMAIN
					)}
				</p>
			</>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save();

		return (
			<p
				{...blockProps}
				className="multivendorx-store-description"
				data-store-description=""
			></p>
		);
	},
});

/*
 * Localization data should be passed from PHP like:
 *
 * wp_localize_script( 'your-block-script-handle', 'StoreInfo', array(
 *     'storeDetails' => array(
 *         'storeDescription' => __('Your description here', 'multivendorx')
 *     )
 * ));
 */

document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.multivendorx-store-description')
		.forEach((el) => {
			if (window.StoreInfo?.storeDetails?.storeDescription) {
				el.textContent = window.StoreInfo.storeDetails.storeDescription;
			}
		});
});