import { __ } from '@wordpress/i18n';
import { method } from 'lodash';

export default {
	id: 'verification',
	headerTitle: __('Verification', 'multivendorx'),
	headerDescription: __('Verification', 'multivendorx'),
	headerIcon: 'verification5',
	modal: [
  // Card Wrapper
  {
    type: 'card',
    name: 'identityCard',
    wrapper: true,
    className: 'card-wrapper',
    fields: [
      // Card Content
      {
        type: 'group',
        name: 'cardContent',
        className: 'card-content',
        fields: [
          // Identity Documents Title
          {
            type: 'title',
            name: 'identityTitle',
            className: 'card-title',
            text: __('Identity Documents', 'multivendorx')
          },

          // Identity Verification Methods
        //   ...(allVerificationMethods?.['id-verification']?.verification_methods
            // ?.filter((method: any) => method.active)
            // .map((method: any, index: number) => ({
            //   type: 'group',
            //   name: `verification-${index}`,
            //   key: index,
            //   className: 'varification-wrapper',
            //   fields: [
                // Left section
                {
                  type: 'group',
                //   name: `verification-left-${index}`,
                  className: 'left',
                  fields: [
                    {
                      type: 'icon',
                    //   name: `verification-icon-${index}`,
                      icon: 'adminfont-verification3',
                      className: 'yellow'
                    },
                    {
                      type: 'text',
                    //   name: `verification-label-${index}`,
                      className: 'name',
                      text: method.label
                    },
                    // Required badge (conditional)
                    {
                      type: 'badge',
                    //   name: `verification-required-${index}`,
                    //   condition: method.required,
                      className: 'required-badge',
                      text: __('Required', 'multivendorx')
                    }
                  ]
                },
                // Right section with button
                {
                  type: 'group',
                //   name: `verification-right-${index}`,
                  className: 'right',
                  fields: [
                    {
                      type: 'button',
                    //   name: `verify-btn-${index}`,
                      className: 'admin-btn btn-purple',
                      text: __('Verify Now', 'multivendorx'),
                      onClick: () => {
                        // Add your verify click handler here
                        console.log('Verify clicked for:', method.label);
                      }
                    }
                  ]
                }
              ],},

          // Required Information Title
          {
            type: 'title',
            name: 'requiredInfoTitle',
            className: 'card-title',
            text: __('Required Information', 'multivendorx')
          },

          // Required Information Fields (placeholder)
          // Add your required information fields here as separate field objects

          // Social Profiles Title
          {
            type: 'title',
            name: 'socialProfilesTitle',
            className: 'card-title',
            text: __('Social Profiles', 'multivendorx')
          },

          // Social Verification (custom render)
          {
            type: 'custom',
            name: 'socialVerification',
            // render: renderSocialVerification
          }
        ]
      }
],
};
