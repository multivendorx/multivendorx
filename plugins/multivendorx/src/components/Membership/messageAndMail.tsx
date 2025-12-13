import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink, SuccessNotice, MultiCheckBox, ToggleSetting } from 'zyra';
import { __ } from '@wordpress/i18n';

const MessageAndMail = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});

	const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
	const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const billingCycle = [
		{ value: '', label: 'Monthly' },
		{ value: 'instock', label: 'Quarterly' },
		{ value: 'outofstock', label: 'Yearly' },
		{ value: 'onbackorder', label: 'Lifetime' },
	];

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
			<SuccessNotice message={successMsg} />
			<div className="container-wrapper">
				<div className="card-wrapper column w-65">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">Basic Plan Details</div>
							</div>
							<div className="right">
								<div className="field-wrapper">
									<ToggleSetting
										wrapperClass="setting-form-input"
										descClass="settings-metabox-description"
										options={[
											{
												key: 'draft',
												value: 'draft',
												label: __('Draft', 'multivendorx'),
											},
											{
												key: 'published',
												value: 'Published',
												label: __('Published', 'multivendorx'),
											},
										]}
									// value={formData.status}
									// onChange={handleToggleChange}
									/>
									<div className="des"><i className="adminlib-star star-icon"></i> Mark as Recommended Plan</div>
								</div>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Plan Name</label>
									<BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
								</div>
							</div>

							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Plan Description</label>
									<TextArea
										name="short_description"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">Product Limits</div>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Total Products</label>
									<BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
								</div>
								<div className="form-group">
									<label htmlFor="product-name">Gallery Images per Product</label>
									<BasicInput name="slug" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.slug} onChange={handleChange} />
								</div>
							</div>

							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Featured Products</label>
									<MultiCheckBox
										wrapperClass="toggle-btn"
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="toggle-checkbox"
										idPrefix="toggle-switch-sold-individually"
										type="checkbox"
										// value={
										// 	product.sold_individually
										// 		? ['sold_individually']
										// 		: []
										// }
										// onChange={(e) =>
										// 	handleChange(
										// 		'sold_individually',
										// 		(
										// 			e as React.ChangeEvent<HTMLInputElement>
										// 		).target.checked
										// 	)
										// }
										options={[
											{
												key: 'sold_individually',
												value: 'sold_individually',
											},
										]}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="card-wrapper column w-35">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">Pricing &Billing</div>
							</div>
						</div>
						<div className="card-body">

							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Plan Validity</label>
									<ToggleSetting
										wrapperClass="setting-form-input"
										descClass="settings-metabox-description"
										description={__(
											'Select the status of the announcement.',
											'multivendorx'
										)}
										options={[
											{
												key: 'free',
												value: 'free',
												label: __('free', 'multivendorx'),
											},
											{
												key: 'paid',
												value: 'paid',
												label: __('paid', 'multivendorx'),
											},
										]}
									// value={formData.status}
									// onChange={handleToggleChange}
									/>
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Price</label>
									<BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Billing Cycle</label>
									<SelectInput
										name="stock_status"
										options={billingCycle}
										type="single-select"
									// value={product.stock_status}
									// onChange={(selected) =>
									//     handleChange(
									//         'stock_status',
									//         selected.value
									//     )
									// }
									/>
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Validity Duration</label>
									<BasicInput name="name" postInsideText="Days" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
								</div>
							</div>
						</div>
					</div>
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">Commission Rules</div>
							</div>
						</div>
						<div className="card-body">

							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Commission Type</label>
									<ToggleSetting
										wrapperClass="setting-form-input"
										descClass="settings-metabox-description"
										description={__(
											'Select the status of the announcement.',
											'multivendorx'
										)}
										options={[
											{
												key: 'percentage',
												value: 'Percentage',
												label: __('Percentage', 'multivendorx'),
											},
											{
												key: 'fixed',
												value: 'Fixed',
												label: __('Fixed', 'multivendorx'),
											},
										]}
									// value={formData.status}
									// onChange={handleToggleChange}
									/>
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">Admin Commission Value</label>
									<BasicInput name="name" postInsideText="%" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.name} onChange={handleChange} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default MessageAndMail;