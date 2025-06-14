import Banner from '../src/components/Banner';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Banner > = {
	title: 'Zyra/Components/Banner',
	component: Banner,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof Banner >;

export const TestBannerInput: Story = {
	args: {
		isPro: false,
		products: [
			{
				title: 'Pro Feature 1',
				description: 'Description for Pro Feature 1',
			},
			{
				title: 'Pro Feature 2',
				description: 'Description for Pro Feature 2',
			},
			{
				title: 'Pro Feature 3',
				description: 'Description for Pro Feature 3',
			},
		],
		proUrl: '#',
	},
	render: ( args ) => {
		return <Banner { ...args } />;
	},
};

export const TestBannerInputWithTag: Story = {
	args: {
		isPro: false,
		products: [
			{
				title: 'Pro Feature 1',
				description: 'Description for Pro Feature 1',
			},
			{
				title: 'Pro Feature 2',
				description: 'Description for Pro Feature 2',
			},
			{
				title: 'Pro Feature 3',
				description: 'Description for Pro Feature 3',
			},
		],
		proUrl: '#',
		tag: 'Why Premium',
	},
	render: ( args ) => {
		return <Banner { ...args } />;
	},
};

export const TestBannerInputWithButton: Story = {
	args: {
		isPro: false,
		products: [
			{
				title: 'Pro Feature 1',
				description: 'Description for Pro Feature 1',
			},
			{
				title: 'Pro Feature 2',
				description: 'Description for Pro Feature 2',
			},
			{
				title: 'Pro Feature 3',
				description: 'Description for Pro Feature 3',
			},
		],
		proUrl: '#',
		buttonText: 'View Pricing',
	},
	render: ( args ) => {
		return <Banner { ...args } />;
	},
};

export const TestBannerInputWithButtonAndTag: Story = {
	args: {
		isPro: false,
		products: [
			{
				title: 'Pro Feature 1',
				description: 'Description for Pro Feature 1',
			},
			{
				title: 'Pro Feature 2',
				description: 'Description for Pro Feature 2',
			},
			{
				title: 'Pro Feature 3',
				description: 'Description for Pro Feature 3',
			},
		],
		proUrl: '#',
		tag: 'Why Premium',
		buttonText: 'View Pricing',
	},
	render: ( args ) => {
		return <Banner { ...args } />;
	},
};
