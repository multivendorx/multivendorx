import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType( 'vulocart/offerings', {
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
					'VuloCart Offerings — renders the catalog listing (or a single offering\'s detail page, via ?offering=) on the published page.',
					'vulocart'
				) }
			</div>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save();

		return (
			<div { ...blockProps }>
				<div className="vulocart-offerings-block"></div>
			</div>
		);
	},
} );
