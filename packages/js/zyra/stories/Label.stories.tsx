import Label from '../src/components/Label';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Label > = {
	title: 'Zyra/Components/Label',
	component: Label,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof Label >;

export const TestLabel: Story = {
	args: {
		wrapperClass: 'form-group-only-label',
		descClass: 'settings-metabox-description',
		description: 'This is a sample label description.',
		value: 'Label Text',
	},
	render: ( args ) => {
		return <Label { ...args } />;
	},
};
