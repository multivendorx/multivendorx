import { addFilter } from '@wordpress/hooks';
import { useEffect } from 'react';
import { TextAreaUI, Card, FormGroup, FormGroupWrapper } from 'zyra';
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
		<Card title={__('Policies - What should customers know before they buy?', 'multivendorx')} desc={__('Being upfront about shipping, returns, and cancellations builds trust and reduces disputes later.', 'multivendorx')}>
			<FormGroupWrapper>
				<FormGroup label={__('Shipping policy - How will you ship it and how long will it take?', 'multivendorx')}>
					<TextAreaUI
						name="shipping_policy"
						value={product.shipping_policy}
						onChange={(value) =>
							handleChange('shipping_policy', value)
						}
					/>
				</FormGroup>
				<FormGroup label={__('Refund policy - Can customers return or exchange it?', 'multivendorx')}>
					<TextAreaUI
						name="refund_policy"
						value={product.refund_policy}
						onChange={(value) =>
							handleChange('refund_policy', value)
						}
					/>
				</FormGroup>
				<FormGroup label={__('Cancellation policy - Can they cancel their order after placing it?', 'multivendorx')}>
					<TextAreaUI
						name="cancellation_policy"
						value={product.cancellation_policy}
						onChange={(value) =>
							handleChange('cancellation_policy', value)
						}
					/>
				</FormGroup>
			</FormGroupWrapper>
		</Card>
	);
};

addFilter(
	'multivendorx_add_product_middle_section',
	'multivendorx/policies',
	(content, product, setProduct, handleChange, productFields) => {
		return (
			<>
				{content}
				{productFields.includes('policies') && (
					<Policies
						product={product}
						setProduct={setProduct}
						handleChange={handleChange}
					/>
				)}
			</>
		);
	},
	30
);
