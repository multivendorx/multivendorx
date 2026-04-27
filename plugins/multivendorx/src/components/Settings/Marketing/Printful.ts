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
            desc: __( 'Keep this key private. It is required to process product sync, orders, and fulfillment via Printful', 'multivendorx' ),
            moduleEnabled: 'printful',
            proSetting: true,
        },
        {
            key: 'app-url',
            type: 'copy-to-clipboard',
            label: __('App URL','multivendorx'),
            text: appLocalizer.site_url,
            settingDescription: __( 'The base URL of your store that Printful uses to identify and communicate with your application.', 'multivendorx' ),
            desc: __('This should match the URL registered in your Printful OAuth app settings. In production, use your live store URL (e.g. https://yourstore.com).', 'multivendorx'),
        },
        {
            key: 'redirect-domains',
            type: 'copy-to-clipboard',
            label: __('Redirection Domains','multivendorx'),
            text: appLocalizer.site_url,
            settingDescription: __( 'Domains authorized to receive OAuth callbacks from Printful after vendor authentication.', 'multivendorx' ),
            desc: __('Only requests originating from these domains will be accepted during the OAuth flow. Add your production domain before going live to prevent authentication failures', 'multivendorx'),
        }
    ],
};
