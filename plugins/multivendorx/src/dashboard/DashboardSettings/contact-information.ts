/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import { CountryCodes } from 'zyra';

const settings =
	appLocalizer.settings_databases_value['store-permissions']
		?.edit_store_info_activation || [];

export default {
	id: 'contact-information',
	priority: 6,
	headerTitle: __('Contact Information', 'multivendorx'),
	headerDescription: __(
		'Add your store’s contact details so customers can reach you easily through phone, email.',
		'multivendorx'
	),
	headerIcon: 'form-phone',
	submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
		{
			key: 'phone',
			type: 'number',
			size: '12rem',
			label: __('Phone', 'multivendorx'),
			beforeElement: {
				type: 'select',
				key: 'country_code',
				size: '10rem',
				options: CountryCodes,
			},
		},

		// Email / Additional Email
		{
			type: 'email-input',
			label: __('Email / Additional Email', 'multivendorx'),
			key: 'store_email',
			readOnly: !settings.includes('store_contact'),
		},

		// Live Chat (conditional)
		{
			type: 'text',
			label: __('Live Chat (Enable, WhatsApp, etc.)', 'multivendorx'),
			key: 'live_chat',
		},
	],
};
