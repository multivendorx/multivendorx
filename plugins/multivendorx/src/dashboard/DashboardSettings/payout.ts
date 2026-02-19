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
	key: string;
	label: string;
	fields?: PaymentField[];
}

interface StorePaymentConfig {
	[key: string]: PaymentProvider;
}

const storePayment: StorePaymentConfig =
		(appLocalizer.store_payment_settings as StorePaymentConfig) || {};

console.log('StorePayment:', storePayment);

const filteredStorePayment = Object.fromEntries(
	Object.entries(storePayment).filter(([_, value]) => value !== null)
);

const paymentOptions = Object.values(filteredStorePayment).map((p) => ({
	key: p.key,
	value: p.key,
	label: p.label,
}));

console.log('Payment Options:', paymentOptions);

const selectedProvider = storePayment[paymentOptions[2]?.key];
console.log('Selected Provider:', selectedProvider);
console.log('Selected Provider Fields:', selectedProvider?.fields);

// Function to render fields based on their type
const renderPaymentFields = () => {
	if (!selectedProvider?.fields || !Array.isArray(selectedProvider.fields)) {
		return [];
	}
    console.log('Rendering fields for provider:', selectedProvider.fields);
	return selectedProvider.fields.map((field) => ({
		// Pass through all original field properties
		...field,
		// Add dependent prop to show/hide based on payment method selection
		dependent: {
			key: 'payment_method',
			value: selectedProvider.key,
		}
	}));
};

export default {
    id: 'payout',
    headerTitle: __('Payout', 'multivendorx'),
    headerDescription: __(
        'Enter your payment information and select the method you’d like to use for receiving store payouts.',
        'multivendorx'
    ),
    headerIcon: 'wallet-open',
	
    modal: [
        {
            key: 'payment_method',
            type: 'setting-toggle',
            label: __('Payment Method', 'multivendorx'),
            options: paymentOptions,
        },
        ...renderPaymentFields()
    ],
};