import { __ } from '@wordpress/i18n';

export default {
	id: 'active',
	priority: 1,
	name: __('Active', 'multivendorx'),
	desc: '',
	icon: 'adminfont-store-inventory',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_promotion_limit',
			type: 'nested',
			single: true,
			nestedFields: [
				{
					key: 'paid_promotion_limit',
					type: 'button',
					name: __('Configure store permissions', 'multivendorx'),
					desc: __(
						'Control what dashboard sections and tools are available to active stores.',
						'multivendorx'
					),
					link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-permissions`,
				},
			],
		},
	],
};
