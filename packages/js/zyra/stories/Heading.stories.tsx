import Heading from '../src/components/Heading';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Heading> = {
	title: 'Zyra/Components/Heading',
	component: Heading,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const TestHeading: Story = {
	args: {
		wrapperClass: 'heading-container',
		blocktext: 'Welcome to the Heading Component',
	},
	render: (args) => {
		return <Heading {...args} />;
	},
};
