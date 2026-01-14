/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextArea, SuccessNotice, getApiLink, Container, Column, Card, FormGroupWrapper, FormGroup } from 'zyra';
import { __ } from '@wordpress/i18n';

const PolicySettings = ({ id, data }: { id: string | null; data: any }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) {
			return;
		}
		if (data) {
			setFormData(data);
		}
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e?.target;

		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: value ?? '',
			};
			autoSave(updated);
			return updated;
		});
	};

	const autoSave = (updatedData: { [key: string]: string }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg(__('Store saved successfully!', 'multivendorx'));
			}
		});
	};

	return (
		<>
			<SuccessNotice message={successMsg} />

			<Container>
				<Column row>
					<Card title="Store policy">
						<FormGroupWrapper>
							<TextArea
								name="store_policy"
								value={formData.store_policy}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer
										.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
					<Card title="Shipping policy">
						<FormGroupWrapper>
							<TextArea
								name="shipping_policy"
								value={formData.shipping_policy}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer
										.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
				</Column>
				<Column row>
					<Card title="Refund policy">
						<FormGroupWrapper>
							<TextArea
								name="refund_policy"
								value={formData.refund_policy}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer
										.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
					<Card title="Cancellation / return / exchange policy">
						<FormGroupWrapper>
							<TextArea
								name="cancellation_policy"
								value={formData.cancellation_policy}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer
										.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default PolicySettings;
