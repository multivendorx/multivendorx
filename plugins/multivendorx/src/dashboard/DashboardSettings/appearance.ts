import { __ } from '@wordpress/i18n';

export default {
    id: 'appearance',
    priority: 2,
    headerTitle: __('Appearance', 'multivendorx'),
    headerDescription: __(
        'Manage your store’s profile image, banner, and video.',
        'multivendorx'
    ),
    headerIcon: 'appearance',
    modal: [
        // Form Group Wrapper
                {
                    type: 'attachment',
                    name: 'image',
                    label: __('Profile Image', 'multivendorx'),
                    key: 'image',
                    imageSrc: "",
                    imageWidth: 75,
                    imageHeight: 75,
                    openUploader: __('Upload Image', 'multivendorx'),
                    // onChange={(val) => {
					// 		const updated = { ...formData, image: val };
					// 		setFormData(updated);
					// 		autoSave(updated);
					// 	}}

                },

                // Banner Type
                {
                    type: 'select',
                    name: 'banner_type',
                    label: __('Banner / Cover Image', 'multivendorx'),
                    key: 'banner_type',
                    options: [],
                    value: '',
                    // onChange={(newValue: any) => {
					// 		const updated = { ...formData, banner_type: newValue?.value || '' };
					// 		setFormData(updated);
					// 		autoSave(updated);
					// 	}}
                },

                // Static Banner Image (conditional)
                {
                    type: 'attachment',
                    name: 'banner',
                    label: __('Static Banner Image', 'multivendorx'),
                    key: 'banner',
                    imageWidth: 300,
                    imageHeight: 100,
                    openUploader: __('Upload Banner', 'multivendorx'),
                    // onChange={(val) => {
					// 			const updated = { ...formData, banner: val };
					// 			setFormData(updated);
					// 			autoSave(updated);
					// 		}}
                },

                // Slider Images (conditional)
                {
                    type: 'attachment',
                    name: 'banner_slider',
                    label: __('Slider Images', 'multivendorx'),
                    key: 'banner_slider',
                    multiple: true,
                    imageSrc: [],
                    imageWidth: 150,
                    imageHeight: 100,
                    openUploader: __('Upload Slider Images', 'multivendorx'),
                    // onChange={(images:string[]) => {
					// 			const updated = { ...formData, banner_slider: images };
					// 			setFormData(updated);
					// 			autoSave(updated);
					// 		}}
                    },

                // Video Banner (conditional)
                {
                    type: 'input',
                    name: 'banner_video',
                    label: __('Banner Video URL', 'multivendorx'),
                    key: 'banner_video',
                    inputType: 'text',
                    value: '',
                    // onChange={(e: any) => {
					// 			const updated = { ...formData, banner_video: e.target.value };
					// 			setFormData(updated);
					// 			autoSave(updated);
					// 		}}
					// 		readOnly={!settings.includes('store_images')}
                }
    ],
};