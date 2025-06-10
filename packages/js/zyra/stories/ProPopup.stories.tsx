import ProPopup from '../src/components/ProPopup';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ProPopup> = {
	title: 'Zyra/Components/ProPopup',
	component: ProPopup,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ProPopup>;

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
	render: (args) => {
		return <ProPopup {...args} />;
	},
};
