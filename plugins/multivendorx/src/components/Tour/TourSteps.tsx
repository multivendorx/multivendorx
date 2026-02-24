import { __ } from '@wordpress/i18n';

export const getTourSteps = (appLocalizer: any) => [
	{
		selector: '.card-content',
		placement: 'auto',
		content: () => ({
			title: __('Dashboard', 'multivendorx'),
			description: __('View and configure your disbursement settings here.', 'multivendorx'),
			nextBtn: {
				link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=overview`,
				step: 1
			}
		}),
	},
	{
		selector: '.form-group:has(.settings-form-label[for="approve_store"])',
		placement: 'right',
		content: () => ({
			title: __('Store Configure', 'multivendorx'),
			description: __('View and configure your disbursement settings here.', 'multivendorx'),
			nextBtn: {
				link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
				step: 2
			}
		}),
	},
	{
		selector: '.form-group:has(.settings-form-label[for="commission_type"])',
		placement: 'right',
		content: () => ({
			title: __('Marketplace commissions', 'multivendorx'),
			description: __('View and configure your disbursement settings here.', 'multivendorx'),
			nextBtn: {
				link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
				step: 3
			}
		}),
	},
	{
		selector: '.form-group:has(.settings-form-label[for="commission_per_store_order"])',
		placement: 'right',
		content: () => ({
			title: __('Commission Value', 'multivendorx'),
			description: __('View and configure your disbursement settings here.', 'multivendorx'),
			nextBtn: {
				link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=disbursement`,
				step: 4
			}
		}),
	},
	{
		selector: '.form-group:has(.settings-form-label[for="disbursement_order_status"])',
		placement: 'right',
		content: () => ({
			title: __('Order Status', 'multivendorx'),
			description: __('View and configure your disbursement settings here.', 'multivendorx'),
			nextBtn: {
				link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
				step: 5
			}
		}),
	},
	{
		selector: '[data-tour="appointment-showcase-tour"]',
		placement: 'auto',
		content: () => ({
			title: __('Modules', 'multivendorx'),
			description: __('Here you can enable or disable marketplace modules.', 'multivendorx'),
			finishBtn: true
		}),
	},
];