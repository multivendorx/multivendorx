import { __ } from '@wordpress/i18n';

const storeOptions = [
		{ value: 'static_image', label: 'Static Image' },
		{ value: 'slider_image', label: 'Slider Image' },
		{ value: 'video', label: 'Video' },
	];

export default {
    id: 'appearance',
    priority: 2,
    headerTitle: __('Appearance', 'multivendorx'),
    headerDescription: __(
        'Manage your store’s profile image, banner, and video.',
        'multivendorx'
    ),
    headerIcon: 'appearance',
    submitUrl: `store/${appLocalizer.store_id}`,
    modal: [
        // Form Group Wrapper
                {
                    type: 'attachment',
                    label: __('Profile Image', 'multivendorx'),
                    key: 'image',
                    imageWidth: 75,
                    imageHeight: 75,
                    openUploader: __('Upload Image', 'multivendorx'),
                },

                // Banner Type
                {
                    type: 'select',
                    label: __('Banner / Cover Image', 'multivendorx'),
                    key: 'banner_type',
                    options: storeOptions,
                },

                // Static Banner Image (conditional)
                {
                    type: 'attachment',
                    label: __('Static Banner Image', 'multivendorx'),
                    key: 'banner',
                    imageWidth: 300,
                    imageHeight: 100,
                    openUploader: __('Upload Banner', 'multivendorx'),
                    dependent: {
                        key: 'banner_type',
                        set: true,
                        value: 'static_image',
                    },
                },

                // Slider Images (conditional)
                {
                    type: 'attachment',
                    label: __('Slider Images', 'multivendorx'),
                    key: 'banner_slider',
                    multiple: true,
                    imageWidth: 150,
                    imageHeight: 100,
                    openUploader: __('Upload Slider Images', 'multivendorx'),
                    dependent: {
                        key: 'banner_type',
                        set: true,
                        value: 'slider_image',
                    },
                },

                // Video Banner (conditional)
                {
                    type: 'text',
                    label: __('Banner Video URL', 'multivendorx'),
                    key: 'banner_video',
                    dependent: {
                        key: 'banner_type',
                        set: true,
                        value: 'video',
                    },
                }
    ],
};