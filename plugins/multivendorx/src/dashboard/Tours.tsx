import { __ } from '@wordpress/i18n';

interface AppLocalizer {
    site_url: string;
    admin_url?: string;
    apiUrl?: string;
    nonce?: string;
    [key: string]: unknown;
}

interface TourStep {
    selector: string;
    placement: string;
    title: string;
    description: string;
    next?: {
        link: string;
        step: number;
    };
    finish?: boolean;
}

export const getTourSteps = (appLocalizer: AppLocalizer): TourStep[] => [
    {
        selector: '.store-dashboard .analytics-container .analytics-item:first-child',
        placement: 'auto',
        title: __('Dashboard', 'multivendorx'),
        description: __(
            'Your daily snapshot - orders, revenue, commissions, all at a glance. Welcome home!',
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/dashboard/settings`,
            step: 1,
        },
    },
    {
        selector:
            '.settings-wrapper .tabs-wrapper',
        placement: 'right',
        title: __('Settings', 'multivendorx'),
        description: __(
            "Set up your store name, payouts, shipping & more - get this right once, and you're sorted!",
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/dashboard/settings`,
            step: 2,
        },
    },
    {
        selector:
            '.settings-wrapper .container-wrapper',
        placement: 'right',
        title: __('Settings', 'multivendorx'),
        description: __(
            "Set up your store name, payouts, shipping & more - get this right once, and you're sorted!",
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/dashboard/commissions`,
            step: 3,
        },
    },
    {
        selector:
            '.table-wrapper .admin-table-body .admin-row:first-child',
        placement: 'right',
        title: __('Commissions', 'multivendorx'),
        description: __(
            "Every order you earn from lives here - track what's paid, what's pending, all in one place.",
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/dashboard/withdrawls`,
            step: 4,
        },
    },
    {
        selector: '.store-withdrawals .card-wrapper:nth-child(2) .card-content',
        placement: 'right',
        title: __('Withdrawals', 'multivendorx'),
        description: __(
            "Check your available balance and request a payout — your money, whenever you're ready.",
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/dashboard/dashboard`,
            step: 5,
        },
    },
    {
        selector: '.top-navbar li:has(.popup-icon.adminfont-notification)',
        placement: 'right',
        title: __('Notifications', 'multivendorx'),
        description: __(
            'All your important updates land here - tap the bell and stay in the loop!',
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/dashboard/dashboard`,
            step: 6,
        },
    },
    {
        selector: '.top-navbar .adminfont-product-addon',
        placement: 'right',
        title: __('Add Your First Product', 'multivendorx'),
        description: __(
            "You're all set — let's list your first product and make that first sale happen!",
            'multivendorx'
        ),
        finish: true,
    },
];
