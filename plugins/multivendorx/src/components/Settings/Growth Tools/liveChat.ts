import { __ } from '@wordpress/i18n';

export default {
    id: 'live-chat',
    priority: 3,
    name: __('Live Chat', 'multivendorx'),
    desc: __('Set up and manage live chat options for customer interaction.', 'multivendorx'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'product_page_chat',
            type: 'setting-toggle',
            label: __('Chat button position', 'multivendorx'),
            desc: __('Choose where the chat button will appear on product pages.', 'multivendorx'),
            options: [
                {
                    key: 'add_to_cart_button',
                    label: __('Next to Add to Cart button', 'multivendorx'),
                    value: 'add_to_cart_button',
                },
                {
                    key: 'store_info',
                    label: __('Inside Store details tab', 'multivendorx'),
                    value: 'store_info',
                },
                {
                    key: 'none',
                    label: __('Do not display', 'multivendorx'),
                    value: 'none',
                },
            ],
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'chat_provider',
            type: 'setting-toggle',
            label: __('Chat platform integration', 'multivendorx'),
            desc: __('Select the chat provider you want to connect with your store.', 'multivendorx'),
            options: [
                {
                    key: 'facebook',
                    label: __('Facebook Messenger', 'multivendorx'),
                    value: 'facebook',
                },
                {
                    key: 'talkjs',
                    label: __('TalkJS', 'multivendorx'),
                    value: 'talkjs',
                },
                {
                    key: 'whatsapp',
                    label: __('WhatsApp', 'multivendorx'),
                    value: 'whatsapp',
                },
            ],
            //proSetting:true
        },
        {
            key: 'messenger_color',
            type: 'color',
            label: __('Messenger theme color', 'multivendorx'),
            desc: __('Pick a theme color for your Facebook Messenger chat window.', 'multivendorx'),
            dependent: {
                key: 'chat_provider',
                set: true,
                value: 'facebook',
            },
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'whatsapp_opening_pattern',
            type: 'setting-toggle',
            label: __('WhatsApp opening pattern', 'multivendorx'),
            desc: __('Choose whether WhatsApp chats open in browser or app.', 'multivendorx'),
            options: [
                {
                    key: 'browser',
                    label: __('Open in browser', 'multivendorx'),
                    value: 'browser',
                },
                {
                    key: 'app',
                    label: __('Open in WhatsApp app', 'multivendorx'),
                    value: 'app',
                },
            ],
            dependent: {
                key: 'chat_provider',
                set: true,
                value: 'whatsapp',
            },
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'whatsapp_pre_filled',
            type: 'textarea',
            label: __('Pre-filled WhatsApp message', 'multivendorx'),
            desc: __('Define default text for the WhatsApp chat window. You can use variables {store_name} and {store_url}.', 'multivendorx'),
            dependent: {
                key: 'chat_provider',
                set: true,
                value: 'whatsapp',
            },
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'app_id',
            type: 'text',
            label: __('TalkJS App ID', 'multivendorx'),
            desc: __('Enter the App ID provided in your TalkJS dashboard.', 'multivendorx'),
            dependent: {
                key: 'chat_provider',
                set: true,
                value: 'talkjs',
            },
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
        {
            key: 'app_secret',
            type: 'text',
            label: __('TalkJS App Secret', 'multivendorx'),
            desc: __(
                'Enter the App Secret from your TalkJS dashboard. You can retrieve both the App ID and Secret from your TalkJS account settings.',
                'multivendorx'
            ),
            dependent: {
                key: 'chat_provider',
                set: true,
                value: 'talkjs',
            },
            moduleEnabled: 'live-chat',
            proSetting: true,
        },
    ],
};
