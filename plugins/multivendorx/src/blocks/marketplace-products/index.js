import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import MarketplaceProductList from './marketplaceProductList';

// EditBlock Component
const EditBlock = (props) => {
	const { attributes, setAttributes } = props;
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title="Product Filters" initialOpen={true}>
					<SelectControl
						label="Sort by"
						value={attributes.orderby}
						options={[
							{ label: 'Title', value: 'title' },
							{ label: 'Date', value: 'date' },
							{ label: 'Rating', value: 'rating' },
							{ label: 'Popularity', value: 'popularity' },
							{ label: 'Price', value: 'price' },
						]}
						onChange={(value) => setAttributes({ orderby: value })}
					/>
					<SelectControl
						label="Order"
						value={attributes.order}
						options={[
							{ label: 'Ascending', value: 'asc' },
							{ label: 'Descending', value: 'desc' },
						]}
						onChange={(value) => setAttributes({ order: value })}
					/>
					<TextControl
						label="Products per page"
						type="number"
						min={1}
						value={attributes.perPage}
						onChange={(value) =>
							setAttributes({
								perPage: parseInt(value, 10) || 12,
							})
						}
					/>
				</PanelBody>
			</InspectorControls>

			{/* Render the Product List with attributes */}
			<MarketplaceProductList
				orderby={attributes.orderby}
				order={attributes.order}
				category={attributes.category}
				perPage={attributes.perPage}
			/>
		</div>
	);
};

// Register the Block
registerBlockType('multivendorx/marketplace-products', {
	apiVersion: 2,
	title: 'Marketplace Products',
	icon: 'products',
	category: 'multivendorx',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'title' },
		order: { type: 'string', default: 'asc' },
		category: { type: 'string', default: '' },
		perPage: { type: 'number', default: 12 },
	},

	edit: EditBlock,

	save({ attributes }) {
		return (
			<div
				id="marketplace-products"
				data-attributes={JSON.stringify(attributes)}
			></div>
		);
	},
});

// Render on frontend
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('marketplace-products');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);
		render(
			<BrowserRouter>
				<MarketplaceProductList {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});
