/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	SuccessNotice,
	getApiLink,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	TextAreaUI,
} from 'zyra';
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

	const handleChange = (key: string, value: string) => {
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[key]: value ?? '',
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
					<Card title={__('Store policy', 'multivendorx')}>
						<FormGroupWrapper>
							<TextAreaUI
								name="store_policy"
								value={formData.store_policy}
								onChange={(value: string) =>
									handleChange('store_policy', value)
								}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer.settings_databases_value[
										'overview'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
					<Card title={__('Shipping policy', 'multivendorx')}>
						<FormGroupWrapper>
							<TextAreaUI
								name="shipping_policy"
								value={formData.shipping_policy}
								onChange={(value: string) =>
									handleChange('shipping_policy', value)
								}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer.settings_databases_value[
										'overview'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
				</Column>
				<Column row>
					<Card title={__('Refund policy', 'multivendorx')}>
						<FormGroupWrapper>
							<TextAreaUI
								name="refund_policy"
								value={formData.refund_policy}
								onChange={(value: string) =>
									handleChange('refund_policy', value)
								}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer.settings_databases_value[
										'overview'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroupWrapper>
					</Card>
					<Card
						title={__(
							'Cancellation / return / exchange policy',
							'multivendorx'
						)}
					>
						<FormGroupWrapper>
							<TextAreaUI
								name="cancellation_policy"
								value={formData.cancellation_policy}
								onChange={(value: string) =>
									handleChange('cancellation_policy', value)
								}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer.settings_databases_value[
										'overview'
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
