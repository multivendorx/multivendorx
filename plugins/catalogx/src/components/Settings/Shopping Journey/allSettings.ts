import { __, sprintf } from '@wordpress/i18n';
export default {
    id: 'all-settings',
    priority: 1,
    name: __( 'Shopping', 'catalogx' ),
    desc: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'catalogx'
    ),
    icon: 'adminfont-cart',
    submitUrl: 'settings',
    modal: [
        {
            key: 'enable_cart_checkout',
            type: 'checkbox',
            label: __( 'Sitewide buy mode', 'catalogx' ),
            desc: sprintf(
                /* translators: %s will be replaced with a link to CatalogX Pro */
                __(
                    'Enabling this setting with CatalogX activates the catalog-only mode on your site, preventing customers from making purchases. To allow purchasing functionality, upgrade to %s and enable this setting to activate the buying mode.',
                    'catalogx'
                ),
                '<a href="' +
                    appLocalizer.pro_url +
                    '" target="_blank">CatalogX Pro</a>'
            ),
            options: [
                {
                    key: 'enable_cart_checkout',
                    value: 'enable_cart_checkout',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'catalog',
        },
        {
            key: 'redirect_cart_page',
            type: 'select',
            label: __( 'Cart / Checkout Redirect Page', 'catalogx' ),
            options: [
                {
                    value: '',
                    label: 'Home',
                    key: '',
                },
                ...appLocalizer.all_pages,
            ],
            dependent: {
                key: 'enable_cart_checkout',
                set: false,
            },
            desc: sprintf(
                /* translators: %s will be replaced with a link to CatalogX Pro */
                __(
                    'Redirect users to the homepage when they click on the cart or checkout page. To customize the redirection to a different page, an upgrade to %s is required.',
                    'catalogx'
                ),
                '<a href="' +
                    appLocalizer.pro_url +
                    '" target="_blank">CatalogX Pro</a>'
            ),

            proSetting: true,
            moduleEnabled: 'catalog',
        },
    ],
};
