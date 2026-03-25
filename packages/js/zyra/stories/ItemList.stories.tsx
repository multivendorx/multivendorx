import React, { useState } from "react";
import { ItemListUI } from "../src/components/ItemList";

import { StoryObj, Meta } from "@storybook/react-vite";
import type { Item } from "../src/components/ItemList";
import type { NotificationItem } from '../../../../plugins/multivendorx/src/components/Notifications/HeaderNotifications'

import '../src/styles/fonts.scss';
import '../src/styles/common.scss';


const meta: Meta<typeof ItemListUI> = {
    title: 'Zyra/Components/ItemList',
    component: ItemListUI,
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof ItemListUI>;

// Popular Variations
// notification | checklist | feature-list | mini-card | price-list | search-results | mini-card documentation | task-list


export const Default: Story = {
    render: () => {
        const featuresList = [
            {
                title: 'Membership rewards & commission',
                desc:
                    'Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.',

                icon: 'commission',
            },
            {
                title: 'Verified stores only',
                desc:
                    'Screen stores with document verification and approval - build a trusted marketplace from day one.',

                icon: 'verification3',
            },
            {
                title: 'Diversified marketplace',
                desc:
                    'Enable bookings, subscriptions, and auctions to boost sales and engagement.',

                icon: 'marketplace',
            },
            {
                title: 'Vacation mode for stores',
                desc:
                    'Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.',

                icon: 'vacation',
            },
            {
                title: 'Never run out of stock',
                desc:
                    'Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.',

                icon: 'global-community',
            },
            {
                title: 'Autopilot notifications',
                desc:
                    'Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.',

                icon: 'notification',
            },
        ];

        return (
            <ItemListUI
                items={featuresList.map(
                    ({ icon, title, desc }) => ({
                        icon: icon,
                        title: title,
                        desc: desc,
                    })
                )}
                background={false}
                border={false}
                onItemClick={() => { }}
            />
        )
    }
}


// FEATURE-LIST   (DashboardTab.tsx)
export const FeaturesList: Story = {
    render: () => {
        const featuresList = [
            {
                title: 'Membership rewards & commission',
                desc:
                    'Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.',

                icon: 'commission',
            },
            {
                title: 'Verified stores only',
                desc:
                    'Screen stores with document verification and approval - build a trusted marketplace from day one.',

                icon: 'verification3',
            },
            {
                title: 'Diversified marketplace',
                desc:
                    'Enable bookings, subscriptions, and auctions to boost sales and engagement.',

                icon: 'marketplace',
            },
            {
                title: 'Vacation mode for stores',
                desc:
                    'Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.',

                icon: 'vacation',
            },
            {
                title: 'Never run out of stock',
                desc:
                    'Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.',

                icon: 'global-community',
            },
            {
                title: 'Autopilot notifications',
                desc:
                    'Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.',

                icon: 'notification',
            },
        ];

        return (
            <ItemListUI
                className="feature-list"
                items={featuresList.map(
                    ({ icon, title, desc }) => ({
                        icon: icon,
                        title: title,
                        desc: desc,
                    })
                )}
                background={false}
                border={false}
                onItemClick={() => { }}
            />
        )
    }
}


// MINI-CARD DOCUMENTATION   (documentation.tsx)
export const MiniCardDocumentation: Story = {
    render: () => {
        const featuresList = [
            {
                title: 'Membership rewards & commission',
                desc:
                    'Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.',

                icon: 'commission',
            },
            {
                title: 'Verified stores only',
                desc:
                    'Screen stores with document verification and approval - build a trusted marketplace from day one.',

                icon: 'verification3',
            },
            {
                title: 'Diversified marketplace',
                desc:
                    'Enable bookings, subscriptions, and auctions to boost sales and engagement.',

                icon: 'marketplace',
            },
            {
                title: 'Vacation mode for stores',
                desc:
                    'Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.',

                icon: 'vacation',
            },
            {
                title: 'Never run out of stock',
                desc:
                    'Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.',

                icon: 'global-community',
            },
            {
                title: 'Autopilot notifications',
                desc:
                    'Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.',

                icon: 'notification',
            },
        ];

        return (
            <ItemListUI
                className="mini-card documentation"
                items={featuresList.map(
                    ({ icon, title, desc }) => ({
                        icon: icon,
                        title: title,
                        desc: desc,
                    })
                )}
                background={false}
                border={false}
                onItemClick={() => { }}
            />
        )
    }
}


//  SEARCH-RESULTS   (HeaderSearch.tsx)  
export const SearchResults: Story = {
    render: () => {
        const [query, setQuery] = useState<string>('');

        const searchResultsItems = [
            { id: 'platform-fees', title: 'Platform fees' },
            { id: 'facilitator-fees', title: 'Facilitator fees' },
            { id: 'gateway-fees', title: 'Gateway fees' },
            { id: 'numbering-format', title: 'Numbering format' },
            { id: 'invoice-footer-text', title: 'Invoice footer text' },
            {
                id: 'eligible-order-statuses-for-store-earning-payout',
                title: 'Eligible order statuses for store earning payout',
            },
            { id: 'automatic-payout-frequency', title: 'Automatic payout frequency' },
            { id: 'free-withdrawals-and-fees', title: 'Free withdrawals and fees' },
            {
                id: 'eligible-order-status-for-refund',
                title: 'Eligible order status for refund',
            },
            {
                id: 'customers-will-see-information-for',
                title: 'Customers will see information for',
            },
            { id: 'reasons-for-abuse-report', title: 'Reasons for abuse report' },
            {
                id: 'sku-management-for-products-listing',
                title: 'SKU management for products/listing',
            },
            {
                id: 'products-available-for-franchise-orders',
                title: 'Products available for franchise orders',
            },
            {
                id: 'appointments',
                title: 'Appointments',
                desc: 'Dedicated appointment booking functionality.',
            },
            {
                id: 'accommodation',
                title: 'Accommodation',
                desc: 'Enable customers to book overnight stays in just a few clicks.',
            },
            {
                id: 'import-export-tools',
                title: 'Import Export Tools',
                desc: 'Stores will be able to upload or download product lists in bulk using CSV files.',
            },
            {
                id: 'follow-store',
                title: 'Follow Store',
                desc: 'Customers follow stores to receive updates, offers, and product alerts.',
            },
            {
                id: 'business-hours',
                title: 'Business Hours',
                desc: 'Shows store opening and closing times for customers.',
            },
            {
                id: 'privacy',
                title: 'Privacy',
                desc: 'Hide sensitive store information from customers, including contact details, location, or other specified data.',
            },
            {
                id: 'store-support',
                title: 'Store Support',
                desc: 'Built-in ticketing system for customers to raise and track support requests.',
            },
            {
                id: 'store-analytics',
                title: 'Store Analytics',
                desc: 'Reports on sales, orders, and revenue, with integration for Google Analytics.',
            },
            {
                id: 'search-discovery',
                title: 'Search & Discovery',
                desc: 'SEO settings for store pages and products using Rank Math or Yoast SEO.',
            },
            {
                id: 'marketplace-membership',
                title: 'Marketplace Membership',
                desc: 'Admin defines membership levels with specific capabilities for different stores.',
            },
            {
                id: 'marketplace-fee',
                title: 'Marketplace Fee',
                desc: 'Set and manage platform fees for each order or store to cover operational costs',
            },
            {
                id: 'franchises',
                title: 'Franchises',
                desc: 'Enables franchise-style ordering with store-created orders, admin-product ordering, and automatic store assignment based on customer location.',
            },
            {
                id: 'payment-gateway-charge',
                title: 'Payment Gateway Charge',
                desc: 'Payment gateway fees are deducted from vendor commissions by the admin, ensuring platform costs are covered automatically.',
            },
            {
                id: 'advertise-product',
                title: 'Advertise Product',
                desc: 'Paid promotion for products within the marketplace, boosting visibility.',
            },
            {
                id: 'wholesale',
                title: 'Wholesale',
                desc: 'Stores set wholesale prices and bulk purchase rules for selected customer groups.',
            },
            {
                id: 'store-inventory',
                title: 'Store Inventory',
                desc: 'Manages stock levels, sends low-stock alerts, and maintains a waitlist for out-of-stock products.',
            },
            {
                id: 'announcement',
                title: 'Announcement',
                desc: 'Marketplace-wide notices or updates sent from admin to all stores.',
            },
            {
                id: 'knowledgebase',
                title: 'Knowledgebase',
                desc: 'Guides, tutorials, and FAQs shared with stores by the admin.',
            },
            {
                id: 'elementor',
                title: 'Elementor',
                desc: 'Drag-and-drop design support for custom store pages with Elementor.',
            },
            {
                id: 'buddypress',
                title: 'Buddypress',
                desc: 'Adds social networking features to stores (profiles, connections, messaging).',
            },
            {
                id: 'advance-custom-field',
                title: 'Advance Custom field',
                desc: 'Extra custom product fields created by admin for stores to use.',
            },
            {
                id: 'geomywp',
                title: 'GEOmyWP',
                desc: 'Lets stores pinpoint their location on an interactive map, making it easy for customers to discover nearby stores',
            },
            {
                id: 'wp-affiliate',
                title: 'WP Affiliate',
                desc: 'Affiliate program that tracks referrals and commissions for marketplace products.',
            },
            {
                id: 'shipstation',
                title: 'Shipstation',
                desc: 'Integration with ShipStation for advanced shipping management and label printing.',
            },
            {
                id: 'geo-location',
                title: 'Geo Location',
                desc: 'Lets stores pinpoint their location on an interactive map, making it easy for customers to discover nearby stores and shop locally.',
            },
        ];

        let filteredItems: Item[];

        // filters out the query matches
        if (query.trim() === '') {
            filteredItems = [];
        } else {
            filteredItems = searchResultsItems.filter((item: Item): boolean => {
                let itemSatisfiesSearch: boolean = false;
                if (item.title) {
                    itemSatisfiesSearch = itemSatisfiesSearch || item.title.toLowerCase().includes(query.trim().toLowerCase());
                }
                if (item.desc) {
                    itemSatisfiesSearch = itemSatisfiesSearch || item.desc.toLowerCase().includes(query.trim().toLowerCase());
                }
                return itemSatisfiesSearch;
            })
        }

        function handleChange(value: string): void {
            setQuery(value);
        }

        return (
            <>
                <label htmlFor="query">Search</label><br />
                <input type="text" id="query" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setQuery(e.target.value)} />
                <ItemListUI
                    items={filteredItems}
                    className="search-results"

                />

            </>
        )
    }
}


