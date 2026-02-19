import { __ } from '@wordpress/i18n';

const capabilityOptions = appLocalizer?.capabilities
	? Object.entries(appLocalizer.capabilities).map(([key, group]) => {
			return {
				key,
				type: 'checkbox',
				label: group.label,
				desc: group.desc,
				options: Object.entries(group.capability || {}).map(
					([capKey, capLabel]) => {
						const proData =
							appLocalizer.capability_pro?.[capKey] || {};
						return {
							key: capKey,
							label: capLabel,
							value: capKey,
							proSetting: proData.prosetting === true,
							moduleEnabled: proData.module || null,
						};
					}
				),
				selectDeselect: true,
			};
		})
	: [];

const staticOptions = [
	{
		key: 'section',
		type: 'section',
		title: __('What stores can change after approval', 'multivendorx'),
	},
	{
		key: 'edit_store_info_activation',
		type: 'checkbox',
		label: __('Post-activation edit controls', 'multivendorx'),
		desc: __(
			'Control which store information fields can be modified after a store has been activated.',
			'multivendorx'
		),
		options: [
			{
				key: 'store_description',
				label: __('Store description', 'multivendorx'),
				value: 'store_description',
			},
			{
				key: 'store_images',
				label: __('Logo and banner', 'multivendorx'),
				value: 'store_images',
			},
			{
				key: 'store_address',
				label: __('Store address', 'multivendorx'),
				value: 'store_address',
			},
			{
				key: 'store_contact',
				label: __('Phone and email', 'multivendorx'),
				value: 'store_contact',
			},
			{
				key: 'store_name',
				label: __('Store name', 'multivendorx'),
				value: 'store_name',
			},
		],
		selectDeselect: true,
	},
];

const modalOptions = [...capabilityOptions, ...staticOptions];

export default {
	id: 'store-permissions',
	priority: 2,
	headerTitle: __('Store Permissions', 'multivendorx'),
	headerDescription: __(
		'Control which features and actions are available to each store role.',
		'multivendorx'
	),
	headerIcon: 'wholesale',
	submitUrl: 'settings',
	modal: modalOptions,
};
