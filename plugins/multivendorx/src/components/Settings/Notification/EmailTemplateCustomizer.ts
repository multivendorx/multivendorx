import { __ } from '@wordpress/i18n';
import { temp1 } from '../../../assets/template/emailTemplate/temp1';
import { temp2 } from '../../../assets/template/emailTemplate/temp2';

export default {
	id: 'email-template-customizer',
	priority: 3,
	headerTitle: __('Email Template Customizer', 'multivendorx'),
	headerDescription: __(
		'Edit and manage individual email templates used across the marketplace.',
		'multivendorx'
	),
	headerIcon: 'search-discovery',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_registration_from',
			type: 'block-builder',
			classes: 'full-width',
			// desc: 'Customise personalised store registration form for marketplace.',
			// // Add templates configuration with proper content
			emailTemplates: [temp1, temp2],
			visibleGroups: ['email'],
			defaultTemplateId: 'store-registration',
			context: 'email',
		},
	],
};
