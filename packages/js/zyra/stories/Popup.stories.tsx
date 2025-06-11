import Popup from '../src/components/Popup';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Popup > = {
	title: 'Zyra/Components/Popup',
	component: Popup,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof Popup >;

export const TestProPopup: Story = {
	args: {
		proUrl: 'https://example.com/upgrade-to-pro',
		title: 'Upgrade to Pro',
		messages: [
			'Unlock all advanced features.',
			'Get priority support.',
			'Access to premium modules and integrations.',
		],
	},
	render: ( args ) => {
		return <Popup { ...args } />;
	},
};

export const TestModulePopup: Story = {
	args: {
		moduleName: 'SEO Optimizer',
		moduleMessage: "This module helps optimize your site's SEO.",
		moduleButton: 'Enable Module',
		modulePageUrl: '/modules/seo-optimizer',
	},
	render: ( args ) => {
		return <Popup { ...args } />;
	},
};

export const TestSettingPopup: Story = {
	args: {
		settings: 'Advanced Settings',
		SettingDescription:
			'Configure title tags, meta descriptions, and more.',
		SettingMessage: 'Customize how your site appears in search results.',
	},
	render: ( args ) => {
		return <Popup { ...args } />;
	},
};
export const TestPluginPopup: Story = {
	args: {
		plugin: 'Yoast SEO',
		pluginDescription:
			'Yoast SEO is a comprehensive tool for search engine optimization.',
		pluginMessage: 'Activate the plugin to unlock all SEO features.',
		pluginButton: 'Install Plugin',
		pluginUrl: 'https://wordpress.org/plugins/yoast-seo/',
	},
	render: ( args ) => {
		return <Popup { ...args } />;
	},
};
