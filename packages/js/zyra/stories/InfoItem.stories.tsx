import { Meta, StoryObj } from "@storybook/react-vite";

import InfoItem from '../src/components/InfoItem'
import type { InfoItemProps } from '../src/components/InfoItem';

const meta: Meta<typeof InfoItem> = {
    title: 'Zyra/Components/InfoItem',
    component: InfoItem,
    tags: ['autodocs']
}

export default meta;

const storeInfoItemProps: InfoItemProps = {
    title: 'Urban Cart Store',
    isLoading: false,
    titleLink:
        'http://localhost:8889/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/42/&subtab=store-overview',
    avatar: {
        text: 'U',
        link: 'http://localhost:8889/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/42/&subtab=store-overview',
    },
    descriptions: [
        {
            label: 'Commission',
            value: '$1,250.00',
        },
        {
            label: 'Refunded',
            value: '$85.00',
        },
    ],
    amount: '$12,480.00',
};

const productInfoItemProps: InfoItemProps = {
    title: 'Premium Cotton Hoodie',
    titleLink: 'http://localhost:8889/wp-admin/post.php?post=128&action=edit',
    avatar: {
        image: 'https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg',
        iconClass: 'single-product',
    },
    descriptions: [
        {
            label: 'SKU',
            value: 'HD-PRM-001',
        },
        {
            label: 'ID',
            value: 128,
        },
        {
            label: 'By',
            value: 'Urban Cart Store',
        },
    ],
};

const badgesProps = [
    {
        text: 'Featured',
        className: 'purple',
        onClick: () => alert('Featured badge clicked'),
    },
    {
        text: 'Verified',
        className: 'green',
        onClick: () => alert('Verified badge clicked'),
    },
    {
        text: 'Top Seller',
        className: 'blue',
        onClick: () => alert('Top Seller badge clicked'),
    },
];

type Story = StoryObj<typeof InfoItem>;

export const StoreInfo: Story = {
    render: () => {
        return (
            <InfoItem
                {...storeInfoItemProps}
            />
        )
    }
}

export const ProductInfo: Story = {
    render: () => {
        return (
            <InfoItem
                {...productInfoItemProps}
            />
        )
    }
}

export const InfoitemWithBadges: Story = {
    render: () => {
        return (
            <InfoItem
                {...storeInfoItemProps}
                badges={badgesProps}
            />
        )
    }
}

export const LoadingInfoItem: Story = {
    render: () => {
        return (
            <InfoItem
                {...storeInfoItemProps}
                badges={badgesProps}
                isLoading={true}
            />
        )
    }
}



