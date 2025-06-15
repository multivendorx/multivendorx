import SubTabSection from '../src/components/SubTabSection';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof SubTabSection > = {
	title: 'Zyra/Components/SubTabSection',
	component: SubTabSection,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof SubTabSection >;

export const TestSubTabSection: Story = {
	args: {
		menuitem: [
			{
				id: 'general',
				name: 'General',
				icon: 'adminlib-star-icon',
				link: '/general',
			},
			{
				id: 'advanced',
				name: 'Advanced',
				icon: 'icon-advanced',
				link: '/advanced',
			},
		],
		currentTab: {
			id: 'general',
			name: 'General',
			icon: 'adminlib-star-icon',
			link: '/general',
		},
		setCurrentTab: ( tab ) => {
			console.log( 'Current tab set to:', tab );
		},
		setting: {
			general: { optionA: true },
			advanced: { optionB: false },
		},
	},
	render: ( args ) => {
		return <SubTabSection { ...args } />;
	},
};
