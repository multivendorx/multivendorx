/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import {
	ContainerComponent,
	ColumnComponent,
	CardComponent,
	FormGroupWrapperComponent,
	FormGroupComponent,
	NoticeComponent,
	NoticeManager,
} from '@zyra/components';
import { TextInput, ExpandablePanelInput } from '@zyra/inputs';
import { __, sprintf } from '@wordpress/i18n';
import type { SetupProgress } from './StoreTabLayout';

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
	/** Tells the page's setup checklist whether the store now has a withdrawal method. */
	onProgress?: (saved: SetupProgress) => void;
}

const toPanelFields = (provider: PaymentProvider): PaymentField[] =>
	(provider.fields || provider.formFields || []).map((field) => ({
		...field,
		key: `${field.key}`,
	}));

const PaymentSettings: React.FC<PaymentSettingsProps> = ({
	id,
	data,
	onProgress,
}) => {
	const [formData, setFormData] = useState<StoreData>({});

	const storePayment: StorePaymentConfig =
		(appLocalizer.store_payment_settings as StorePaymentConfig) || {};

	const filteredStorePayment = Object.fromEntries(
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
					onProgress?.({
						payout:
							Object.keys(updatedData.payment_methods || {})
								.length > 0,
					});
					NoticeManager.add({
						title: __('Success', 'multivendorx'),
						message: __(
							'Store saved successfully!',
							'multivendorx'
						),
						type: 'success',
						position: 'float',
					});
				}
			})
			.catch(() => {
				NoticeManager.add({
					title: __('Error', 'multivendorx'),
					message: __(
						'Failed to save store settings. Please try again.',
						'multivendorx'
					),
					type: 'error',
					position: 'float',
				});
			});
	};
	return (
		<>
			<ContainerComponent>
				<ColumnComponent grid={8}>
					<CardComponent
						title={__('Withdrawal methods', 'multivendorx')}
						titleIcon="withdraw"
						desc={__(
							'Where this store’s earnings are paid out. The primary method is used first.',
							'multivendorx'
						)}
					>
						{paymentAddNewOptions.length > 0 &&
							0 ===
								Object.keys(formData.payment_methods || {})
									.length && (
								<p className="mvx-store-empty">
									{__(
										'No withdrawal methods yet. Add one so the store can be paid.',
										'multivendorx'
									)}
								</p>
							)}
						{paymentAddNewOptions.length === 0 && (
							<NoticeComponent
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
						<ExpandablePanelInput
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
					</CardComponent>
				</ColumnComponent>
				{/* Commission Amount */}
				<ColumnComponent grid={4}>
					<CardComponent
						title={__('Store-specific commission', 'multivendorx')}
						titleIcon="commission"
						desc={__(
							'A rate for this store only, in place of the marketplace’s.',
							'multivendorx'
						)}
					>
						{/* One setting, one row: what the marketplace keeps from each sale, as a fixed amount plus a percentage. */}
						<FormGroupWrapperComponent>
							<FormGroupComponent
								label={__('Commission', 'multivendorx')}
								htmlFor="commission_fixed"
								desc={
									<>
										{__(
											'What the marketplace keeps from each sale. Empty: the ',
											'multivendorx'
										)}
										<a
											href={`${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=store-commissions`}
										>
											{__(
												'global commission',
												'multivendorx'
											)}
										</a>
										{__(' applies.', 'multivendorx')}
									</>
								}
							>
								<div className="mvx-commission-input">
									<TextInput
										preText={appLocalizer.currency_symbol}
										name="commission_fixed"
										value={formData.commission_fixed}
										onChange={(value) =>
											handleChange(
												'commission_fixed',
												value
											)
										}
									/>
									<span aria-hidden="true">+</span>
									<TextInput
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
								</div>
							</FormGroupComponent>
						</FormGroupWrapperComponent>
					</CardComponent>
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default PaymentSettings;
