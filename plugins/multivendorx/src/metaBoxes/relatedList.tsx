import { addFilter } from '@wordpress/hooks';
import {
	BasicInputUI,
	Card,
	FormGroup,
	FormGroupWrapper,
} from 'zyra';
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RelatedList = ({ product, setProduct, handleChange }) => {
	return (
		<>
			<Card
				title={__(
					'Related products - Suggest other products from your shop',
					'multivendorx'
				)}
				desc={__(
					'Help customers discover more of what you sell - great for increasing your average order size.',
					'multivendorx'
				)}
			>
				<FormGroupWrapper>
					<FormGroup
						cols={6}
						label={__(
							'Recommend alongside this product',
							'multivendorx'
						)}
						desc={__(
							'Shown as "You might also like" on the product page.',
							'multivendorx'
						)}
					>
						<BasicInputUI
							name="name"
							// value={product.name}
							// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup
						cols={6}
						label={__(
							'Offer as an add-on at checkout',
							'multivendorx'
						)}
						desc={__(
							'Suggested when a customer adds this item to their cart.',
							'multivendorx'
						)}
					>
						<BasicInputUI
							name="name"
							// value={product.name}
							// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
				</FormGroupWrapper>
			</Card>
		</>
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
