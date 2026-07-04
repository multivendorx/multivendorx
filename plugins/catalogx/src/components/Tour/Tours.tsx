import { __ } from '@wordpress/i18n';

interface AppLocalizer {
	site_url: string;
	admin_url?: string;
	apiUrl?: string;
	nonce?: string;
	[key: string]: unknown;
}

interface TourStep {
	selector: string;
	placement: string;
	title: string;
	description: string;
	next?: {
		link: string;
		step: number;
	};
	finish?: boolean;
}

export const getTourSteps = (appLocalizer: AppLocalizer): TourStep[] => [
	{
		selector: '.card-content',
		placement: 'auto',
		title: __('Dashboard', 'catalogx'),
		description: __(
			'Get an overview of your CatalogX modules, settings, and recent activity from one place.',
			'catalogx'
		),
		next: {
			link: `${appLocalizer.admin_url}#&tab=modules`,
			step: 1,
		},
	},
	{
		selector: '[data-tour="enquiry-showcase-tour"]',
		placement: 'right',
		title: __('Enquiry & Communication', 'catalogx'),
		description: __(
			'Enable the Enquiry & Communication module to let customers submit product enquiries directly from your store.',
			'catalogx'
		),
		next: {
			link: `${appLocalizer.admin_url}#&tab=settings&subtab=customer-engagement`,
			step: 2,
		},
	},
	{
		selector: '.form-group:has(.settings-form-label[for="enquiry_user_permission"])',
		placement: 'right',
		title: __('Customer Engagement Settings', 'catalogx'),
		description: __(
			'Configure who can submit product enquiries and customize the enquiry experience for your customers.',
			'catalogx'
		),
		next: {
			link: `${appLocalizer.admin_url}#&tab=modules`,
			step: 3,
		},
	},
	{
		selector: '[data-tour="quote-showcase-tour"]',
		placement: 'right',
		title: __('Modules', 'catalogx'),
		description: __(
			'Enable the Quotation module to let customers request custom quotations for products and manage quote requests from your store.',
			'catalogx'
		),
		next: {
			link: `${appLocalizer.admin_url}#&tab=settings&subtab=customer-engagement`,
			step: 4,
		},
	},
	{
		selector: '.form-group:has(.settings-form-label[for="quote_user_permission"])',
		placement: 'right',
		title: __('Quotation Settings', 'catalogx'),
		description: __(
			'Configure who can request quotations and customize how quotation requests are handled in your store.',
			'catalogx'
		),
	},
];
