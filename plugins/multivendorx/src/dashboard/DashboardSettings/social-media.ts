import { __ } from '@wordpress/i18n';

export default {
	id: 'social-media',
	headerTitle: __('Social Media', 'multivendorx'),
	headerDescription: __(
		'Add your store’s social media links to help buyers connect with you across platforms.',
		'multivendorx'
	),
	headerIcon: 'cohort',
  submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
  // Facebook
  {
    type: 'text',
    name: 'facebook',
    icon: 'facebook-fill',
    label: __('Facebook', 'multivendorx'),
  },

  // X / Twitter
  {
    type: 'text',
    wrapperClass: 'form-group-wrapper',
    name: 'twitter',
    icon: 'adminfont-twitter',
    label: __('X', 'multivendorx')
  },

  // LinkedIn
  {
    type: 'text',
    wrapperClass: 'form-group-wrapper',
    name: 'linkedin',
    icon: 'adminfont-linkedin-border',
    label: __('LinkedIn', 'multivendorx')
  },

  // YouTube
  {
    type: 'text',
    wrapperClass: 'form-group-wrapper',
    name: 'youtube',
    icon: 'adminfont-youtube',
    label: __('YouTube', 'multivendorx')
  },

  // Instagram
  {
    type: 'text',
    wrapperClass: 'form-group-wrapper',
    name: 'instagram',
    icon: 'adminfont-mail',
	  label: __('Instagram', 'multivendorx')
  },

  // Pinterest
  {
    type: 'text',
    wrapperClass: 'form-group-wrapper',
    name: 'pinterest',
    icon: 'adminfont-mail',
	  label: __('Pinterest', 'multivendorx')
  },
],
};
