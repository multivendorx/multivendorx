import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { initializeModules } from 'zyra';
import MarketplaceProductList from './marketplaceProductList';

// Initialize ZYRA modules
initializeModules(productList, 'multivendorx', 'free', 'modules');

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
						label="Category (slug, comma-separated)"
						value={attributes.category}
						onChange={(value) => setAttributes({ category: value })}
					/>
					<TextControl
						label="Store ID"
						value={attributes.store_id || ''}
						onChange={(value) => setAttributes({ store_id: value })}
					/>
					<TextControl
						label="Store Slug"
						value={attributes.store_slug || ''}
						onChange={(value) => setAttributes({ store_slug: value })}
					/>
					<TextControl
						label="Products per page"
						type="number"
						min={1}
						value={attributes.perPage}
						onChange={(value) =>
							setAttributes({ perPage: parseInt(value, 10) || 12 })
						}
					/>
				</PanelBody>
			</InspectorControls>

			{/* Render the Product List with attributes */}
			<MarketplaceProductList
				orderby={attributes.orderby}
				order={attributes.order}
				category={attributes.category}
				store_id={attributes.store_id}
				store_slug={attributes.store_slug}
				perPage={attributes.perPage}
			/>
		</div>
	);
};

// Register the Block
registerBlockType('multivendorx/store-products', {
	apiVersion: 2,
	title: 'Product List(w)',
	icon: 'products',
	category: 'widgets',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'title' },
		order: { type: 'string', default: 'asc' },
		category: { type: 'string', default: '' },
		perPage: { type: 'number', default: 12 },
		store_id: { type: 'string', default: '' },
		store_slug: { type: 'string', default: '' },
	},

	edit: EditBlock,

	save({ attributes }) {
		return (
			<div
				id="store-products"
				data-attributes={JSON.stringify(attributes)}
			></div>
		);
	},
});

// Render on frontend
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('store-products');
	if (element) {
		const attributes = JSON.parse(element.getAttribute('data-attributes') || '{}');
		render(
			<BrowserRouter>
				<MarketplaceProductList {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});
