import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import MarketplaceStoreList from './marketplaceStoreList';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const EditBlock = (props) => {
	const { attributes, setAttributes } = props;
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__('Store Filters', 'multivendorx')}>
					<SelectControl
						label={__('Sort by', 'multivendorx')}
						value={attributes.orderby}
						options={[
							{ label: __('Name', 'multivendorx'), value: 'name' },
							{ label: __('Category', 'multivendorx'), value: 'category' },
							{ label: __('Registered', 'multivendorx'), value: 'create-time' },
						]}
						onChange={(value) => setAttributes({ orderby: value })}
					/>

					<SelectControl
						label={__('Order', 'multivendorx')}
						value={attributes.order}
						options={[
							{ label: __('Ascending', 'multivendorx'), value: 'asc' },
							{ label: __('Descending', 'multivendorx'), value: 'desc' },
						]}
						onChange={(value) => setAttributes({ order: value })}
					/>

					<TextControl
						label={__('Category', 'multivendorx')}
						value={attributes.category}
						onChange={(value) => setAttributes({ category: value })}
					/>

					<TextControl
						label={__('Per page', 'multivendorx')}
						type="number"
						min={1}
						value={attributes.perpage}
						onChange={(value) =>
							setAttributes({
								perpage: parseInt(value, 12) || 12,
							})
						}
					/>
				</PanelBody>
			</InspectorControls>

			<MarketplaceStoreList
				orderby={attributes.orderby}
				order={attributes.order}
				category={attributes.category}
			/>
		</div>
	);
};

registerBlockType('multivendorx/marketplace-stores', {
	apiVersion: 2,
	title: __('Stores List', 'multivendorx'),
	icon: 'store',
	category: 'multivendorx',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'name' },
		order: { type: 'string', default: 'asc' },
		category: { type: 'string', default: '' },
		perpage: { type: 'number', default: 12 },
	},

	edit: EditBlock,

	save({ attributes }) {
		return (
			<div
				id="marketplace-stores"
				data-attributes={JSON.stringify(attributes)}
			></div>
		);
	},
});
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('marketplace-stores');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);
		render(
			<BrowserRouter>
				<MarketplaceStoreList {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});
