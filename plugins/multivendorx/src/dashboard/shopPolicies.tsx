/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from '@zyra/core';

import { TextAreaInput } from '@zyra/inputs';
import {
	ContainerComponent,
	ColumnComponent,
	CardComponent,
	FormGroupWrapperComponent,
	FormGroupComponent,
	NoticeManager,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { __ } from '@wordpress/i18n';

const ShopPolicies = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		if (!id) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `stores/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [id]);

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
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				NoticeManager.add({
					title: __('Great!', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
					type: 'success',
					position: 'float',
				});
			}
		});
	};

	return (
		<>
			<NavigatorHeaderComponent
				headerTitle={__('Policy', 'multivendorx')}
				headerDescription={__(
					'Manage your store information and preferences',
					'multivendorx'
				)}
			/>

			<ContainerComponent>
				<ColumnComponent>
					<CardComponent title={__('Shipping Policy', 'multivendorx')}>
						<FormGroupWrapperComponent>
							<FormGroupComponent
								label={__('Title', 'multivendorx')}
								htmlFor="title"
							>
								<TextAreaInput
									name="shipping_policy"
									value={formData.shipping_policy}
									onChange={handleChange}
								/>
							</FormGroupComponent>
						</FormGroupWrapperComponent>
					</CardComponent>

					<CardComponent title={__('Refund Policy', 'multivendorx')}>
						<FormGroupWrapperComponent>
							<TextAreaInput
								name="refund_policy"
								value={formData.refund_policy}
								onChange={handleChange}
							/>
						</FormGroupWrapperComponent>
					</CardComponent>

					<CardComponent
						title={__(
							'Cancellation / Return / Exchange Policy',
							'multivendorx'
						)}
					>
						<FormGroupWrapperComponent>
							<TextAreaInput
								name="cancellation_policy"
								value={formData.cancellation_policy}
								onChange={handleChange}
							/>
						</FormGroupWrapperComponent>
					</CardComponent>
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default ShopPolicies;