//  TASK-LIST   (SequentialTaskExecutor.tsx)

// Task to item mapping
// {
//   id: `task-${index}`,
//   title: task.message,
//   desc: task.status,
//   icon: task.status,
//   className: `task-status-${task.status}`,
// }

export const TaskList: Story = {
    render: () => {
        const taskListItems = [
            {
                id: 'task-1',
                title: 'Initializing marketplace setup',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
            {
                id: 'task-2',
                title: 'Validating store configuration',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
            {
                id: 'task-3',
                title: 'Checking payment gateway credentials',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
            {
                id: 'task-4',
                title: 'Fetching vendor commission rules',
                desc: 'running',
                icon: 'running',
                className: 'task-status-running',
            },
            {
                id: 'task-5',
                title: 'Syncing product catalog with store inventory',
                desc: 'running',
                icon: 'running',
                className: 'task-status-running',
            },
            {
                id: 'task-6',
                title: 'Generating storefront analytics snapshot',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
            {
                id: 'task-7',
                title: 'Updating shipping zone configuration',
                desc: 'failed',
                icon: 'failed',
                className: 'task-status-failed',
            },
            {
                id: 'task-8',
                title: 'Rebuilding vendor dashboard widgets',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
            {
                id: 'task-9',
                title: 'Applying tax calculation settings',
                desc: 'running',
                icon: 'running',
                className: 'task-status-running',
            },
            {
                id: 'task-10',
                title: 'Verifying marketplace notification templates',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
            {
                id: 'task-11',
                title: 'Refreshing payout schedule data',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
            {
                id: 'task-12',
                title: 'Processing refund eligibility rules',
                desc: 'failed',
                icon: 'failed',
                className: 'task-status-failed',
            },
            {
                id: 'task-13',
                title: 'Running vendor capability checks',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
            {
                id: 'task-14',
                title: 'Saving module activation preferences',
                desc: 'running',
                icon: 'running',
                className: 'task-status-running',
            },
            {
                id: 'task-15',
                title: 'Finalizing marketplace configuration update',
                desc: 'success',
                icon: 'success',
                className: 'task-status-success',
            },
        ];

        return (
            <ItemListUI
                items={taskListItems}
                className="task-list"
                background={true}
                border={true}
                onItemClick={() => { }}
            />
        )
    }
}


//  MINI-CARD    (AdminDashboard--> Dashboardtab.tsx)
export const MiniCard: Story = {
    render: () => {
        const installing: string = "false";

        const items: Item[] = [
            {
                title:
                    'CatalogX Pro',

                desc:
                    'Advanced product catalog with enhanced enquiry features and premium templates',

                img: 'http://localhost:8889/wp-content/plugins/multivendorx/release/assets/images/catalogx66cc71fa9b2699b52265.png',
                tags: (
                    <>
                        <span className="admin-badge red">
                            <i className="adminfont-pro-tag"></i>{' '}
                            {'Pro'}
                        </span>
                        <a
                            href="https://catalogx.com/pricing/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {'Get Pro'}
                        </a>
                    </>
                ),
            },
            {
                title:
                    'CatalogX',

                desc:
                    'Turn your store into a product catalog with enquiry-based sales',

                img: 'http://localhost:8889/wp-content/plugins/multivendorx/release/assets/images/catalogx66cc71fa9b2699b52265.png',
                tags: (
                    <>
                        <span className="admin-badge green">
                            {'Free'}
                        </span>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();

                            }}
                            style={{
                                pointerEvents:
                                    installing
                                        ? 'none'
                                        : 'auto',
                                opacity:
                                    installing ===
                                        'woocommerce-catalog-enquiry'
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            {installing ===
                                'woocommerce-catalog-enquiry'
                                ?
                                'Installing...'
                                :
                                'Install'
                            }
                        </a>
                    </>
                ),
            },
            {
                title:
                    'Notifima Pro',

                desc:
                    'Advanced stock alerts, wishlist features, and premium notification system',

                img: 'http://localhost:8889/wp-content/plugins/multivendorx/release/assets/images/brand-icon764b39a3e1176240827b.png',
                tags: (
                    <>
                        <span className="admin-badge red">
                            <i className="adminfont-pro-tag"></i>{' '}
                            {'Pro'}
                        </span>
                        <a
                            href="https://notifima.com/pricing/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {'Get Pro'}
                        </a>
                    </>
                ),
            },
            {
                title:
                    'Notifima',

                desc:
                    'Advanced stock alerts and wishlist features for WooCommerce',

                img: 'http://localhost:8889/wp-content/plugins/multivendorx/release/assets/images/brand-icon764b39a3e1176240827b.png',
                tags: (
                    <>
                        <span className="admin-badge green">
                            {'Free'}
                        </span>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (!installing) {

                                }
                            }}
                            style={{
                                pointerEvents:
                                    installing
                                        ? 'none'
                                        : 'auto',
                                opacity:
                                    installing ===
                                        'woocommerce-product-stock-alert'
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            {installing ===
                                'woocommerce-product-stock-alert'
                                ?
                                'Installing...'

                                :
                                'Install'
                            }
                        </a>
                    </>
                ),
            },
        ]

        return (
            <ItemListUI
                items={items}
                className="mini-card list"
                background={true}
                border={true}
                onItemClick={() => { }}
            />

        )
    }
}

//  PRICE-LIST   (Commissions.tsx (multivendor))
export const PriceList: Story = {
    render: () => {
        const priceListItems = [
            {
                id: 'store-earning',
                title: 'Store Earning',
                value: '$1,250.00',
            },
            {
                id: 'shipping-amount',
                title: 'Shipping Amount',
                value: '$120.00',
            },
            {
                id: 'tax-amount',
                title: 'Tax Amount',
                value: '$95.50',
            },
            {
                id: 'gateway-fee',
                title: 'Gateway Fee',
                value: '$18.75',
            },
            {
                id: 'marketplace-commission',
                title: 'Marketplace Commission',
                value: '$210.00',
            },
            {
                id: 'store-discount',
                title: 'Store Discount',
                value: '$35.00',
            },
            {
                id: 'admin-discount',
                title: 'Admin Discount',
                value: '$15.00',
            },
        ];

        return (
            <ItemListUI
                items={priceListItems}
                className="price-list"
                background={true}
                border={true}
                onItemClick={() => { }}
            />
        )
    }
}


//  NOTIFICATION    ( HeaderNotifications.tsx )
export const Notification: Story = {
    render: () => {
        // Notification items
        const [items, setItems] = useState<NotificationItem[]>([
            {
                id: 1,
                icon: 'store',
                title: 'New store registration request',
                message: 'A new vendor has submitted a store registration request for approval.',
                value: '2 mins ago',
            },
            {
                id: 2,
                icon: 'order',
                title: 'New order received',
                message: 'Order #10452 has been placed and is awaiting vendor confirmation.',
                value: '5 mins ago',
            },
            {
                id: 3,
                icon: 'refund',
                title: 'Refund request submitted',
                message: 'Customer requested a refund for Order #10431.',
                value: '12 mins ago',
            },
            {
                id: 4,
                icon: 'announcement',
                title: 'New marketplace announcement',
                message: 'Admin posted a new announcement for all store owners.',
                value: '20 mins ago',
            },
            {
                id: 5,
                icon: 'warning',
                title: 'Low stock alert',
                message: 'One or more products are running low in stock.',
                value: '32 mins ago',
            },
            {
                id: 6,
                icon: 'commission',
                title: 'Commission settings updated',
                message: 'Marketplace commission rules have been updated by the admin.',
                value: '1 hour ago',
            },
            {
                id: 7,
                icon: 'payout',
                title: 'Payout processed',
                message: 'Your weekly payout has been successfully processed.',
                value: '2 hours ago',
            },
            {
                id: 8,
                icon: 'support',
                title: 'New support ticket',
                message: 'A customer has opened a new support request for Store Support.',
                value: '3 hours ago',
            },
        ])

        const dismissItem = (id: number) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
        };

        const markRead = (id: number) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
        };

        return (
            <ItemListUI
                className="notification"
                items={items.map((item) => ({
                    id: String(item.id),
                    title: item.title,
                    desc: item.message,
                    icon: item.icon,
                    value: item.value,
                    onApprove: (clickedItem) => {
                        markRead(Number(clickedItem.id));
                    },
                    onReject: (clickedItem) => {
                        dismissItem(Number(clickedItem.id));
                    },
                }))}
            />
        );
    }
}

// CHECKLIST (Deactivated.ts, Pending.ts, PermanentlyRejected.ts, Rejected.ts)

export const CheckList: Story = {
    render: () => {
        const items: Item[] = [
            {
                title: 'Log in to dashboard',
                icon: 'check-fill',
            },
            {
                title: 'View rejection reason',
                icon: 'check-fill',
            },
            {
                title: 'Submit new application',
                icon: 'check-fill',
            },
            {
                title: 'Cannot modify products or settings',
                icon: 'cross',
            },
            {
                title: 'Cannot sell or fulfill orders',
                icon: 'cross',
            },
        ]

        return (
            <ItemListUI
                className='checklist'
                items={items}
            />
        )
    }
}

