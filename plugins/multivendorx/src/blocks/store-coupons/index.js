import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import StoreCouponList from './StoreCouponList';

registerBlockType('multivendorx/store-coupons', {
	apiVersion: 2,
	title: __('Store Coupons', 'multivendorx'),
	icon: 'tickets-alt',
	category: 'multivendorx',

	attributes: {
		store_id: { type: 'string', default: '' },
		store_slug: { type: 'string', default: '' },
		perPage: { type: 'number', default: 10 },
		orderby: { type: 'string', default: 'date' },
		order: { type: 'string', default: 'DESC' },
	},

	edit({ attributes, setAttributes }) {
		const blockProps = useBlockProps();

		return (
			<div {...blockProps}>
				<InspectorControls>
					<PanelBody
						title={__('Coupon Settings', 'multivendorx')}
						initialOpen={true}
					>
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

				<StoreCouponList isEditor={true} {...attributes} />
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

/*
Frontend renderer
Better pattern: hydrate React component from dataset attribute.
*/

document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('store-coupons');

	if (!element) return;

	let attributes = {};

	try {
		attributes = JSON.parse(
			element.dataset.attributes || '{}'
		);
	} catch (e) {
		console.error('Failed to parse block attributes', e);
	}

	render(
		<BrowserRouter>
			<StoreCouponList {...attributes} />
		</BrowserRouter>,
		element
	);
});