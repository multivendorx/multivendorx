import BlockText from '../src/components/BlockText';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof BlockText > = {
	title: 'Zyra/Components/BlockText',
	component: BlockText,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof BlockText >;

export const TestBlockText: Story = {
	args: {
		blockTextClass: 'settings-metabox-description-code',
		value: 'This is a demo block of text.',
	},
	render: ( args ) => {
		return <BlockText { ...args } />;
	},
};
