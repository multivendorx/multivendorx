import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	BasicInput,
	TextArea,
	FileInput,
	SelectInput,
	getApiLink,
	SuccessNotice,
	MultiCheckBox,
	ToggleSetting,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const Settings = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});

	const [imagePreviews, setImagePreviews] = useState<{
		[key: string]: string;
	}>({});
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
			setImagePreviews({
				image: data.image || '',
				banner: data.banner || '',
			});
		});
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
		});
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
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
		});
	};
	const stockStatusOptions = [
		{ value: '', label: 'Choose your preferred page...' },
		{ value: 'instock', label: 'Membership Dashboard' },
		{ value: 'outofstock', label: 'Vendor Portal' },
		{ value: 'onbackorder', label: 'Custom Page' },
	];
	return (
		<>
			<SuccessNotice message={successMsg} />
			<Container>
				<Column grid={8}>
					<Card title="Messages shown when a store’s plan is ending">
						<FormGroupWrapper>
							<FormGroup label={__('Payment Due Message', 'multivendorx')}>
								<TextArea
									name="short_description"
								// value={product.short_description}
								// onChange={(e) =>
								//     handleChange(
								//         'short_description',
								//         e.target.value
								//     )
								// }
								/>
							</FormGroup>
							<FormGroup label={__('Upcoming Renewal Reminder', 'multivendorx')}>
								<TextArea
									name="short_description"
								// value={product.short_description}
								// onChange={(e) =>
								//     handleChange(
								//         'short_description',
								//         e.target.value
								//     )
								// }
								/>
							</FormGroup>
							<FormGroup label={__('Grace Period Expiry Message', 'multivendorx')}>
								<TextArea
									name="short_description"
								// value={product.short_description}
								// onChange={(e) =>
								//     handleChange(
								//         'short_description',
								//         e.target.value
								//     )
								// }
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>

				<Column grid={4}>
					<Card title="Where stores choose their plans">
						<FormGroupWrapper>
							<FormGroup label={__('Membership plans showcase page', 'multivendorx')}>
								<SelectInput
									name="stock_status"
									options={stockStatusOptions}
									type="single-select"
								// value={product.stock_status}
								// onChange={(selected) =>
								//     handleChange(
								//         'stock_status',
								//         selected.value
								//     )
								// }
								/>
								<div className="settings-metabox-description">
									{__(
										'This page shows all plan options to stores when they sign up or upgrade their subscription.'
									)}
								</div>
							</FormGroup>
							<FormGroup label={__('Stripe Webhook URL', 'multivendorx')}>
								<BasicInput
									name="name"
									 
									descClass="settings-metabox-description"
									value={formData.name}
									onChange={handleChange}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
					<Card title="Notifications">
						<FormGroupWrapper>
							<FormGroup label={__('Send reminder', 'multivendorx')}>
								<BasicInput
									name="name"
									postText="before the plan ends"
									size="8rem"
									 
									descClass="settings-metabox-description"
									postInsideText="Days"
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default Settings;
