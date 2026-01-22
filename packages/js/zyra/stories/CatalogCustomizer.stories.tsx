import CatalogCustomizer from '../src/components/CatalogCustomizer';
import type { Meta, StoryObj } from '@storybook/react-vite';
import "../src/styles/common.scss";

const meta: Meta<typeof CatalogCustomizer> = {
    title: 'Zyra/Components/CatalogCustomizer',
    component: CatalogCustomizer,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CatalogCustomizer>;

export const ProCatalogCustomizer: Story = {
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
        return <div className='multivendorx-main-wrapper'><CatalogCustomizer {...args} /></div>;
    },
};

export const FreeCatalogCustomizer: Story = {
    args: {
        onChange: (key, value) => {
            console.log('Catalog change:', key, value);
        },
        proSetting: false,
        setting: {
            layout: 'grid',
            showImages: true,
        },
        SampleProduct:
            'https://greendroprecycling.com/wp-content/uploads/2017/04/GreenDrop_Station_Aluminum_Can_Coke.jpg',
        proUrl: 'https://example.com/upgrade',
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper'><CatalogCustomizer {...args} /></div>;
    },
};


export const PriceHiddenCatalogCustomizer: Story = {
    args: {
        onChange: (key, value) => {
            console.log('Catalog change:', key, value);
        },
        proSetting: true,
        setting: {
            layout: 'list',
            showImages: true,
            hide_product_price: true,
        },
        SampleProduct:
            'https://greendroprecycling.com/wp-content/uploads/2017/04/GreenDrop_Station_Aluminum_Can_Coke.jpg',
        proUrl: 'https://example.com/upgrade',
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper'><CatalogCustomizer {...args} /></div>;
    },
};


export const ProductDescriptionHiddenCatalogCustomizer: Story = {
    args: {
        onChange: (key, value) => {
            console.log('Catalog change:', key, value);
        },
        proSetting: true,
        setting: {
            layout: 'list',
            showImages: true,
            hide_product_desc: true,
        },
        SampleProduct:
            'https://greendroprecycling.com/wp-content/uploads/2017/04/GreenDrop_Station_Aluminum_Can_Coke.jpg',
        proUrl: 'https://example.com/upgrade',
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper'><CatalogCustomizer {...args} /></div>;
    },
};