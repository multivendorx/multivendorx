import { __ } from '@wordpress/i18n';

export default {
  id: 'business-hours',
  priority: 5,
  headerTitle: __('Business Hours', 'multivendorx'),
  headerDescription: __(
    'Manage your store’s shipping method, pricing rules, and location-based rates.',
    'multivendorx'
  ),
  headerIcon: 'shipping',
  submitUrl: `store/${appLocalizer.store_id}`,
  modal: [
    // Add to Cart Button Text
    {
      type: 'input',
      name: 'addToCartText',
      label: __('"Add to Cart" Button Text', 'multivendorx'),
      inputType: 'text',
      value: '',
    },

    // Notification Message
    {
      type: 'textarea',
      name: 'notificationMessage',
      label: __('Notification Message', 'multivendorx'),
      value: '',
    },

    // Quick Presets Toggle
    {
      type: 'toggle',
      name: 'quickPresets',
      label: __('Quick presets', 'multivendorx'),
      options: [
        {
          key: '1d',
          value: '1d',
          label: __('1d', 'multivendorx'),
          desc: __('Same', 'multivendorx')
        },
        {
          key: '3d',
          value: '3d',
          label: __('3d', 'multivendorx'),
          desc: __('Short', 'multivendorx')
        },
        {
          key: '7d',
          value: '7d',
          label: __('7d', 'multivendorx'),
          desc: __('1 week', 'multivendorx')
        },
        {
          key: '14d',
          value: '14d',
          label: __('14d', 'multivendorx'),
          desc: __('2 week', 'multivendorx')
        },
        {
          key: '30d',
          value: '30d',
          label: __('30d', 'multivendorx'),
          desc: __('1 month', 'multivendorx')
        }
      ]
    },

    // Notify Via Toggle
    {
      type: 'toggle',
      name: 'notifyVia',
      label: __('Notify via', 'multivendorx'),
      options: [
        {
          key: 'store_banner',
          value: 'store_banner',
          label: __('Store banner', 'multivendorx')
        },
        {
          key: 'email',
          value: 'email',
          label: __('Email', 'multivendorx')
        },
        {
          key: 'sms',
          value: 'sms',
          label: __('SMS', 'multivendorx')
        }
      ]
    }
  ],
};