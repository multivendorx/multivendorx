import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';

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
					Lorem Ipsum is simply dummy text of the printing and
					typesetting industry. Lorem Ipsum has been the industry's
					standard dummy text ever since the 1500s
				</p>
			</>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save();

		return (
			<p {...blockProps} className="multivendorx-store-description"></p>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.multivendorx-store-description')
		.forEach((el) => {
			el.textContent = StoreInfo.storeDetails.storeDescription;
		});
});
