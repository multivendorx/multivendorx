import CatalogCustomizer from '../src/components/CatalogCustomizer';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CatalogCustomizer> = {
	title: 'Zyra/Components/CatalogCustomizer',
	component: CatalogCustomizer,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CatalogCustomizer>;

export const TestCatalogCustomizer: Story = {
	args: {
		onChange: (key, value) => {
			console.log('Catalog change:', key, value);
		},
		proSetting: true,
		setting: {
			layout: 'grid',
			showImages: true,
		},
		SampleProduct:
			'https://greendroprecycling.com/wp-content/uploads/2017/04/GreenDrop_Station_Aluminum_Can_Coke.jpg',
		proUrl: 'https://example.com/upgrade',
	},
	render: (args) => {
		return <CatalogCustomizer {...args} />;
	},
};
