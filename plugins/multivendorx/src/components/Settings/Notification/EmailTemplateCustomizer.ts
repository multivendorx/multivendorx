import { __ } from '@wordpress/i18n';
import { salesReport } from '../../../assets/template/emailTemplate/salesReport';

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
			key: 'email_templates',
			type: 'builderform-email',
			classes: 'full-width',
			emailTemplates: [salesReport],
			defaultTemplateId: 'store-registration',
		},
	],
};
