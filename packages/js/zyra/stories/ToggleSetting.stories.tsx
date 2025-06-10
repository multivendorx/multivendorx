import ToggleSetting from '../src/components/ToggleSetting';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ToggleSetting> = {
	title: 'Zyra/Components/ToggleSetting',
	component: ToggleSetting,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ToggleSetting>;

export const TestToggleSetting: Story = {
	args: {
		description: 'Choose your preferred option',
		options: [
			{ key: 'opt1', value: 'yes', label: 'Yes' },
			{ key: 'opt2', value: 'no', label: 'No' },
		],
		wrapperClass: 'toggle-wrapper',
		descClass: 'settings-metabox-description',
		value: 'yes',
		onChange: (value) => {
			console.log('Selected value:', value);
		},
		proSetting: false,
	},
	render: (args) => {
		return <ToggleSetting {...args} />;
	},
};
