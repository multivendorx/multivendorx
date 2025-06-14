import Section from '../src/components/Section';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Section > = {
	title: 'Zyra/Components/Section',
	component: Section,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof Section >;

export const TestSection: Story = {
	args: {
		wrapperClass: 'setting-section-divider',
		hint: 'Fill in all required fields carefully.',
		value: 'User Registration',
	},
	render: ( args ) => {
		return <Section { ...args } />;
	},
};
