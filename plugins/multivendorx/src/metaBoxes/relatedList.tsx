import { addFilter } from '@wordpress/hooks';
import { BasicInputUI, Card, FormGroup, FormGroupWrapper, MultiCheckBoxUI } from 'zyra';
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RelatedList = ({ product, setProduct, handleChange }) => {
	return (
		<>
			<Card title={__('Related products - Suggest other products from your shop', 'multivendorx')} desc={__('Help customers discover more of what you sell - great for increasing your average order size.', 'multivendorx')}>
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
			<Card title={__('Availability settings', 'multivendorx')} desc={__('Control when this bookable product can be reserved', 'multivendorx')}>
				<FormGroupWrapper>
					<FormGroup cols={2} label={__('Affiliate Rate Type', 'multivendorx')} desc={__('Maximum simultaneous bookings allowed per time block', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} label={__('Affiliate Rate', 'multivendorx')} desc={__('Maximum simultaneous bookings allowed per time block', 'multivendorx')}>
						<BasicInputUI
							name="name"
						// value={product.name}
						// onChange={(value) => handleChange('name', value)}
						/>
					</FormGroup>
					<FormGroup cols={2} row label={__('Disable referrale', 'multivendorx')} desc={__('By default the buffer period applies forward into the future of a booking. Enable this to apply the buffer both before and after each booking.', 'multivendorx')}>
						<div className="toggle-checkbox">
							<MultiCheckBoxUI
								type="checkbox"
								look="toggle"
								// value={trialEnabled}
								// onChange={(value) => {
								// 	setTrialEnabled(value);
								// }}
								options={[
									{ key: 'trial', value: 'trial', },
								]}
							/>
						</div>
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