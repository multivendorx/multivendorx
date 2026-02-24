import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreCouponList from './StoreCouponList';
import { __ } from '@wordpress/i18n';

registerBlockType('multivendorx/marketplace-coupons', {
	apiVersion: 2,
	title: 'Store Coupons',
	icon: 'tickets-alt',
	category: 'multivendorx',

	attributes: {
		store_id: {
			type: 'string',
			default: '',
		},
		store_slug: {
			type: 'string',
			default: '',
		},
		perPage: {
			type: 'number',
			default: 10,
		},
		orderby: {
			type: 'string',
			default: 'date',
		},
		order: {
			type: 'string',
			default: 'DESC',
		},
	},

edit({ attributes, setAttributes }) {
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__('Coupon Settings', 'multivendorx')} initialOpen={true}>
					<TextControl
						label={__('Store ID', 'multivendorx')}
						value={attributes.store_id}
						onChange={(value) =>
							setAttributes({ store_id: value })
						}
					/>

					<TextControl
						label={__('Store Slug', 'multivendorx')}
						value={attributes.store_slug}
						onChange={(value) =>
							setAttributes({ store_slug: value })
						}
					/>

					<TextControl
						label={__('Coupons Per Page', 'multivendorx')}
						type="number"
						value={attributes.perPage}
						onChange={(value) =>
							setAttributes({
								perPage: parseInt(value, 10) || 10,
							})
						}
					/>

					<TextControl
						label={__('Order By', 'multivendorx')}
						help={__('date, id, title, code, modified', 'multivendorx')}
						value={attributes.orderby}
						onChange={(value) =>
							setAttributes({ orderby: value })
						}
					/>

					<TextControl
						label={__('Order', 'multivendorx')}
						help={__('ASC or DESC', 'multivendorx')}
						value={attributes.order}
						onChange={(value) =>
							setAttributes({ order: value })
						}
					/>
				</PanelBody>
			</InspectorControls>

			<StoreCouponList {...attributes} />
		</div>
	);
},

	save({ attributes }) {
		return (
			<div
				id="marketplace-coupons"
				data-attributes={JSON.stringify(attributes)}
			/>
		);
	},
});

// Frontend render
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('marketplace-coupons');

	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);

		render(
			<BrowserRouter>
				<StoreCouponList {...attributes} />
			</BrowserRouter>,
			element
		);
	}
});
