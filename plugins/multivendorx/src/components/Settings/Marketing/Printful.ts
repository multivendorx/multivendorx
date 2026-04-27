import { __ } from '@wordpress/i18n';

export default {
    id: 'printful',
    priority: 7,
    headerTitle: __('Printful', 'multivendorx'),
    settingTitle: 'Printful settings',
    headerDescription: __(
        'Connect your store with Printful to automate product sync, order fulfillment, and inventory updates.',
        'multivendorx'
    ),
    headerIcon: 'printful',
    submitUrl: 'settings',
    modal: [
        {
            key: 'client-id',
            type: 'text',
            label: __('Client ID','multivendorx'),
            settingDescription : __( 'Connect Printful at admin level to allow stores to access and sell Printful products.', 'multivendorx' ),
            desc: __( 'Used to identify your application when connecting with Printful.<br/>Get your API credentials from the Printful Developer settings.<br/><a href="https://developers.printful.com/docs/#section/Authentication" class="link-item" target="_blank">Printful Authentication guide <i class="adminfont-external"></i></a>', 'multivendorx' ),
            moduleEnabled: 'printful',
            proSetting: true,
        },
        {
            key: 'secret-key',
            type: 'password',
            label: __('Secret Key','multivendorx'),
            settingDescription: __( 'Secure key used to authenticate Printful connection for all stores.', 'multivendorx' ),
            desc: __( 'Keep this key private. It is required to process product sync, orders, and fulfillment via Printful.', 'multivendorx' ),
            moduleEnabled: 'printful',
            proSetting: true,
        },
        {
            key: 'app-url',
            type: 'text',
            label: __('App URL','multivendorx'),
            value: appLocalizer.site_url,
            settingDescription: __( 'The URL of your store used as the callback for Printful authentication.', 'multivendorx' ),
            desc: __( 'This URL is used during the Printful connection process. It should be your store’s base URL.<br/><a href="https://developers.printful.com/docs/#section/Authentication" class="link-item" target="_blank">Printful Authentication guide <i class="adminfont-external"></i></a>', 'multivendorx' ),
            readOnly: true,
            moduleEnabled: 'printful',
            proSetting: true,
        },
        {
            key: 'redirect-domains',
            type: 'text',
            label: __('Redirection Domains','multivendorx'),
            value: appLocalizer.site_url,
            settingDescription: __( 'List of domains allowed for redirect after Printful authentication.', 'multivendorx' ),
            desc: __( 'Specify the domains that can be used as redirect URLs after successful Printful authentication.', 'multivendorx' ),
            readOnly: true,
            moduleEnabled: 'printful',
            proSetting: true,
        }
    ],
};
