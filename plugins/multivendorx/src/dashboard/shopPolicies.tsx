/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import {
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
	NoticeManager,
} from '@zyra/elements';
import { TextAreaUI } from '@zyra/inputs';
import { NavigatorHeader } from '@zyra/admin';
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
			<NavigatorHeader
				headerTitle={__('Policy', 'multivendorx')}
				headerDescription={__(
					'Manage your store information and preferences',
					'multivendorx'
				)}
			/>

			<Container>
				<Column>
					<Card title={__('Shipping Policy', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup
								label={__('Title', 'multivendorx')}
								htmlFor="title"
							>
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

					<Card
						title={__(
							'Cancellation / Return / Exchange Policy',
							'multivendorx'
						)}
					>
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
