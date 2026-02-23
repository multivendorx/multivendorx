import { addFilter } from '@wordpress/hooks';
import { useEffect } from 'react';
import {
	TextAreaUI,
	Card,
	FormGroup,
	FormGroupWrapper,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const Policies = ({ product, setProduct, handleChange }) => {
	const getMetaValue = (meta, key) =>
			meta?.find((m) => m.key === key)?.value || '';
	
	useEffect(() => {
		if (!product?.meta_data) {
			return;
		}

		setProduct((prev) => ({
			...prev,
			shipping_policy: getMetaValue(
				product.meta_data,
				'multivendorx_shipping_policy'
			),
			refund_policy: getMetaValue(
				product.meta_data,
				'multivendorx_refund_policy'
			),
			cancellation_policy: getMetaValue(
				product.meta_data,
				'multivendorx_cancellation_policy'
			),
		}));
	}, [product?.meta_data]);

	return (
		<Card contentHeight title={__('Policies', 'multivendorx')}>
			<FormGroupWrapper>
				<FormGroup
					label={__('Shipping Policy', 'multivendorx')}
				>
					<TextAreaUI
						name="shipping_policy"
						value={product.shipping_policy}
						onChange={(value) =>
							handleChange('shipping_policy', value)
						}
					/>
				</FormGroup>
				<FormGroup
					label={__('Refund Policy', 'multivendorx')}
				>
					<TextAreaUI
						name="refund_policy"
						value={product.refund_policy}
						onChange={(value) =>
							handleChange('refund_policy', value)
						}
					/>
				</FormGroup>
				<FormGroup
					label={__(
						'Cancellation Policy',
						'multivendorx'
					)}
				>
					<TextAreaUI
						name="cancellation_policy"
						value={product.cancellation_policy}
						onChange={(value) =>
							handleChange(
								'cancellation_policy',
								value
							)
						}
					/>
				</FormGroup>
			</FormGroupWrapper>
		</Card>
	);
};

addFilter(
	'product_policies',
	'multivendorx/policies',
	(content, product, setProduct, handleChange) => {
		return (
			<>
				{content}
				<Policies product={product} setProduct={setProduct} handleChange={handleChange} />
			</>
		);
	},
	10
);
