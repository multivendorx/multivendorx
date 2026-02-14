// import { capitalize } from '@mui/material';
import { __ } from '@wordpress/i18n';

const columns = appLocalizer?.custom_roles
	? Object.entries(appLocalizer.custom_roles).map(([key, value]) => ({
			key,
			label: value,
			proSetting: key === 'store_owner' ? false : true,
			moduleEnabled: key != 'store_owner' && 'staff-manager',
		}))
	: [];
export default {
	id: 'user-permissions',
	priority: 3,
	headerTitle: __('User Capabilities', 'multivendorx'),
	headerDescription: __(
		'Define what each store role can access and manage within the marketplace.',
		'multivendorx'
	),
	headerIcon: 'adminfont-user-network-icon',
	submitUrl: 'settings',
	modal: [
		{
			key: 'role_access_table',
			type: 'multi-checkbox-table',
			classes: 'full-width',
			columns: columns,
			rows: appLocalizer?.capabilities || {},
		},
	],
};
