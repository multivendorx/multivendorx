import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { createRoot, useEffect, useState } from '@wordpress/element';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import MarketplaceProductList from './marketplaceProductList';
import { getApiLink } from 'zyra';
import axios from 'axios';

// EditBlock Component
const EditBlock = (props) => {
	const { attributes, setAttributes } = props;
	const blockProps = useBlockProps({
		className: 'marketplace-products-edit',
	});
	const [stores, setStores] = useState([]);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(productList, 'store'),
			headers: { 'X-WP-Nonce': productList.nonce },
			params: { options: true },
		})
			.then((response) => {
				setStores(response.data || []);
			})
			.catch(() => {
				setStores([]);
			});
	}, []);

	const storeOptions = [
		{ label: __('Select Store', 'multivendorx'), value: 0 },
		...stores.map((store) => ({
			label: store.store_name,
			value: store.id,
		})),
	];
	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title="Product Filters" initialOpen={true}>
					<SelectControl
						label={__('Select Store', 'multivendorx')}
						value={attributes.storeId}
						options={storeOptions}
						onChange={(value) =>
							setAttributes({
								storeId: parseInt(value, 10),
							})
						}
					/>
					<SelectControl
						label="Sort by"
						value={attributes.orderby}
						options={[
							{
								label: __('Popularity', 'multivendorx'),
								value: 'popularity',
							},
							{
								label: __('Recent', 'multivendorx'),
								value: 'recent',
							},
							{
								label: __('By Rating', 'multivendorx'),
								value: 'rating',
							},
							{
								label: __('By Price', 'multivendorx'),
								value: 'price',
							},
							{
								label: __('On Sale', 'multivendorx'),
								value: 'on_sale',
							},
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
								perPage: parseInt(value, 10) || 5,
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
		perPage: { type: 'number', default: 5 },
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
window.addEventListener('load', () => {
	const element = document.getElementById('marketplace-products');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);
		const root = createRoot(element);
		root.render(<MarketplaceProductList {...attributes} />);
	}
});
