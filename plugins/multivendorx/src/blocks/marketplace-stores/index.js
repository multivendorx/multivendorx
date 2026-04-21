import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { createRoot } from '@wordpress/element';
import MarketplaceStoreList from './marketplaceStoreList';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components'; // Add ToggleControl
import { __ } from '@wordpress/i18n';

const EditBlock = (props) => {
	const { attributes, setAttributes } = props;
	const blockProps = useBlockProps({
		className: 'stores-list-edit-panel',
	});

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__('Store Filters', 'multivendorx')}>
					<SelectControl
						label={__('Sort by', 'multivendorx')}
						value={attributes.orderby}
						options={[
							{
								label: __('Name', 'multivendorx'),
								value: 'name',
							},
							{
								label: __('Category', 'multivendorx'),
								value: 'category',
							},
							{
								label: __('Registered', 'multivendorx'),
								value: 'create-time',
							},
						]}
						onChange={(value) => setAttributes({ orderby: value })}
					/>

					<SelectControl
						label={__('Order', 'multivendorx')}
						value={attributes.order}
						options={[
							{
								label: __('Ascending', 'multivendorx'),
								value: 'asc',
							},
							{
								label: __('Descending', 'multivendorx'),
								value: 'desc',
							},
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
								perpage: parseInt(value, 12) || 5,
							})
						}
					/>

					<ToggleControl
						label={__('Show Map', 'multivendorx')}
						help={
							attributes.showMap
								? __('Map is visible', 'multivendorx')
								: __('Map is hidden', 'multivendorx')
						}
						checked={attributes.showMap}
						onChange={(value) => setAttributes({ showMap: value })}
					/>
				</PanelBody>
			</InspectorControls>

			<MarketplaceStoreList
				orderby={attributes.orderby}
				order={attributes.order}
				perpage={attributes.perpage}
			/>
		</div>
	);
};

registerBlockType('multivendorx/marketplace-stores', {
	apiVersion: 2,
	title: __('Stores List', 'multivendorx'),
	icon: 'store',
	category: 'multivendorx-shortcodes',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'name' },
		order: { type: 'string', default: 'asc' },
		category: { type: 'string', default: '' },
		perpage: { type: 'number', default: 5 },
		showMap: { type: 'boolean', default: true },
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

window.addEventListener('load', () => {
	const element = document.getElementById('marketplace-stores');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);
		const root = createRoot(element);
		root.render(<MarketplaceStoreList {...attributes} />);
	}
});
