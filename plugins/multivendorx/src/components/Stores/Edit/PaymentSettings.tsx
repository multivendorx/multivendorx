/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	getApiLink,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
	BasicInputUI,
	Notice,
	NoticeManager,
	PrePostTextUI,
	ExpandablePanelUI,
} from 'zyra';
import { __, sprintf } from '@wordpress/i18n';

interface PaymentField {
	key: string;
	html?: string | TrustedHTML;
	name?: string;
	type?: string;
	label: string;
	placeholder?: string;
	options?: Array<{ key: string; label: string; value: string }>; // Added for clarity
}

interface PaymentProvider {
	id: string;
	label: string;
	fields?: PaymentField[];
	formFields?: PaymentField[];
}

interface StorePaymentConfig {
	[key: string]: PaymentProvider;
}
interface StoreData {
	payment_methods?: Record<string, Record<string, unknown>>;
	commission_fixed?: string | number;
	commission_percentage?: string | number;
	[key: string]: unknown;
}

interface PaymentSettingsProps {
	id: string | null;
	data: StoreData | null;
}

const toPanelFields = (provider: PaymentProvider): PaymentField[] =>
	(provider.fields || provider.formFields || []).map((field) => ({
		...field,
		key: `${field.key}`,
	}));

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ id, data }) => {
	const [formData, setFormData] = useState<StoreData>({});

	const storePayment: StorePaymentConfig =
		(appLocalizer.store_payment_settings as StorePaymentConfig) || {};

	const filteredStorePayment = Object.fromEntries(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Object.entries(storePayment).filter(([_, value]) => value !== null)
	);

	const paymentAddNewOptions = Object.values(filteredStorePayment).map(
		(provider) => ({
			value: provider.id,
			label: provider.label,
			template: {
				label: provider.label,
				formFields: toPanelFields(provider),
			},
		})
	);

	useEffect(() => {
		if (!id) {
			return;
		}

		if (data) {
			setFormData(data);
		}
	}, [id, data]);

	const handleChange = (name: string, value: unknown) => {
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: value ?? '',
			};
			autoSave(updated);
			return updated;
		});
	};

	const autoSave = (updatedData: { [key: string]: unknown }) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		})
			.then((res) => {
				if (res.data.success) {
					NoticeManager.add({
						title: __('Success', 'multivendorx'),
						message: __('Store saved successfully!', 'multivendorx'),
						type: 'success',
						position: 'float',
					});
				}
			})
			.catch(() => {
				NoticeManager.add({
					title: __('Error', 'multivendorx'),
					message: __('Failed to save store settings. Please try again.', 'multivendorx'),
					type: 'error',
					position: 'float',
				});
			});
	};
	return (
		<>
			<Container>
				<Column grid={8}>
					<Card title={__('Withdrawal methods', 'multivendorx')}>
						{paymentAddNewOptions.length === 0 && (
							<Notice
								type="info"
								displayPosition="inline-notice"
								message={sprintf(
									/* translators: %s: link to payment integration settings */
									__(
										'You haven’t enabled any payment methods yet. Configure payout options <a href="%s">from here</a> to allow stores to receive their earnings.',
										'multivendorx'
									),
									'?page=multivendorx#&tab=settings&subtab=withdrawal-methods'
								)}
							/>
						)}
						<ExpandablePanelUI
							name="payment_methods"
							methods={[]}
							value={formData.payment_methods || {}}
							onChange={(
								value: Record<string, Record<string, unknown>>
							) => handleChange('payment_methods', value)}
							canAccess={true}
							addNewBtn
							addNewOptions={paymentAddNewOptions}
							addNewTemplate={{
								showPrimaryCheckbox: true,
								editableFields: {
									title: false,
									description: false,
								},
							}}
						/>
					</Card>
				</Column>
				{/* Commission Amount */}
				<Column grid={4}>
					<Card
						title={__('Store-specific commission', 'multivendorx')}
					>
						<Notice
							type="info"
							displayPosition="inline-notice"
							message={sprintf(
								/* translators: %s: URL to the global commission settings page. */
								__(
									'Set the commission the <b>marketplace earns</b> from each store sale. If not set, the <a href="%s">global commission</a> will automatically apply.',
									'multivendorx'
								),
								`${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=store-commissions`
							)}
						/>
						<FormGroupWrapper>
							<FormGroup
								cols={6}
								label={__('Fixed', 'multivendorx')}
								htmlFor="Fixed"
								className="commission-input-group"
							>
								<BasicInputUI
									preText={appLocalizer.currency_symbol}
									name="commission_fixed"
									value={formData.commission_fixed}
									onChange={(value) =>
										handleChange('commission_fixed', value)
									}
								/>
								<PrePostTextUI
									type="preposttext"
									textType="post"
									preText={undefined}
									postText="+"
								/>
							</FormGroup>
							<FormGroup
								cols={6}
								label={__('Percentage', 'multivendorx')}
								htmlFor="Percentage"
							>
								<BasicInputUI
									postText="%"
									name="commission_percentage"
									value={formData.commission_percentage}
									onChange={(value) =>
										handleChange(
											'commission_percentage',
											value
										)
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default PaymentSettings;
