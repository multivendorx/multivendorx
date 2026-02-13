import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
	FileInput,
	getApiLink,
	SuccessNotice,
	FormGroupWrapper,
	FormGroup,
	BasicInputUI,
	SelectInputUI,
} from 'zyra';

interface FormData {
	[key: string]: any;
}

const Appearance = () => {
	const [formData, setFormData] = useState<FormData>({});
	const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string | string[] }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const settings =
		appLocalizer.settings_databases_value['store-permissions']?.edit_store_info_activation || [];

	const storeOptions = [
		{ value: 'static_image', label: 'Static Image' },
		{ value: 'slider_image', label: 'Slider Image' },
		{ value: 'video', label: 'Video' },
	];

	// Load store data
	useEffect(() => {
		if (!appLocalizer.store_id) return;

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => {
				const data = res.data || {};
				let bannerSliderData: string[] = [];

				if (typeof data.banner_slider === 'string') {
					if (data.banner_slider.startsWith('a:') || data.banner_slider.startsWith('s:')) {
						const regex = /"(https?:\/\/[^"]+)"/g;
						let match;
						while ((match = regex.exec(data.banner_slider)) !== null) {
							bannerSliderData.push(match[1]);
						}
					} else {
						try {
							bannerSliderData = JSON.parse(data.banner_slider);
						} catch (e) {
							bannerSliderData = [];
						}
					}
				} else if (Array.isArray(data.banner_slider)) {
					bannerSliderData = data.banner_slider;
				}

				setFormData({ ...data, banner_slider: bannerSliderData });
				setImagePreviews({
					image: data.image || '',
					banner: data.banner || '',
					banner_slider: bannerSliderData,
				});
			});
	}, []);

	// Auto save store data
	const autoSave = (updatedData: any) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		})
			.then((res) => {
				if (res.data.success) {
					setSuccessMsg(__('Store saved successfully!', 'multivendorx'));
					setTimeout(() => setSuccessMsg(null), 2500);
				}
			})
			.catch((error) => console.error('Save error:', error));
	};

	return (
		<>
			<SuccessNotice message={successMsg} />

			<FormGroupWrapper>
				{/* Profile Image */}
				<FormGroup label={__('Profile Image', 'multivendorx')} htmlFor="image">
					<FileInput
						imageSrc={formData.image} // Provide the current image(s)
						imageWidth={75}
						imageHeight={75}
						openUploader={__('Upload Image', 'multivendorx')}
						inputClass="form-input"
						name="image"
						multiple={false} // Set to true if this field supports multiple images
						onChange={(value) => {
							const updated = { ...formData, image: value };
							setFormData(updated);
							setImagePreviews((prev) => ({ ...prev, image: value }));
							autoSave(updated);
						}}
					/>
				</FormGroup>

				{/* Banner Type */}
				<FormGroup label={__('Banner / Cover Image', 'multivendorx')} htmlFor="banner_type">
					<SelectInputUI
						name="banner_type"
						options={storeOptions}
						value={formData.banner_type || ''}
						onChange={(newValue: any) => {
							const updated = { ...formData, banner_type: newValue?.value || '' };
							setFormData(updated);
							autoSave(updated);
						}}
					/>
				</FormGroup>

				{/* Static Banner Image */}
				{formData.banner_type === 'static_image' && (
					<FormGroup label={__('Static Banner Image', 'multivendorx')} htmlFor="banner">
						<FileInput
							name="banner"
							imageSrc={imagePreviews.banner} // Or formData.banner
							imageWidth={300}
							imageHeight={100}
							openUploader={__('Upload Banner', 'multivendorx')}
							inputClass="form-input"
							multiple={false}
							onChange={(value: string) => {
								const updated = { ...formData, banner: value };
								setFormData(updated);
								setImagePreviews((prev) => ({ ...prev, banner: value }));
								autoSave(updated);
							}}
						/>
					</FormGroup>
				)}

				{/* Slider Images */}
				{formData.banner_type === 'slider_image' && (
					<FormGroup label={__('Slider Images', 'multivendorx')} htmlFor="banner_slider">
						<FileInput
							multiple={true}
							name="banner_slider"
							imageSrc={imagePreviews.banner_slider || []}
							imageWidth={150}
							imageHeight={100}
							openUploader={__('Upload Slider Images', 'multivendorx')}
							inputClass="form-input"
							onChange={(value: string[]) => {
								const updated = { ...formData, banner_slider: value };
								setFormData(updated);
								setImagePreviews((prev) => ({ ...prev, banner_slider: value }));
								autoSave(updated);
							}}
						/>
					</FormGroup>
				)}

				{/* Video Banner */}
				{formData.banner_type === 'video' && (
					<FormGroup label={__('Banner Video URL', 'multivendorx')} htmlFor="banner_video">
						<BasicInputUI
							name="banner_video"
							type="text"
							value={formData.banner_video || ''}
							onChange={(e: any) => {
								const updated = { ...formData, banner_video: e.target.value };
								setFormData(updated);
								autoSave(updated);
							}}
							readOnly={!settings.includes('store_images')}
						/>
					</FormGroup>
				)}
			</FormGroupWrapper>
		</>
	);
};

export default Appearance;
