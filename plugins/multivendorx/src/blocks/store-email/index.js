import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';

const EmailIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="20"
		height="20"
	>
		<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
	</svg>
);
registerBlockType('multivendorx/store-email', {
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps({
			className: 'multivendorx-store-email-block',
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
					<EmailIcon />
					<span> {__('store@gmail.com', 'multivendorx')}</span>
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
				<span className="dashicons dashicons-email"></span>
				<div className="multivendorx-store-email-block"></div>
			</div>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('.multivendorx-store-email-block')
    .forEach((el) => {
      const email = StoreInfo?.storeDetails?.storeEmail;

      if (email) {
        el.textContent = email;
      } else {
        el.closest('.wp-block-multivendorx-store-email')?.remove();
      }
    });
});