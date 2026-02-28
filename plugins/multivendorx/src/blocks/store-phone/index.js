import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';

const PhoneIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="20"
		height="20"
	>
		<path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
	</svg>
);
registerBlockType('multivendorx/store-phone', {
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps({
			className: 'multivendorx-store-phone-block',
			style: {
				display: 'flex',
				alignItems: 'center',
				gap: '0.5rem',
			},
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
					<PhoneIcon />
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
				gap: '0.5rem',
			},
		});

		return (
			<div {...blockProps}>
				<span className="dashicons dashicons-phone"></span>
				<div className="multivendorx-store-phone-block"></div>
			</div>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const phone = window?.StoreInfo?.storeDetails?.storePhone;

	document
		.querySelectorAll('.multivendorx-store-phone-block')
		.forEach((el) => {
			const wrapper = el.closest('.wp-block-multivendorx-store-phone');

			if (!phone) {
				wrapper?.remove(); // removes icon + block completely
				return;
			}

			el.textContent = phone;
		});
});