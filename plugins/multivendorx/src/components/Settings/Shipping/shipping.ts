import { __ } from '@wordpress/i18n';

export default {
    id: 'shipping',
    priority: 1,
    name: __('Shipping', 'multivendorx'),
    desc: __(
        'Choose whether stores follow a step-by-step guided process through the category hierarchy or freely select multiple categories & subcategories without restrictions.', 'multivendorx'
    ),
    icon: 'adminlib-shipping',
    submitUrl: 'settings',
    modal: [
        {
            key: 'shipping_modules',
            type: 'payment-tabs',
            label: __('Shipping methods available to stores ', 'multivendorx'),
            desc: __('See which shipping options your stores can offer to customers. Each method determines how shipping costs are calculated.', 'multivendorx'),
            buttonEnable: true,
            toggleType: 'icon',
            modal: [
                {
                    id: "zone-wise-shipping",
                    icon: "adminlib-zone-wise-shipping",
                    label: "Zone based shipping",
                    disableBtn: true,
                    moduleEnabled: 'store-shipping',
                    proSetting:true,
                    enableOption: true,
                    desc: "Stores can configure multiple shipping zones.",
                    formFields: [
                        {
                            key: "zones",
                            type: "clickable-list",
                            label: "Shipping Zones",
                            desc: "Create shipping zones in WooCommerce → Shipping using the ‘Add Zone’ button. Assign the shipping method ‘Store shipping’ to let each store set its own shipping costs for that zone.",
                            items: appLocalizer.all_zones,
                            button: {
                              label: "Add New Zone",
                              url: `${appLocalizer.adminUrl}/admin.php?page=wc-settings&tab=shipping`
                            }
                          }
                    ]
                },
                {
                    id: "country-wise-shipping",
                    icon: "adminlib-country-shipping",
                    label: "Country-wise shipping",
                    moduleEnabled: 'store-shipping',
                    disableBtn: true,
                    proSetting:true,
                    enableOption: true,
                    desc: "Let store set specific shipping rates based on destination countries.",
                    formFields: [
                        {
                            key: "country_shipping_method_name",
                            type: "text",
                            label: "Method name",
                            placeholder: "Enter Name"
                        }
                    ]
                },
                {
                    id: "distance-based-shipping",
                    icon: "adminlib-distance-shipping",
                    label: "Distance-based shipping",
                    disableBtn: true,
                    enableOption: true,
                    proSetting:true,
                    moduleEnabled: 'store-shipping',
                    desc: "Calculate shipping costs based on actual distance between locations.",
                    formFields: [
                        {
                            key: "distance_shipping_method_name",
                            type: "text",
                            label: "Method name",
                            placeholder: "Enter Name"
                        }
                    ]
                }
            ]
        },
        {
            key: 'disbursement_order_status',
            type: 'checkbox',
            label: __(' Shipping carriers', 'multivendorx'),
            settingDescription: __(" Choose which shipping providers stores can use. Only the carriers you enable will be available for sellers to ship their products and add tracking details. This helps keep all shipments through trusted, approved providers.", 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            addNewBtn: 'Add Custom Provider',
            options: [
                {
                    key: 'completed',
                    label: __('Australia post', 'multivendorx'),
                    value: 'completed',
                },
                {
                    key: 'delivered',
                    label: __('Canada post', 'multivendorx'),
                    value: 'delivered',
                },
                {
                    key: 'shipped',
                    label: __('City link', 'multivendorx'),
                    value: 'shipped',
                },
                {
                    key: 'processing',
                    label: __('DHL', 'multivendorx'),
                    value: 'DHL',
                },
                {
                    key: 'processing',
                    label: __('Fastway South Africa', 'multivendorx'),
                    value: 'fastway-south-africa',
                },
                {
                    key: 'processing',
                    label: __('FedEx', 'multivendorx'),
                    value: 'FedEx',
                },
                {
                    key: 'processing',
                    label: __('OnTrac', 'multivendorx'),
                    value: 'FedOnTracEx',
                },
                {
                    key: 'processing',
                    label: __('Polish shipping providers', 'multivendorx'),
                    value: 'FedOnTracEx',
                },
            ],
            selectDeselect: true,
        },
    ],
};
