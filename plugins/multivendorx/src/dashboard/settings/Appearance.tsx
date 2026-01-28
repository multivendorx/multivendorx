import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
	BasicInput,
	FileInput,
	SelectInput,
	getApiLink,
	SuccessNotice,
	FormGroupWrapper,
	FormGroup,
} from 'zyra';

interface FormData {
	[key: string]: any;
}

const Appearance = () => {
	const [formData, setFormData] = useState<FormData>({});
	const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string | string[] }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const settings =
		appLocalizer.settings_databases_value['store-capability']?.edit_store_info_activation || [];

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
	
				setImagePreviews({
					image: data.image || '',
					banner: data.banner || '',
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

	// Open WordPress media uploader
	const runUploader = (key: string, allowMultiple = false) => {
		if (!settings.includes('store_images')) return;

		const frame = (window as any).wp.media({
			title: __('Select or Upload Image', 'multivendorx'),
			button: { text: __('Use this image', 'multivendorx') },
			multiple: allowMultiple,
		});

		frame.on('select', function () {
			const selection = frame.state().get('selection').toJSON();
			const urls = selection.map((att: any) => att.url);

			setFormData((prev) => {
				const prevImages = Array.isArray(prev[key]) ? prev[key] : [];
				const updatedImages = allowMultiple ? [...prevImages, ...urls] : urls[0];
				return { ...prev, [key]: updatedImages };
			});

			setImagePreviews((prev) => {
				const prevImages = Array.isArray(prev[key]) ? prev[key] : [];
				const updatedImages = allowMultiple ? [...prevImages, ...urls] : urls[0];
				return { ...prev, [key]: updatedImages };
			});

			autoSave({
				...formData,
				[key]: allowMultiple ? [...(formData[key] || []), ...urls] : urls[0],
			});
		});

		frame.open();
	};

	return (
		<>
			<SuccessNotice message={successMsg} />

			<FormGroupWrapper>
				{/* Profile Image */}
				<FormGroup label={__('Profile Image', 'multivendorx')} htmlFor="image">
					<FileInput
						value={formData.image}
						inputClass="form-input"
						name="image"
						type="hidden"
						onButtonClick={() => runUploader('image')}
						imageWidth={75}
						imageHeight={75}
						openUploader={__('Upload Image', 'multivendorx')}
						imageSrc={imagePreviews.image}
						onRemove={() => {
							const updated = { ...formData, image: '' };
							setFormData(updated);
							setImagePreviews((prev) => ({ ...prev, image: '' }));
							autoSave(updated);
						}}
						onReplace={() => runUploader('image')}
					/>
				</FormGroup>

				{/* Banner Type */}
				<FormGroup label={__('Banner / Cover Image', 'multivendorx')} htmlFor="banner_type">
					<SelectInput
						name="banner_type"
						type="single-select"
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
							value={formData.banner}
							inputClass="form-input"
							name="banner"
							type="hidden"
							onButtonClick={() => runUploader('banner')}
							imageWidth={300}
							imageHeight={100}
							openUploader={__('Upload Banner', 'multivendorx')}
							imageSrc={imagePreviews.banner}
							onRemove={() => {
								const updated = { ...formData, banner: '' };
								setFormData(updated);
								setImagePreviews((prev) => ({ ...prev, banner: '' }));
								autoSave(updated);
							}}
							onReplace={() => runUploader('banner')}
						/>
					</FormGroup>
				)}

				{/* Slider Images */}
				{formData.banner_type === 'slider_image' && (
					<FormGroup label={__('Slider Images', 'multivendorx')} htmlFor="banner_slider">
						<FileInput
							multiple={true}
							value={formData.banner_slider || []}
							inputClass="form-input"
							name="banner_slider"
							type="hidden"
							onButtonClick={() => runUploader('banner_slider', true)}
							imageWidth={150}
							imageHeight={100}
							openUploader={__('Upload Slider Images', 'multivendorx')}
							imageSrc={imagePreviews.banner_slider || []}
							onChange={(images: string[]) => {
								const updated = { ...formData, banner_slider: images };
								setFormData(updated);
								setImagePreviews((prev) => ({ ...prev, banner_slider: images }));
								autoSave(updated);
							}}
							onRemove={() => {
								const updated = { ...formData, banner_slider: [] };
								setFormData(updated);
								setImagePreviews((prev) => ({ ...prev, banner_slider: [] }));
								autoSave(updated);
							}}
						/>
					</FormGroup>
				)}

				{/* Video Banner */}
				{formData.banner_type === 'video' && (
					<FormGroup label={__('Banner Video URL', 'multivendorx')} htmlFor="banner_video">
						<BasicInput
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
