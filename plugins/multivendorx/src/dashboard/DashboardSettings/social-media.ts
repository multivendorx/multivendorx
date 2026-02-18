import { __ } from '@wordpress/i18n';

export default {
	id: 'social-media',
	headerTitle: __('Social Media', 'multivendorx'),
	headerDescription: __(
		'Add your store’s social media links to help buyers connect with you across platforms.',
		'multivendorx'
	),
	headerIcon: 'cohort',
	modal: [
  // Facebook
  {
    type: 'text',
    group: true,
    // wrapperClass: 'form-group-wrapper',
    name: 'facebook',
    label: 
    //   <>
    //     <i className="adminfont-facebook-fill"></i>{' '}
        __('Facebook', 'multivendorx')
    //   </>
    // ),
    // htmlFor: 'facebook',
    // value: formData.facebook,
    // onChange: (value: string) => handleChange('facebook', value)
  },

  // X / Twitter
  {
    type: 'text',
    group: true,
    wrapperClass: 'form-group-wrapper',
    name: 'twitter',
    label: 
    //   <>
    //     <i className="adminfont-twitter"></i>{' '}
        __('X', 'multivendorx')
    //   </>
    // ),
    // htmlFor: 'twitter',
    // value: formData.twitter,
    // onChange: (value: string) => handleChange('twitter', value)
  },

  // LinkedIn
  {
    type: 'text',
    group: true,
    wrapperClass: 'form-group-wrapper',
    name: 'linkedin',
    label: __('LinkedIn', 'multivendorx')
    // label: (
    //   <>
    //     <i className="adminfont-linkedin-border"></i>{' '}
    //     {__('LinkedIn', 'multivendorx')}
    //   </>
    // ),
    // htmlFor: 'linkedin',
    // value: formData.linkedin,
    // onChange: (value: string) => handleChange('linkedin', value)
  },

  // YouTube
  {
    type: 'text',
    group: true,
    wrapperClass: 'form-group-wrapper',
    name: 'youtube',
    label: __('YouTube', 'multivendorx')
    // label: (
    //   <>
    //     <i className="adminfont-youtube"></i>{' '}
    //     {__('YouTube', 'multivendorx')}
    //   </>
    // ),
    // htmlFor: 'youtube',
    // value: formData.youtube,
    // onChange: (value: string) => handleChange('youtube', value)
  },

  // Instagram
  {
    type: 'text',
    group: true,
    wrapperClass: 'form-group-wrapper',
    name: 'instagram',
	label: __('Instagram', 'multivendorx')
    // label: (
    //   <>
    //     <i className="adminfont-mail"></i>{' '}
    //     {__('Instagram', 'multivendorx')}
    //   </>
    // ),
    // htmlFor: 'instagram',
    // value: formData.instagram,
    // onChange: (value: string) => handleChange('instagram', value)
  },

  // Pinterest
  {
    type: 'text',
    group: true,
    wrapperClass: 'form-group-wrapper',
    name: 'pinterest',
	label: __('Pinterest', 'multivendorx')
    // label: (
    //   <>
    //     <i className="adminfont-mail"></i>{' '}
    //     {__('Pinterest', 'multivendorx')}
    //   </>
    // ),
    // htmlFor: 'pinterest',
    // value: formData.pinterest,
    // onChange: (value: string) => handleChange('pinterest', value)
  },

  // Success Notice
  {
    type: 'notice',
    name: 'successNotice',
    // message: successMsg
  }
],
};
