/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import StripeEmbeddedOnboarding from './StripeEmbeddedOnboarding';
interface PaymentField {
	publish?: string;
	client_secret?: string;
	key: string | number;
	action?: string;
	html?: string | TrustedHTML;
	name?: string;
	type?: string;
	label: string;
	placeholder?: string;
	dependent?: {
		key: string;
		value: string | string[];
	};
	options?: Array<{ key: string; label: string; value: string }>; // For choice-toggle type
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

const filteredStorePayment = Object.fromEntries(
	Object.entries(storePayment).filter(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		([_, value]) =>
			value !== null && (!Array.isArray(value) || value.length > 0)
	)
);

const paymentOptions = [
	{
		key: 'all',
		value: 'all',
		label: __('All Methods', 'multivendorx'),
	},
	...Object.values(filteredStorePayment).map((p) => ({
		key: p.id,
		value: p.id,
		label: p.label,
	})),
];

// Generate all payment fields for all providers with conditions
const generateAllPaymentFields = (): PaymentField[] => {
	const allFields: PaymentField[] = [];

	Object.values(filteredStorePayment).forEach((provider) => {
		if (provider.fields && Array.isArray(provider.fields)) {
			// Show section only when "All Methods" is selected
			allFields.push({
				key: `section-${provider.id}`,
				type: 'section',
				title: provider.label,
				dependent: {
					key: 'payment_method',
					value: 'all',
				},
			} as PaymentField);

			const providerFields = provider.fields.map((field) => {
				const baseField: PaymentField = {
					...field,
					key: `${field.key}`,
					dependent: {
						key: 'payment_method',
						value: [provider.id, 'all'],
					},
				};

				if (field.type === 'embedded') {
					return {
						...baseField,
						component: React.createElement(
							StripeEmbeddedOnboarding,
							{
								publishableKey: field.publish,
								clientSecret: field.client_secret,
								onComplete: () => {
									window.location.reload();
								},
							}
						),
					};
				}

				return baseField;
			});

			allFields.push(...providerFields);
		}
	});

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
	submitUrl: `stores/${appLocalizer.store_id}`,
	modal: [
		{
			key: 'payment_method',
			type: 'choice-toggle',
			label: __('Payment Method', 'multivendorx'),
			options: paymentOptions, // Use paymentOptions directly, not with nested fields
		},
		...generateAllPaymentFields(), // Spread all fields at root level with conditions
	],
};
