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
		([, value]) =>
			value !== null && (!Array.isArray(value) || value.length > 0)
	)
);

// Map a provider's own fields into panel form fields, translating the
// 'embedded' type into a rendered component the same way the old flat field
// list did.
const toPanelFields = (provider: PaymentProvider): PaymentField[] =>
	(provider.fields ?? []).map((field) => {
		const key = `${field.key}`;

		if (field.type === 'embedded') {
			return {
				...field,
				key,
				component: React.createElement(StripeEmbeddedOnboarding, {
					publishableKey: field.publish,
					clientSecret: field.client_secret,
					onComplete: () => {
						window.location.reload();
					},
				}),
			};
		}

		return {
			...field,
			key,
		};
	});

const paymentAddNewOptions = Object.values(filteredStorePayment).map(
	(provider) => ({
		value: provider.id,
		label: provider.label,
		template: {
			label: provider.label,
			formFields: toPanelFields(provider),
		},
	})
);

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
			key: 'payment_methods',
			type: 'expandable-panel',
			label: __('Payment Method', 'multivendorx'),
			settingDescription: __(
				'Choose the payment method you want to use for receiving store payouts.',
				'multivendorx'
			),
			modal: [],
			addNewBtn: true,
			addNewOptions: paymentAddNewOptions,
			addNewTemplate: {
				showPrimaryCheckbox: true,
				editableFields: {
					title: false,
					description: false,
				},
			},
		},
	],
};
