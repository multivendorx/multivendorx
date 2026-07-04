import { __ } from '@wordpress/i18n';

export default {
    category: true,
    tab: 'modules',
    modules: [
        {
            id: 'catalog',
            name: __('Catalog Showcase', 'catalogx'),
            desc: "Ideal for showcasing products by hiding prices, disabling purchases, and restricting cart/checkout access.",
            docLink:
                'https://catalogx.com/docs/catalog/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
            settingsLink: `${appLocalizer.admin_url}#&tab=settings&subtab=customer-engagement`,
            proModule: true,
        },
        {
            id: 'enquiry',
            name: __('Enquiry & Communication', 'catalogx'),
            desc: "Add enquiry button for single product email enquiries to admin. Add enquiry button for single product email enquiries to admin. ",
            docLink:
                'https://catalogx.com/docs/enquiry-communication/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
            settingsLink: `${appLocalizer.admin_url}#&tab=settings&subtab=customer-engagement`,
            proModule: false,
        },
        {
            id: 'quote',
            name: __('Quotation', 'catalogx'),
            desc: "Let customers request custom quotes for products. Ideal for B2B and bulk pricing.",
            docLink:
                'https://catalogx.com/docs/quotation/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
            settingsLink: `${appLocalizer.admin_url}#&tab=settings&subtab=customer-engagement`,
            proModule: false,
        },
        {
            id: 'wholesale',
            name: __('Wholesale Pricing', 'catalogx;'),
            desc: "Offer tiered pricing based on quantity or user roles for wholesale buyers.",
            docLink:
                'https://catalogx.com/docs/wholesale-pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
            settingsLink: `${appLocalizer.admin_url}#&tab=settings&subtab=wholesale`,
            proModule: true,
        },
        {
            id: 'rules',
            name: __('Dynamic Pricing Rules', 'catalogx'),
            desc: "Apply rule-based pricing like discounts or markups based on cart, quantity, or user conditions. ",
            docLink:
                'https://catalogx.com/docs/dynamic-pricing-rules/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
            settingsLink: `${appLocalizer.admin_url}#&tab=rules`,
            proModule: true,
        },
    ],
};
