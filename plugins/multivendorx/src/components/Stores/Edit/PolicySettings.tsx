/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	getApiLink,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	TextAreaUI,
	NoticeManager,
} from 'zyra';
import { __ } from '@wordpress/i18n';
interface StoreData {
	payment_method?: string;
	dashboard_access?: string;
	onboarding_flow?: string;
	charge_type?: string;
	commission_fixed?: string | number;
	commission_percentage?: string | number;
	[key: string]: string | number | undefined;
}

interface PolicySettingsProps {
	id: string | null;
	data: StoreData | null;
}
const PolicySettings: React.FC<PolicySettingsProps> = ({ id, data }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		if (data) {
			setFormData(data);
		}
	}, [data]);

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
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				NoticeManager.add({
					title: __('Success', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
					type: 'success',
					position: 'float',
				});
			}
		});
	};

	return (
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
								appLocalizer.admin_settings[
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
								appLocalizer.admin_settings[
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
								appLocalizer.admin_settings[
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
								appLocalizer.admin_settings[
									'overview'
								]['tinymce_api_section'] ?? ''
							}
						/>
					</FormGroupWrapper>
				</Card>
			</Column>
		</Container>
	);
};

export default PolicySettings;
