import { addFilter } from '@wordpress/hooks';
import { BasicInputUI, Card, FormGroup, FormGroupWrapper } from 'zyra';
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RelatedList = ({ product, setProduct, handleChange }) => {
	return (
		<Card title={__('Related products', 'multivendorx')} desc={__('Suggest other items to help customers discover more of your store.', 'multivendorx')}>
			<FormGroupWrapper>
				<FormGroup cols={2} label={__('Recommend alongside this product', 'multivendorx')} desc={__('Shown as "You might also like" on the product page.', 'multivendorx')}>
					<BasicInputUI
						name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
					/>
				</FormGroup>
				<FormGroup cols={2} label={__('Offer as an add-on at checkout', 'multivendorx')} desc={__('Suggested when a customer adds this item to their cart.', 'multivendorx')}>
					<BasicInputUI
						name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
					/>
				</FormGroup>
			</FormGroupWrapper>
		</Card>
	);
};

addFilter(
	'multivendorx_add_product_middle_section',
	'multivendorx/related_list',
	(content, product, setProduct, handleChange, productFields) => {
		return (
			<>
				{content}
				{productFields.includes('linked_product') && (
					<RelatedList
						product={product}
						setProduct={setProduct}
						handleChange={handleChange}
					/>
				)}
			</>
		);
	},
	40
);