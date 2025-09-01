import { __ } from '@wordpress/i18n';
import payPal from '../../../assets/images/paypal.png';

const methods = Object.entries(appLocalizer.all_payments).map(([key, value]) => {
    return value;
});

export default {
    id: 'payment-integration',
    priority: 3,
    name: __( 'Disbursement Method', 'multivendorx' ),
    desc: __(
        "Choose which payment integrations to enable for store payouts",
        'multivendorx'
    ),
    icon: payPal,
    submitUrl: 'settings',
    wrapperClass: 'form-wrapper',
    modal: [
        {
            key: 'payment_methods',
            type: 'payment-tabs',
            buttonEnable:true,
            toggleType:'icon',
            modal: methods
        }
        
    ],
};
