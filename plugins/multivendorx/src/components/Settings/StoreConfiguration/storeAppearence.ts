import { __ } from '@wordpress/i18n';
import template1 from '../../../assets/images/template/store/template1.jpg';
import template2 from '../../../assets/images/template/store/template2.jpg';
import template3 from '../../../assets/images/template/store/template3.jpg';
import DashboardTemplate from '../../../assets/template/Dashbord';

export default {
	id: 'store-appearance',
	priority: 5,
	name: __('Appearance', 'multivendorx'),
	tabTitle: 'Marketplace Branding',
	desc: __(
		'Set a marketplace logo to strengthen brand identity across all connected stores.',
		'multivendorx'
	),
	icon: 'adminfont-appearance',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_dashboard_site_logo',
			type: 'file',
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
			hint: __('Store Customizer', 'multivendorx'),
			desc: __(
				'Control how your store looks and feels. Set the banner style, logo placement, and customize the dashboard color scheme to match your brand identity.',
				'multivendorx'
			),
		},
		{
			key: 'store_banner_template',
			type: 'color-setting',
			label: 'Shop banner section',
			settingDescription:
				'Choose how the store’s shop page appears, including banner, logo, and description.',
			images: [
				{
					key: 'template1',
					label: 'Neo Frame',
					img: template1,
					value: 'template1',
				},
				{
					key: 'template2',
					label: 'Elegant Wave',
					img: template2,
					value: 'template2',
				},
				{
					key: 'template3',
					label: 'Classic Vibe',
					img: template3,
					value: 'template3',
				},
			],
		},
		{
			key: 'store_sidebar',
			type: 'setting-toggle',
			label: __('Store sidebar', 'multivendorx'),
			desc: __(
				'Choose where the sidebar show in shop pages.',
				'multivendorx'
			),
			options: [
				{
					key: 'left',
					label: __('At Left', 'multivendorx'),
					value: 'At Left',
				},
				{
					key: 'right',
					label: __('At Right', 'multivendorx'),
					value: 'At Right',
				}
			]
		},
		{
			key: 'store_color_settings',
			type: 'color-setting',
			label: 'Dashboard color scheme',
			settingDescription:
				'Choose a dashboard color scheme from predefined sets or customize your own. Each scheme defines the button style, and hover effects for a consistent look.',
			showPreview: true,
			templates: [
				{
				  key: 'dashbord',
				  label: __('dashbord', 'mvx-pro'),
				  preview: DashboardTemplate,
				  component: DashboardTemplate,
				}			  
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
					label: 'black',
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
