import { addFilter } from '@wordpress/hooks';
import {
	BasicInputUI,
	Card,
	FormGroup,
	FormGroupWrapper,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const RelatedList = ({ product, setProduct, handleChange }) => {

	return (
		<Card
			contentHeight
			title={__('Related listings', 'multivendorx')}
		>
			<FormGroupWrapper>
				<FormGroup
					cols={2}
					label={__('Upsells', 'multivendorx')}
				>
					<BasicInputUI
						name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
					/>
				</FormGroup>
				<FormGroup
					cols={2}
					label={__('Cross-sells', 'multivendorx')}
				>
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
	'multivendorx_product_after_price_section',
	'multivendorx/related_list',
	(content, product, setProduct, handleChange) => {
		return (
			<>
				{content}
				<RelatedList product={product} setProduct={setProduct} handleChange={handleChange} />
			</>
		);
	},
	10
);
