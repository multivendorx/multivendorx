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
			link: `${appLocalizer.site_url}/wp-admin/admin.php?page=catalogx#&tab=settings&subtab=commissions`,
			step: 1,
		},
	},
];
