import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType( 'vulocart/order-tracking', {
	edit: () => {
		const blockProps = useBlockProps( {
			style: {
				border: '1px dashed #8c8f94',
				padding: '24px',
				textAlign: 'center',
				color: '#50575e',
			},
		} );

		return (
			<div { ...blockProps }>
				{ __(
					'VuloCart Order Tracking — lets a guest look up their order by number + access token.',
					'vulocart'
				) }
			</div>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save();

		return (
			<div { ...blockProps }>
				<div className="vulocart-order-tracking-block"></div>
			</div>
		);
	},
} );
