import { __ } from '@wordpress/i18n';

export default {
    id: 'store_commissions',
    priority: 1,
    name: __('Store Commissions', 'multivendorx'),
    desc: __(
        "Tailor your marketplace's commission plan to decide how much revenue stores earn from each sale.",
        'multivendorx'
    ),
    icon: 'adminlib-dynamic-pricing',
    submitUrl: 'settings',
    modal: [
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __('Commission type', 'multivendorx'),
            desc: __(
                'Choose how commission is applied:<ul><li>Store order based Commission is calculated on the total order amount for each store separately. Example: If a customer buys from three stores, commission is applied three times – once for each store order.</li><li> Per item based Commission is calculated on every single item sold, regardless of which store it belongs to. Example: If an order has five items, commission is applied five times – once for each item.</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'store_order',
                    label: __('Store order based', 'multivendorx'),
                    value: 'store_order',
                },
                {
                    key: 'per_item',
                    label: __('Per item based', 'multivendorx'),
                    value: 'per_item',
                },
            ],
        },
        {
            key: 'commission_per_store_order',
            type: 'nested',
            label: 'Commission value',
            addButtonLabel: 'Add New',
            deleteButtonLabel: 'Remove',
            nestedFields: [
                {
                    key: 'rule_type',
                    type: 'select',
                    label: 'If',
                    options: [
                        { value: 'price', label: 'Product Price' },
                        { value: 'quantity', label: 'Product Quantity' },
                        { value: 'order_value', label: 'Order Value' },
                    ],
                    skipFirstRow: true,
                },
                {
                    key: 'rule',
                    type: 'select',
                    label: 'is',
                    options: [
                        { value: 'less_than', label: 'Up To' },
                        { value: 'more_than', label: 'More than' },
                    ],
                    skipFirstRow: true,
                },
                {
                    key: 'product_price',
                    type: 'number',
                    options: [
                        {
                            key: 'product_price',
                            label: __( '$', 'multivendorx' ),
                            type: 'number',
                        },
                    ],
                    skipFirstRow: true,
                    dependent: {
                        key: 'rule_type',
                        set: true,
                        value: 'price',
                    },
                },
                {
                    key: 'product_qty',
                    type: 'number',
                    options: [
                        {
                            key: 'product_qty',
                            type: 'number',
                        },
                    ],
                    skipFirstRow: true,
                    dependent: {
                        key: 'rule_type',
                        set: true,
                        value: 'quantity',
                    },
                },
                {
                    key: 'order_value',
                    type: 'number',
                    options: [
                        {
                            key: 'order_value',
                            label: __( '$', 'multivendorx' ),
                            type: 'number',
                        },
                    ],
                    skipFirstRow: true,
                    dependent: {
                        key: 'rule_type',
                        set: true,
                        value: 'order_value',
                    },
                },
                {
                    key: 'commission_per_store_order',
                    type: 'multi-number',
                    label: __('Store commission will be', 'multivendorx'),
                    skipLabel:true,
                    desc: __(
                        'This is the default commission amount that will be applicable for all transactions.',
                        'multivendorx'
                    ),
                    options: [
                        {
                            key: 'commission_percentage',
                            label: __('%', 'multivendorx'),
                            type: 'number',
                            labelAfterInput: true,
                        },
                        {
                            key: 'commission_fixed',
                            label: __('$', 'multivendorx'),
                            type: 'number',
                            labelAfterInput: false,
                        },
                    ],
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'store_order',
            },
        },
        {
            key: 'commission_per_item',
            type: 'multi-number',
            label: __( 'Commission Value', 'multivendorx' ),
            desc: __(
                'This is the default commission amount that will be applicable for all transactions.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'commission_percentage',
                    label: __( '%', 'multivendorx' ),
                    type: 'number',
                    labelAfterInput:true
                },
                {
                    key: 'commission_fixed',
                    label: __( '$', 'multivendorx' ),
                    type: 'number',
                    labelAfterInput:false
                },                
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'per_item',
            },
        },

        {
            key: 'separator_content',
            type: 'section',
            hint: __("What's included along with store commission", 'multivendorx'),
            desc: __('Choose which order components are factored into commission calculations', 'multivendorx')
        },
        {
            key: 'give_shipping',
            label: __('Shipping amount', 'multivendorx'),
			settingDescription: __( 'This option determines whether shipping charges are included when calculating commission.', 'multivendorx' ),
            desc: __(
                'If enabled, vendor’s net earning will include both commission and shipping fees.','multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'give_shipping',
                    value: 'give_shipping',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'commission_calculation_on_tax',
            type: 'setting-toggle',
            label: __('Tax amount', 'multivendorx'),
            desc: __(
                'Configure how taxes are treated in commission calculations:<li>No Tax Inclusion: Calculate commission on pre-tax amount only.<li>100% Tax Inclusion: Include full tax amount in commission base.<li>Commission-Based Tax: Calculate commission on total order value including taxes, not just product price',
                'multivendorx'
            ),
            options: [
                {
                    key: 'per_transaction',
                    label: __('No tax', 'multivendorx'),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __('Full tax', 'multivendorx'),
                    value: 'per_unit',
                },
                {
                    key: 'per_store',
                    label: __('Commision based tax', 'multivendorx'),
                    value: 'per_store',
                },
            ],
        },

    ],
};
