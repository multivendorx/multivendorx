import { __ } from '@wordpress/i18n';

const nestedFields = [
  {
    key: 'open_hour',
    type: 'number',
    label: __('Open Hour', 'multivendorx'),
    placeholder: 'HH',
    size: '5rem',
    min: 1,
    max: 12,
    preText: __('Open', 'multivendorx'),
    postText: ':',
    className: 'time-field hour-field'
  },
  {
    key: 'open_minute',
    type: 'number',
    label: __('Open Minute', 'multivendorx'),
    placeholder: 'MM',
    size: '5rem',
    min: 0,
    max: 59,
    postText: ':',
    className: 'time-field minute-field'
  },
  {
    key: 'open_ampm',
    type: 'select',
    label: __('Open AM/PM', 'multivendorx'),
    options: [
      { value: 'AM', label: 'AM' },
      { value: 'PM', label: 'PM' }
    ],
    size: '5rem',
    postText: '--',
    className: 'time-field ampm-field'
  },
  {
    key: 'close_hour',
    type: 'number',
    label: __('Close Hour', 'multivendorx'),
    placeholder: 'HH',
    size: '5rem',
    min: 1,
    max: 12,
    preText: __('Close', 'multivendorx'),
    postText: ':',
    className: 'time-field hour-field'
  },
  {
    key: 'close_minute',
    type: 'number',
    label: __('Close Minute', 'multivendorx'),
    placeholder: 'MM',
    size: '5rem',
    min: 0,
    max: 59,
    postText: ':',
    className: 'time-field minute-field'
  },
  {
    key: 'close_ampm',
    type: 'select',
    label: __('Close AM/PM', 'multivendorx'),
    options: [
      { value: 'AM', label: 'AM' },
      { value: 'PM', label: 'PM' }
    ],
    size: '5rem',
    className: 'time-field ampm-field'
  }
];

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
    {
      type: 'select',
      name: 'store_timezone',
      label: __('Store Timezone', 'multivendorx'),
      options: [
        { value: '', label: 'Eastern Time (ET)' },
        { value: 'instock', label: 'Central Time (CT)' },
        { value: 'outofstock', label: 'Mountain Time (MT)' },
        { value: 'onbackorder', label: 'Pacific Time (PT)' },
        { value: 'onbackorder', label: 'London (GMT)' },], // Add your timezone options here
    },
    {
      type: 'nested',
      name: 'shop_timings',
      label: __('Shop Open & Close Timings', 'multivendorx'),
      id: 'role_rules',
      nestedFields: nestedFields, // Reference to your nestedFields object
      addButtonLabel: __('Add Hours', 'multivendorx'),
      deleteButtonLabel: __('Remove', 'multivendorx'),
      single: false,
    },
    {
      type: 'textarea',
      name: 'closed_message',
      label: __('Message When Shop is Closed', 'multivendorx'),
      placeholder: '', // Add placeholder text if needed
    }
  ],
};
