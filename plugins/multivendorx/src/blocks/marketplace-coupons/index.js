import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
} from '@wordpress/components';
import { createRoot, useEffect, useState } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreCouponList from './StoreCouponList';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from 'zyra';

/* global couponList */

registerBlockType('multivendorx/marketplace-coupons', {
	apiVersion: 2,
	title: __('Store Coupons', 'multivendorx'),
	icon: 'tickets-alt',
	category: 'multivendorx',

	attributes: {
		perPage: {
			type: 'number',
			default: 5,
		},
		orderby: {
			type: 'string',
			default: 'date',
		},
		order: {
			type: 'string',
			default: 'DESC',
		},
		storeId: {
			type: 'number',
			default: 0,
		},
	},

	edit({ attributes, setAttributes }) {
		const blockProps = useBlockProps();
		const [stores, setStores] = useState([]);

		useEffect(() => {
			axios({
				method: 'GET',
				url: getApiLink(couponList, 'store'),
				headers: { 'X-WP-Nonce': couponList.nonce },
				params: {options:true},
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
					<PanelBody
						title={__('Coupon Settings', 'multivendorx')}
						initialOpen={true}
					>
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

						<TextControl
							label={__('Coupons Per Page', 'multivendorx')}
							type="number"
							value={attributes.perPage}
							onChange={(value) =>
								setAttributes({
									perPage: parseInt(value, 10) || 5,
								})
							}
						/>

						<SelectControl
							label={__('Order By', 'multivendorx')}
							value={attributes.orderby}
							options={[
								{
									label: __('Date', 'multivendorx'),
									value: 'date',
								},
								{
									label: __('ID', 'multivendorx'),
									value: 'id',
								},
								{
									label: __('Title', 'multivendorx'),
									value: 'title',
								},
								{
									label: __('Code', 'multivendorx'),
									value: 'code',
								},
								{
									label: __('Modified', 'multivendorx'),
									value: 'modified',
								},
							]}
							onChange={(value) =>
								setAttributes({ orderby: value })
							}
						/>

						<SelectControl
							label={__('Order', 'multivendorx')}
							value={attributes.order}
							options={[
								{
									label: __('Descending', 'multivendorx'),
									value: 'DESC',
								},
								{
									label: __('Ascending', 'multivendorx'),
									value: 'ASC',
								},
							]}
							onChange={(value) =>
								setAttributes({ order: value })
							}
						/>
					</PanelBody>
				</InspectorControls>

				<BrowserRouter>
					<StoreCouponList
						{...attributes}
						storeId={attributes.storeId}
						isPreview={true}
					/>
				</BrowserRouter>
			</div>
		);
	},

	save({ attributes }) {
		const blockProps = useBlockProps.save();

		return (
			<div
				{...blockProps}
				id="marketplace-coupons"
				data-attributes={JSON.stringify(attributes)}
			></div>
		);
	},
});

window.addEventListener('load', () => {
	const elements = document.querySelectorAll('#marketplace-coupons');

	elements.forEach((element) => {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);

		const root = createRoot(element);
		root.render(<StoreCouponList {...attributes} />);
	});
});