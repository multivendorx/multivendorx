import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import MarketplaceStoreList from './marketplaceStoreList';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { initializeModules } from 'zyra';

initializeModules(storesList, 'multivendorx', 'free', 'modules');

const EditBlock = (props) => {
	const { attributes, setAttributes } = props;
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title="Store Filters">
					<SelectControl
						label="Sort by"
						value={attributes.orderby}
						options={[
							{ label: 'Name', value: 'name' },
							{ label: 'Category', value: 'category' },
							{ label: 'Registered', value: 'create-time' },
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
						label="Category"
						value={attributes.category}
						onChange={(value) => setAttributes({ category: value })}
					/>
					<TextControl
						label="per page"
						type="number"
						min={1}
						value={attributes.perpage}
						onChange={(value) =>
							setAttributes({ perpage: parseInt(value, 12) || 12 })
						}
					/>
				</PanelBody>
			</InspectorControls>


			{/* Pass attributes to StoresList */}
			<MarketplaceStoreList
				orderby={attributes.orderby}
				order={attributes.order}
				category={attributes.category}
			/>
		</div>
	);
};

registerBlockType('multivendorx/stores', {
	apiVersion: 2,
	title: 'Stores List(w)',
	icon: 'store',
	category: 'widgets',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'name' },
		order: { type: 'string', default: 'asc' },
		category: { type: 'string', default: '' },
		perpage: { type: 'number', default: 12 },
	},

	edit: EditBlock,

	save({ attributes }) {
		return <div id="stores" data-attributes={JSON.stringify(attributes)}></div>;
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('stores');
	if (element) {
		const attributes = JSON.parse(element.getAttribute('data-attributes') || '{}');
		render(
			<BrowserRouter>
				<MarketplaceStoreList {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});
