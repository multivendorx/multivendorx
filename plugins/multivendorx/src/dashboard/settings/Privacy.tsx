import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	TextArea,
	getApiLink,
	SuccessNotice,
	Section,
	MultiCheckBox,
	FormGroupWrapper,
	FormGroup,
	useModules,
	AdminButton,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const Privacy = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [updateData, setUpdateData] = useState<{ [key: string]: any }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const { modules } = useModules();
	const store_policy = appLocalizer.settings_databases_value?.privacy?.store_policy_override;

	// Fetch store data
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
			// setFormData({
			//     shipping_policy: data.shipping_policy || '',
			//     refund_policy: data.refund_policy || '',
			//     exchange_policy: data.exchange_policy || '',
			// });
		});
	}, [id]);

	// Auto-hide success message after 3 seconds
	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	// Handle field changes
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };

		if (name == 'deactivation_reason') {
			setUpdateData(updated);
		} else {
			setFormData(updated);
			autoSave(updated);
		}
	};

	// Auto-save to API
	const autoSave = (updatedData: { [key: string]: string }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data?.success) {
				setSuccessMsg('Privacy settings saved successfully!');
				setFormData((prev) => ({
					...prev,
					deactivation_reason: updateData.deactivation_reason,
				}));
			}
		});
	};
	return (
		<>
			<SuccessNotice message={successMsg} />

			<FormGroupWrapper>
				{modules.includes('privacy') && Array.isArray(store_policy) &&
					store_policy.includes('store') && (
						<FormGroup label={__('Store policy', 'multivendorx')}>
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
						</FormGroup>
					)}
				{modules.includes('privacy') && Array.isArray(store_policy) &&
					store_policy.includes('shipping') && (
						<FormGroup label={__('Shipping policy', 'multivendorx')}>
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
						</FormGroup>
					)}
				{modules.includes('privacy') && Array.isArray(store_policy) &&
					store_policy.includes('refund') && (
						<FormGroup label={__('Refund policy', 'multivendorx')}>
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
						</FormGroup>
					)}
				{modules.includes('privacy') && Array.isArray(store_policy) &&
					store_policy.includes('cancellation_return') && (
						<FormGroup label={__('Cancellation / return / exchange policy', 'multivendorx')}>
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
						</FormGroup>
					)}
				<Section key="section" hint="Deactivation" />

				{formData.deactivation_reason ? (
					<div>
						{__(
							"When you delete a channel, all messages from this channel will be removed from Slack immediately. This can't be undone. Keep in mind: Any files uploaded to this channel won't be removed. You can archive a channel instead without removing its messages.",
							'multivendorx'
						)}
					</div>
				) : (
					<>
						<FormGroup
							label={__('Enable Deactivation', 'multivendorx')}
							htmlFor="enable_deactivation"
						>
							<MultiCheckBox
								wrapperClass="toggle-btn"
								descClass="settings-metabox-description"
								inputWrapperClass="toggle-checkbox-header"
								inputInnerWrapperClass="toggle-checkbox"
								idPrefix="toggle-switch"
								key="enable_deactivation"
								options={[
									{
										key: 'enable_deactivation',
										value: 'enable_deactivation',
									},
								]}
								value={formData.enable_deactivation || []}
								onChange={(selected: any) => {
									const currentValue = formData.enable_deactivation;
									const newValue = currentValue ? '' : selected.target.value;
								
									const updated = {
										...formData,
										enable_deactivation: newValue,
										deactivation_reason: newValue ? formData.deactivation_reason : '',
									};
									setFormData(updated);
									autoSave(updated);
								}}
							/>
						</FormGroup>

						{formData.enable_deactivation && (
							<>
								<FormGroup label={__('Deactivation Reason', 'multivendorx')}>
									<TextArea
										name="deactivation_reason"
										value={
											updateData.deactivation_reason || ''
										}
										onChange={handleChange}
									/>
								</FormGroup>
								<AdminButton
									wrapperClass='end'
									buttons={[
										{
											icon: 'save',
											text: 'Submit',
											className: 'purple-bg',
										},
									]}
								/>
							</>
						)}

					</>
				)}
			</FormGroupWrapper>
		</>
	);
};

export default Privacy;
