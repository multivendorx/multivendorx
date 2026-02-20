import { __ } from '@wordpress/i18n';

interface PaymentField {
	publish?: any;
	client_secret?: any;
	key: string | number;
	action?: string;
	html?: string | TrustedHTML;
	name?: string;
	type?: string;
	label: string;
	placeholder?: string;
	options?: Array<{ key: string; label: string; value: string }>; // For setting-toggle type
}

interface PaymentProvider {
	id: string;
	label: string;
	fields?: PaymentField[];
}

interface StorePaymentConfig {
	[id: string]: PaymentProvider;
}

const storePayment: StorePaymentConfig =
	(appLocalizer.store_payment_settings as StorePaymentConfig) || {};

console.log('StorePayment:', storePayment);

const filteredStorePayment = Object.fromEntries(
	Object.entries(storePayment).filter(([_, value]) => value !== null)
);

const paymentOptions = Object.values(filteredStorePayment).map((p) => ({
	id: p.id,
	value: p.id,
	label: p.label,
}));

console.log('Payment Options:', paymentOptions);

// Generate all payment fields for all providers with conditions
const generateAllPaymentFields = () => {
	const allFields: PaymentField[] = [];
	
	Object.values(filteredStorePayment).forEach((provider) => {
		if (provider.fields && Array.isArray(provider.fields)) {
			const providerFields = provider.fields.map((field) => ({
				...field,
				key: `${provider.id}_${field.key}`, // Make key unique by prefixing with provider ID
				dependent: {
					key: 'payment_method',
					value: provider.id, // Only show when this payment method is selected
				},
			}));
			allFields.push(...providerFields);
		}
	});
	
	console.log('All generated fields:', allFields);
	return allFields;
};

export default {
	id: 'payout',
	priority: 7,
	headerTitle: __('Payout', 'multivendorx'),
	headerDescription: __(
		'Enter your payment information and select the method you’d like to use for receiving store payouts.',
		'multivendorx'
	),
	headerIcon: 'wallet-open',
	submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
		{
			key: 'payment_method',
			type: 'setting-toggle',
			label: __('Payment Method', 'multivendorx'),
			options: paymentOptions, // Use paymentOptions directly, not with nested fields
		},
		...generateAllPaymentFields(), // Spread all fields at root level with conditions
	],
};