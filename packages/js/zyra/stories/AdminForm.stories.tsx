import AdminForm, { InputField } from '../src/components/AdminForm';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof AdminForm > = {
	title: 'Zyra/Components/AdminForm',
	component: AdminForm,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof AdminForm >;

type settingsDataType = {
	modal: InputField[];
	submitUrl: string;
	id: string;
};

const settingsData: settingsDataType = {
	modal: [
		{
			key: 'separator_content_1',
			type: 'section' as const,
			label: '',
		},
		{
			key: 'unsubscribe_button_text',
			type: 'text' as const,
			label: "'Unsubscribe' Button Caption",
			desc: 'Modify the un-subscribe button text. By default we display "Unsubscribe".',
			placeholder: 'Unsubscribe',
			classes: 'unsubcribe-button-section',
		},
		{
			key: 'separator_content_2',
			type: 'section' as const,
			label: '',
		},
		{
			key: 'is_guest_subscriptions_enable',
			type: 'checkbox' as const,
			label: 'Guest Subscriptions',
			desc: 'Allow guests (non-logged-in users) to subscribe to notifications for out-of-stock products.',
			class: 'woo-toggle-checkbox',
			options: [
				{
					key: 'is_guest_subscriptions_enable',
					value: 'is_guest_subscriptions_enable',
				},
			],
			look: 'toggle',
		},
		{
			key: 'is_enable_backorders',
			type: 'checkbox' as const,
			label: 'Allow Backorder Subscriptions',
			desc: 'Enabling this setting allows users to subscribe to out-of-stock products, even when the backorder option is enabled.',
			class: 'woo-toggle-checkbox',
			options: [
				{
					key: 'is_enable_backorders',
					value: 'is_enable_backorders',
				},
			],
			look: 'toggle',
		},
		{
			key: 'separator_content_3',
			type: 'section' as const,
			label: '',
		},
		{
			key: 'display_lead_times',
			type: 'checkbox' as const,
			label: 'Stock Status for Lead Time',
			class: 'woo-toggle-checkbox',
			desc: 'Lead time informs customers when a product will be available again. This setting lets you choose which stock statuses will display the restock estimate.',
			options: [
				{
					key: 'outofstock',
					label: 'Out of stock',
					value: 'outofstock',
				},
				{
					key: 'onbackorder',
					label: 'On backorder',
					value: 'onbackorder',
				},
			],
		},
		{
			key: 'lead_time_format',
			type: 'settingToggle' as const,
			label: 'Lead Format',
			desc: 'Choose the lead time format: Either dynamic (set unique lead time text for all out of stock product) or static (apply a default lead time text for out of stock products).',
			dependent: {
				key: 'display_lead_times',
				set: true,
			},
			options: [
				{
					key: 'static',
					label: 'Static',
					value: 'static',
				},
				{
					key: 'dynamic',
					label: 'Dynamic',
					value: 'dynamic',
				},
			],
			proSetting: true,
		},
		{
			key: 'lead_time_static_text',
			type: 'text' as const,
			label: 'Lead time static text',
			desc: 'This will be the standard message displayed for all out-of-stock products unless a custom lead time is specified.',
			dependent: [
				{
					key: 'lead_time_format',
					value: 'static',
				},
				{
					key: 'display_lead_times',
					set: true,
				},
			],
		},
		{
			key: 'separator_content_4',
			type: 'section' as const,
			label: '',
		},
		{
			key: 'is_enable_no_interest',
			type: 'checkbox' as const,
			label: 'Display subscriber count for out of stock',
			desc: 'Enabling this setting shows the subscriber count on the single product page.',
			class: 'woo-toggle-checkbox',
			options: [
				{
					key: 'is_enable_no_interest',
					value: 'is_enable_no_interest',
				},
			],
			look: 'toggle',
		},
		{
			key: 'shown_interest_text',
			type: 'textarea' as const,
			classes: 'conditional-section',
			class: 'woo-setting-wpeditor-class',
			label: 'Subscriber count notification message',
			desc: 'Personalize the notification text to let users know about the quantity of subscribers for out-of-stock item. Note: Use %no_of_subscribed% as number of interest/subscribed persons.',
			dependent: {
				key: 'is_enable_no_interest',
				set: true,
			},
		},
		{
			key: 'separator_content_5',
			type: 'section' as const,
			label: '',
		},
		{
			key: 'is_double_optin',
			type: 'checkbox' as const,
			class: 'woo-toggle-checkbox',
			label: 'Subscriber double opt-in',
			desc: 'This is demo desc',
			options: [
				{
					key: 'is_double_optin',
					value: 'is_double_optin',
				},
			],
			proSetting: true,
			look: 'toggle',
		},
		{
			key: 'double_opt_in_success',
			type: 'textarea' as const,
			class: 'woo-setting-wpeditor-class',
			desc: 'Default: Kindly check your inbox to confirm the subscription.',
			label: 'Double opt-in success message',
			dependent: {
				key: 'is_double_optin',
				set: true,
			},
			proSetting: true,
		},
		{
			key: 'separator_content_6',
			type: 'section' as const,
			label: '',
		},
		{
			key: 'is_recaptcha_enable',
			type: 'checkbox' as const,
			label: 'Enable reCaptcha',
			class: 'woo-toggle-checkbox',
			desc: 'This is demo desc',
			options: [
				{
					key: 'is_recaptcha_enable',
					value: 'is_recaptcha_enable',
				},
			],
			proSetting: true,
			look: 'toggle',
		},
		{
			key: 'v3_site_key',
			type: 'text' as const,
			label: 'Site Key',
			dependent: {
				key: 'is_recaptcha_enable',
				set: true,
			},
		},
		{
			key: 'v3_secret_key',
			type: 'text' as const,
			label: 'Secret Key',
			dependent: {
				key: 'is_recaptcha_enable',
				set: true,
			},
		},
		{
			key: 'separator_content_7',
			type: 'section' as const,
			label: '',
		},
		{
			key: 'additional_alert_email',
			type: 'textarea' as const,
			class: 'woo-setting-wpeditor-class',
			desc: "Set the email address to receive notifications when a user subscribes to an out-of-stock product. You can add multiple comma-separated emails.<br/> Default: The admin's email is set as the receiver. Exclude the admin's email from the list to exclude admin from receiving these notifications.",
			label: 'Recipient email for new subscriber',
		},
		{
			key: 'note_blocktext',
			type: 'blocktext' as const,
			label: 'no_label',
			blocktext:
				'Disclaimer – Loco Translator Compatibility: This plugin allows you to customize certain frontend text settings and descriptions. Default texts are Loco Translator-ready, but any changes made in the corresponding custom text box will no longer be available for translation via Loco Translator. Hence, please enter the customized text in your desired language only.',
		},
	],
	submitUrl: '/api/save-pro-settings',
	id: 'pro_settings_form_001',
};

export const TestAdminForm: Story = {
	args: {
		settings: settingsData,
		proSetting: settingsData,
		setting: {
			theme: 'light',
			notifications: true,
		},
		updateSetting: ( key: string, value: any ) => {
			console.log( 'Updating setting:', key, value );
		},
		modules: {
			inventory: true,
			reports: false,
		},
		appLocalizer: {
			locale: 'en_US',
			strings: {
				save: 'Save Settings',
				cancel: 'Cancel',
			},
		},
		ProPopup: () => <div>This is a ProPopup Component</div>,
		modulePopupFields: {
			// Optional: only if you have ModulePopupProps defined
		},
	},
	render: ( args ) => {
		return <AdminForm { ...args } />;
	},
};
