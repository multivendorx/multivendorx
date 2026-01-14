import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreCouponList from './StoreCouponList';

registerBlockType('multivendorx/store-coupons', {
	apiVersion: 2,
	title: 'Store Coupons(w)',
	icon: 'tickets-alt',
	category: 'widgets',

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
					<PanelBody title="Coupon Settings" initialOpen={true}>
						<TextControl
							label="Store ID"
							value={attributes.store_id}
							onChange={(value) =>
								setAttributes({ store_id: value })
							}
						/>

						<TextControl
							label="Store Slug"
							value={attributes.store_slug}
							onChange={(value) =>
								setAttributes({ store_slug: value })
							}
						/>

						<TextControl
							label="Coupons Per Page"
							type="number"
							value={attributes.perPage}
							onChange={(value) =>
								setAttributes({ perPage: parseInt(value, 10) || 10 })
							}
						/>

						<TextControl
							label="Order By"
							help="date, id, title, code, modified"
							value={attributes.orderby}
							onChange={(value) =>
								setAttributes({ orderby: value })
							}
						/>

						<TextControl
							label="Order"
							help="ASC or DESC"
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
				id="store-coupons"
				data-attributes={JSON.stringify(attributes)}
			/>
		);
	},
});

// Frontend render
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('store-coupons');

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
