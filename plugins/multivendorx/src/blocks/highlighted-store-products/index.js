import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl } from '@wordpress/components';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import ProductList from './productList';

registerBlockType('multivendorx/highlighted-store-products', {
	apiVersion: 2,
	attributes: {
		productType: {
			type: 'string',
			default: 'recent',
		},
		limit: {
			type: 'number',
			default: 4,
		},
	},

	edit: ({ attributes, setAttributes }) => {
		const { productType, limit } = attributes;
		const blockProps = useBlockProps();

		return (
			<div {...blockProps}>
				<InspectorControls>
					<PanelBody
						title={__('Product Settings', 'multivendorx')}
						initialOpen={true}
					>
						<SelectControl
							label={__('Product Type', 'multivendorx')}
							value={productType}
							options={[
								{
									label: __('By Rating', 'multivendorx'),
									value: 'rating',
								},
								{
									label: __('Recent', 'multivendorx'),
									value: 'recent',
								},
								{
									label: __('On Sale', 'multivendorx'),
									value: 'on_sale',
								},
							]}
							onChange={(value) =>
								setAttributes({ productType: value })
							}
						/>

						{/* Limit Setting */}
						<RangeControl
							label={__('Number of Products', 'multivendorx')}
							value={limit}
							onChange={(value) =>
								setAttributes({ limit: value })
							}
							min={1}
							max={20}
						/>
					</PanelBody>
				</InspectorControls>

				{/* Editor preview with static dummy products */}
				<ProductList
					isEditor={true}
					productType={productType}
					limit={limit}
				/>
			</div>
		);
	},

	save: ({ attributes }) => {
		const { productType, limit } = attributes;

		const blockProps = useBlockProps.save({
			className: 'multivendorx-highlighted-products',
			'data-product-type': productType,
			'data-limit': limit,
		});

		return <div {...blockProps}></div>;
	},
});

// Frontend mounting
document.addEventListener('DOMContentLoaded', () => {
	const elements = document.querySelectorAll(
		'.multivendorx-highlighted-products'
	);

	elements.forEach((el) => {
		const productType = el.dataset.productType || 'recent';
		const limit = parseInt(el.dataset.limit, 10) || 4;

		render(
			<BrowserRouter>
				<ProductList
					isEditor={false}
					productType={productType}
					limit={limit}
				/>
			</BrowserRouter>,
			el
		);
	});
});
