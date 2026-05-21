import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

registerBlockType('catalogx/enquiry-button', {
	edit: () => {
		const blockProps = useBlockProps({
			className: 'catalogx-enquiry-button-editor',
		});

		return (
			<div {...blockProps}>
				<button className="wp-block-button__link wp-element-button">
					{__('Enquiry Button', 'catalogx')}
				</button>
			</div>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save({
			className: 'catalogx-enquiry-button',
		});

		const productId =
			window?.wp?.data
				?.select('core/editor')
				?.getCurrentPostId?.() || 0;

		return (
			<div
				{...blockProps}
				data-product-id={productId}
			></div>
		);
	},
});