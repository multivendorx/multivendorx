import { useEffect, useState } from 'react';
import axios from 'axios';
import { SuccessNotice, getApiLink, Container, Column, Card, FormGroupWrapper, FormGroup, TextAreaUI, NavigatorHeader } from 'zyra';
import { __ } from '@wordpress/i18n';

const ShopPolicies = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);

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

	return (
		<>
			<SuccessNotice message={successMsg} />

			<NavigatorHeader
				headerTitle={__('Policy', 'multivendorx')}
				headerDescription={__('Manage your store information and preferences', 'multivendorx')}
			/>

			<Container>
				<Column>
					<Card title={__('Shipping Policy', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup label={__('Title', 'multivendorx')} htmlFor="title">
								<TextAreaUI
									name="shipping_policy"
									value={formData.shipping_policy}
									onChange={handleChange}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('Refund Policy', 'multivendorx')}>
						<FormGroupWrapper>
							<TextAreaUI
								name="refund_policy"
								value={formData.refund_policy}
								onChange={handleChange}
							/>
						</FormGroupWrapper>
					</Card>

					<Card title={__('Cancellation / Return / Exchange Policy', 'multivendorx')}>
						<FormGroupWrapper>
							<TextAreaUI
								name="cancellation_policy"
								value={formData.cancellation_policy}
								onChange={handleChange}
							/>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default ShopPolicies;
