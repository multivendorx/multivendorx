import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const StoreSettings = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});

	const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
	const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => {
				const data = res.data || {};
				setFormData((prev) => ({ ...prev, ...data }));
				setImagePreviews({
					image: data.image || '',
					banner: data.banner || '',
				});
			})
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	useEffect(() => {
		if (formData.country) {
			fetchStatesByCountry(formData.country);
		}
	}, [formData.country]);


	const fetchStatesByCountry = (countryCode: string) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `states/${countryCode}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			setStateOptions(res.data || []);
		})
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);
		autoSave(updated);
	};

	const runUploader = (key: string) => {
		const frame = (window as any).wp.media({
			title: 'Select or Upload Image',
			button: { text: 'Use this image' },
			multiple: false,
		});

		frame.on('select', function () {
			const attachment = frame.state().get('selection').first().toJSON();
			const updated = { ...formData, [key]: attachment.url };

			setFormData(updated);
			setImagePreviews((prev) => ({ ...prev, [key]: attachment.url }));
			autoSave(updated);
		});

		frame.open();
	};

	const autoSave = (updatedData: { [key: string]: string }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg('Store saved successfully!');
			}
		})
	};

	return (
		<>
			{successMsg && (
				<>
					<div className="admin-notice-wrapper">
						<i className="admin-font adminlib-icon-yes"></i>
						<div className="notice-details">
							<div className="title">Great!</div>
							<div className="desc">{successMsg}</div>
						</div>
					</div>
				</>
			)}
			<div className="container-wrapper">
				<div className="card-wrapper width-65">
					<div className="card-content">
						<div className="card-title">
							Store information
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Name</label>
								<BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
							</div>
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Slug</label>
								<BasicInput name="slug" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.slug} onChange={handleChange} />
							</div>
						</div>
					</div>

					<div className="card-content">
						<div className="card-title">
							Description
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<TextArea name="description" wrapperClass="setting-from-textarea"
									inputClass="textarea-input"
									descClass="settings-metabox-description" value={formData.description} onChange={handleChange} />
							</div>
						</div>
					</div>

					<div className="card-content">
						<div className="card-title">
							Basic information
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Phone</label>
								<BasicInput name="phone" value={formData.phone} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
							</div>
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Address</label>
								<BasicInput name="address_1" value={formData.address_1} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
							</div>
							<div className="form-group">
								<label htmlFor="product-name"></label>
								<BasicInput name="address_2" value={formData.address_2} wrapperClass="setting-form-input" descClass="settings-metabox-description" onChange={handleChange} />
							</div>
						</div>
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Country</label>
								<SelectInput
									name="country"
									value={formData.country}
									options={appLocalizer.country_list || []}
									type="single-select"
									onChange={(newValue) => {
										if (!newValue || Array.isArray(newValue)) return;
										const updated = { ...formData, country: newValue.value, state: '' }; // reset state
										setFormData(updated);
										autoSave(updated);
										fetchStatesByCountry(newValue.value);
									}}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="product-name">State</label>
								<SelectInput
									name="state"
									value={formData.state}
									options={stateOptions}
									type="single-select"
									onChange={(newValue) => {
										if (!newValue || Array.isArray(newValue)) return;
										const updated = { ...formData, state: newValue.value };
										setFormData(updated);
										autoSave(updated);
									}}
								/>
							</div>
						</div>
					</div>
					<div className="card-content">
						<div className="card-title">Social information</div>
						{/* Facebook */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="facebook">Facebook</label>
								<BasicInput
									name="facebook"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.facebook}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* x */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="twitter">X</label>
								<BasicInput
									name="twitter"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.twitter}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* LinkedIn */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="linkedin">LinkedIn</label>
								<BasicInput
									name="linkedin"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.linkedin}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* YouTube */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="youtube">YouTube</label>
								<BasicInput
									name="youtube"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.youtube}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* Instagram */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="instagram">Instagram</label>
								<BasicInput
									name="instagram"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={formData.instagram}
									onChange={handleChange}
								/>
							</div>
						</div>
					</div>
					
				</div>

				<div className="card-wrapper width-35">
					<div className="card-content">
						<div className="card-title">

						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Profile Image</label>
								<FileInput
									value={formData.image}
									inputClass="form-input"
									name="image"
									type="hidden"
									onButtonClick={() => runUploader('image')}
									imageWidth={75}
									imageHeight={75}
									openUploader="Upload Image"
									imageSrc={imagePreviews.image}
									buttonClass="admin-btn btn-purple"
									descClass="settings-metabox-description"
								/>
							</div>
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Store Banner Image</label>
								<FileInput
									value={formData.banner}
									inputClass="form-input"
									name="banner"
									type="hidden"
									onButtonClick={() => runUploader('banner')}
									imageWidth={75}
									imageHeight={75}
									openUploader="Upload Image"
									imageSrc={imagePreviews.banner}
									buttonClass="admin-btn btn-purple"
									descClass="settings-metabox-description"
								/>
							</div>
						</div>

					</div>
				</div>
			</div>
		</>
	);
};

export default StoreSettings;
