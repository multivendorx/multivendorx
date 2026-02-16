import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
	getApiLink,
	SuccessNotice,
	FormGroupWrapper,
	FormGroup,
	BasicInputUI,
	SelectInputUI,
	FileInputUI,
} from 'zyra';

interface FormData {
	[key: string]: any;
}

const Appearance = () => {
	const [formData, setFormData] = useState<FormData>({});
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
		if (!appLocalizer.store_id) return console.error('Missing store ID or appLocalizer');

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => {
				const data = res.data || {};

				// If banner_slider comes as a JSON string, parse it
				let bannerSliderData: string[] = [];
				if (typeof data.banner_slider === 'string') {
					try {
						bannerSliderData = JSON.parse(data.banner_slider);
					} catch (e) {
						bannerSliderData = [];
					}
				} else if (Array.isArray(data.banner_slider)) {
					bannerSliderData = data.banner_slider;
				}

				setFormData({
					...data,
					banner_slider: bannerSliderData,
				});

			})
			.catch((error) => console.error('Error loading store data:', error));
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
					<FileInputUI
						imageSrc={formData.image}
						imageWidth={75}
						imageHeight={75}
						openUploader={__('Upload Image', 'multivendorx')}
						onChange={(val) => {
							const updated = { ...formData, image: val };
							setFormData(updated);
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
						<FileInputUI
							imageSrc={formData.banner}
							imageWidth={300}
							imageHeight={100}
							openUploader={__('Upload Banner', 'multivendorx')}
							onChange={(val) => {
								const updated = { ...formData, banner: val };
								setFormData(updated);
								autoSave(updated);
							}}
						/>

					</FormGroup>
				)}

				{/* Slider Images */}
				{formData.banner_type === 'slider_image' && (
					<FormGroup label={__('Slider Images', 'multivendorx')} htmlFor="banner_slider">
						<FileInputUI
							multiple={true}
							imageSrc={formData.banner_slider || []}
							imageWidth={150}
							imageHeight={100}
							openUploader={__('Upload Slider Images', 'multivendorx')}
							onChange={(images:string[]) => {
								const updated = { ...formData, banner_slider: images };
								setFormData(updated);
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
