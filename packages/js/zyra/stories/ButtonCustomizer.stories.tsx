import ButtonCustomizer from '../src/components/ButtonCustomiser';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ButtonCustomizer> = {
	title: 'Zyra/Components/ButtonCustomizer',
	component: ButtonCustomizer,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ButtonCustomizer>;

export const TestButtonCustomizer: Story = {
	args: {
		onChange: (key, value, isRestoreDefaults) => {
			console.log('Changed:', key, value, isRestoreDefaults);
		},
		setting: {
			color: 'blue',
			size: 'large',
		},
		className: 'custom-button',
		text: 'Customize',
		proSetting: true,
	},
	render: (args) => {
		return <ButtonCustomizer {...args} />;
	},
};
