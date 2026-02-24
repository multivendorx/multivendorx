import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';

const LocationIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="20"
		height="20"
	>
		<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
	</svg>
);

registerBlockType('multivendorx/store-address', {
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps({
			className: 'multivendorx-store-address-block store-details'
		});
		const showIcon = attributes.showIcon !== false;

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
					{showIcon && <LocationIcon />}
					<span>{__('Kolkata, India', 'multivendorx')}</span>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const blockProps = useBlockProps.save();
		const showIcon = attributes.showIcon !== false;

		return (
			<div {...blockProps}>
				{showIcon && <LocationIcon />}
				<div className="multivendorx-store-address-block store-details"></div>
			</div>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.multivendorx-store-address-block')
		.forEach((el) => {
			el.textContent = StoreInfo.storeDetails.storeAddress;
		});
});
