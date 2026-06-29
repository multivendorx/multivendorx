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
			'View and configure your disbursement settings here.',
			'catalogx'
		),
		next: {
			link: `${appLocalizer.admin_url}#&tab=modules`,
			step: 1,
		},
	},
	{
		selector: '[data-tour="simple-showcase-tour"]',
		placement: 'right',
		title: __('Modules', 'multivendorx'),
		description: __(
			'Here you can enable or disable marketplace modules.',
			'multivendorx'
		),
		next: {
			link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=payouts`,
			step: 2,
		},
	},
];
