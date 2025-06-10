import FreeProFormCustomizer from '../src/components/FreeProFormCustomizer';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FreeProFormCustomizer> = {
	title: 'Zyra/Components/FreeProFormCustomizer',
	component: FreeProFormCustomizer,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FreeProFormCustomizer>;

export const TestFreeProFormCustomizer: Story = {
	args: {
		setting: {
			freefromsetting: [
				{
					key: 'emailNotifications',
					label: 'Enable Email Notifications',
					active: true,
					desc: 'Receive updates via email',
				},
				{
					key: 'smsAlerts',
					label: 'Enable SMS Alerts',
					active: false,
					desc: 'Get alerts via SMS',
				},
			],
		},
		proSetting: {
			isPro: true,
			features: ['advancedReports', 'prioritySupport'],
		},
		proSettingChange: () => {
			console.log('Toggled Pro setting');
			return true;
		},
		moduleEnabledChange: () => {
			console.log('Toggled Module');
			return false;
		},
		onChange: (key, value) => {
			console.log(`Changed ${key} to`, value);
		},
	},
	render: (args) => {
		return <FreeProFormCustomizer {...args} />;
	},
};
