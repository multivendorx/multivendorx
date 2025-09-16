import { __ } from '@wordpress/i18n';
export default {
    id: 'enquiry',
    priority: 2,
    name: __( 'Enquiry', 'catalogx' ),
    desc: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'catalogx'
    ),
    icon: 'adminlib-cart',
    submitUrl: 'settings',
    modal: [
        {
            key: 'enquiry_user_permission',
            type: 'checkbox',
            label: __(
                'Restrict product enquiries for logged-in users only',
                'catalogx'
            ),
            desc: __(
                "If enabled, non-logged-in users can't access the enquiry flow.",
                'catalogx'
            ),
            options: [
                {
                    key: 'enquiry_logged_out',
                    value: 'enquiry_logged_out',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'enquiry',
        },
        {
            key: 'is_enable_out_of_stock',
            type: 'checkbox',
            label: __( 'Enquiry for out-of-stock products only', 'catalogx' ),
            desc: __(
                'Enquiry button is shown exclusively for products that are out of stock. For items that are in stock, the Add-to-Cart button will be displayed instead.',
                'catalogx'
            ),
            options: [
                {
                    key: 'is_enable_out_of_stock',
                    value: 'is_enable_out_of_stock',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'enquiry',
        },
        // This settings for notify me it works when only site off buying settings on and stock alert plugin active
        // popup - propopup, modulepopup
        {
            key: 'notify_me_button',
            type: 'checkbox',
            label: __( 'In-Stock notify me button', 'catalogx' ),
            desc: __(
                'This option allows customers to subscribe for automatic stock notifications.',
                'catalogx'
            ),
            options: [
                {
                    key: 'notify_me_button',
                    label: __( '', 'catalogx' ),
                    value: 'notify_me_button',
                },
            ],
            look: 'toggle',
            moduleEnabled: '',
            proSetting: true,
            dependentPlugin: appLocalizer.notifima_active,
            dependentSetting: 'enable_cart_checkout',
        },
        {
            key: 'is_disable_popup',
            type: 'setting-toggle',
            label: __( 'Display enquiry form as', 'catalogx' ),
            desc: __(
                'Select whether the form is displayed directly on the page or in a pop-up window.',
                'catalogx'
            ),
            options: [
                {
                    key: 'popup',
                    value: 'popup',
                    label: 'Popup',
                },
                {
                    key: 'inline',
                    value: 'inline',
                    label: 'Inline In-page',
                },
            ],
            moduleEnabled: 'enquiry',
        },
        {
            key: 'is_page_redirect',
            type: 'checkbox',
            label: __( 'Redirect after enquiry form Submission', 'catalogx' ),
            desc: __(
                'Enable this to redirect user to another page after successful enquiry submission.',
                'catalogx'
            ),
            options: [
                {
                    key: 'is_page_redirect',
                    value: 'is_page_redirect',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'enquiry',
        },
        {
            key: 'redirect_page_id',
            dependent: {
                key: 'is_page_redirect',
                set: true,
            },
            type: 'select',
            label: __( 'Post enquiry submission redirect page', 'catalogx' ),
            desc: __(
                'Select page where user will be redirected after successful enquiry.',
                'catalogx'
            ),
            options: appLocalizer.all_pages,
            moduleEnabled: 'enquiry',
        },
    ],
};
