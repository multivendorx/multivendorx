import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { createRoot } from '@wordpress/element';
import MarketplaceStoreList from './marketplaceStoreList';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const EditBlock = (props) => {
	const { attributes, setAttributes } = props;

	const blockProps = useBlockProps({
		className: 'stores-list-edit-panel',
	});

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__('Store Settings', 'multivendorx')}>
					<SelectControl
						label={__('Sort by', 'multivendorx')}
						value={attributes.orderby}
						options={[
							{
								label: __('Name', 'multivendorx'),
								value: 'name',
							},
							{
								label: __('Registered Date', 'multivendorx'),
								value: 'create_time',
							},
							{
								label: __('Rating', 'multivendorx'),
								value: 'rating',
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
						label={__('Per page', 'multivendorx')}
						type="number"
						min={1}
						value={attributes.perpage}
						onChange={(value) =>
							setAttributes({
								perpage: parseInt(value, 10) || 5,
							})
						}
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

registerBlockType('multivendorx/store-list', {
	apiVersion: 2,
	title: __('Store List(Widgets)', 'multivendorx'),
	icon: 'store',
	category: 'multivendorx',
	supports: { html: false },

	attributes: {
		orderby: { type: 'string', default: 'name' },
		order: { type: 'string', default: 'asc' },
		perpage: { type: 'number', default: 5 },
	},

	edit: EditBlock,

	save({ attributes }) {
		return (
			<div
				className="multivendorx-store-list"
				data-attributes={JSON.stringify(attributes)}
			></div>
		);
	},
});

window.addEventListener('load', () => {
	document.querySelectorAll('.multivendorx-store-list').forEach((element) => {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);

		const root = createRoot(element);
		root.render(<MarketplaceStoreList {...attributes} />);
	});
});
