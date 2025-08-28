import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const SocialSettings = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<Record<string, any>>({});

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
		const updated = { ...formData, [name]: value ?? "" };
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
		console.log(updatedData)

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			console.log(res)
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

						{/* Twitter */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="twitter">Twitter</label>
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
			</div>
		</>
	);
};

export default SocialSettings;
