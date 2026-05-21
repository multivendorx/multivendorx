/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import DashboardTemplate from '../../../assets/template/Dashboard';

import LuxeDisplay from '../../../assets/template/bannerTemplate/LuxeDisplay';
import SignatureView from '../../../assets/template/bannerTemplate/SignatureView';
import DynamicShowcase from '../../../assets/template/bannerTemplate/DynamicShowcase';

export default {
	id: 'appearance',
	priority: 5,
	headerTitle: __('Appearance', 'multivendorx'),
	settingTitle: 'Marketplace Branding',
	headerDescription: __(
		'Set a marketplace logo to strengthen brand identity across all connected stores.',
		'multivendorx'
	),
	headerIcon: 'appearance',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_dashboard_site_logo',
			type: 'attachment',
			label: __('Branding logo', 'multivendorx'),
			size: 'small',
			settingDescription: __(
				'Upload the logo that will be displayed in all store dashboards to highlight your marketplace’s branding. If not provided, the site name will be used.',
				'multivendorx'
			),
		},
		{
			key: 'section',
			type: 'section',
			title: __('Store Customizer', 'multivendorx'),
			desc: __(
				'Control how your store looks and feels. Set the banner style, logo placement, and customize the dashboard color scheme to match your brand identity.',
				'multivendorx'
			),
		},
		{
			key: 'store_banner_notice',
			type: 'notice',
			message: __(
				'Choose how the store page displays its banner, logo, and description. </br> <b>Note: </b>Applicable only for non-block themes. For block themes, customize the layout through the Block Editor template settings.</br> <b>Read more: </b> <a class="link-item" href="https://multivendorx.com/docs/knowledgebase/configure-store-template-layout-for-block-based-themes/" >Block theme layout guide</a>',
				'multivendorx'
			),
			noticeType: 'info',
			displayPosition: 'notice',
		},
		{
			key: 'store_banner_template',
			type: 'color-setting',
			label: 'Shop banner section',
			settingDescription:
				'Choose how the store’s shop page appears, including banner, logo, and description.',
			templateSelector: true,
			templates: [
				{
					key: 'luxe_display',
					label: __('Luxe Display', 'multivendorx'),
					preview: LuxeDisplay,
					component: LuxeDisplay,
				},
				{
					key: 'signature_view',
					label: __('Signature View', 'multivendorx'),
					preview: SignatureView,
					component: SignatureView,
				},
				{
					key: 'dynamic_showcase',
					label: __('Dynamic Showcase', 'multivendorx'),
					preview: DynamicShowcase,
					component: DynamicShowcase,
				},
			],
		},
		{
			key: 'store_sidebar',
			type: 'choice-toggle',
			label: __('Where to show sidebar on store page', 'multivendorx'),
			desc: `Choose where the side content appears on the store page, on the left or right, based on your needs.<br>Selecting <b>No sidebar</b> will remove the side content completely.<br>This area can display helpful tools such as category filters, store location details, and product search, making it easier for customers to browse.<br>You can add or manage this content from <a href="${appLocalizer.admin_url}widgets.php" target="_blank"><b>WordPress → Appearance → Widgets</b></a>.`,
			options: [
				{
					key: 'no-sidebar',
					label: __('No Sidebar', 'multivendorx'),
					value: 'no',
					icon: 'no-sidebar',
				},
				{
					key: 'left',
					label: __('Left Sidebar', 'multivendorx'),
					value: 'left',
					icon: 'left-sidebar',
				},
				{
					key: 'right',
					label: __('Right Sidebar', 'multivendorx'),
					value: 'right',
					icon: 'right-sidebar',
				},
			],
		},
		{
			key: 'store_color_settings',
			type: 'color-setting',
			label: 'Dashboard color scheme',
			settingDescription:
				'Choose a dashboard color scheme from predefined sets or customize your own. Each scheme defines the button style, and hover effects for a consistent look.',
			templates: [
				{
					key: 'dashboard',
					label: __('Dashboard', 'multivendorx'),
					preview: DashboardTemplate,
					component: DashboardTemplate,
				},
			],
			predefinedOptions: [
				{
					key: 'orchid_bloom',
					label: 'Orchid Bloom',
					value: 'orchid_bloom',
					colors: {
						colorPrimary: '#FF5959',
						colorSecondary: '#FADD3A',
						colorAccent: '#49BEB6',
						colorSupport: '#075F63',
					},
				},
				{
					key: 'emerald_edge',
					label: 'Emerald Edge',
					value: 'emerald_edge',
					colors: {
						colorPrimary: '#e6b924',
						colorSecondary: '#d888c1',
						colorAccent: '#6b7923',
						colorSupport: '#6e97d0',
					},
				},
				{
					key: 'solar_ember',
					label: 'Solar Ember',
					value: 'solar_ember',
					colors: {
						colorPrimary: '#fe900d',
						colorSecondary: '#6030db',
						colorAccent: '#17cadb',
						colorSupport: '#a52fff',
					},
				},
				{
					key: 'crimson_blaze',
					label: 'Crimson Blaze',
					value: 'crimson_blaze',
					colors: {
						colorPrimary: '#04e762',
						colorSecondary: '#f5b700',
						colorAccent: '#dc0073',
						colorSupport: '#008bf8',
					},
				},
				{
					key: 'golden_ray',
					label: 'Golden Ray',
					value: 'golden_ray',
					colors: {
						colorPrimary: '#0E117A',
						colorSecondary: '#399169',
						colorAccent: '#12E2A4',
						colorSupport: '#DCF516',
					},
				},
				{
					key: 'obsidian_night',
					label: 'Obsidian Night',
					value: 'obsidian_night',
					colors: {
						colorPrimary: '#00eed0',
						colorSecondary: '#0197af',
						colorAccent: '#4b227a',
						colorSupport: '#02153d',
					},
				},
				{
					key: 'obsidian',
					label: 'Obsidian',
					value: 'obsidian',
					colors: {
						colorPrimary: '#7ccc63',
						colorSecondary: '#f39c12',
						colorAccent: '#e74c3c',
						colorSupport: '#2c3e50',
					},
				},
				{
					key: 'black',
					label: 'Black Diamond',
					value: 'black',
					colors: {
						colorPrimary: '#2c3e50',
						colorSecondary: '#2c3e50',
						colorAccent: '#2c3e50',
						colorSupport: '#2c3e50',
					},
				},
			],
		},
	],
};
