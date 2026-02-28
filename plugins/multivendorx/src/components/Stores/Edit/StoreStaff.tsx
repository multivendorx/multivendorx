import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	
	getApiLink,
	useModules,
	Container,
	Column,
	FormGroupWrapper,
	FormGroup,
	Card,
	SelectInputUI,
	Notice,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

const StoreSquad = ({ id }: { id: string | null }) => {
	const { modules } = useModules();
	const [formData, setFormData] = useState<{ [key: string]: any }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			params: { fetch_user: true },
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [id]);

	const autoSave = (updatedData: { [key: string]: any }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				...updatedData,
				user: 'true',
			},
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg('Store saved successfully!');
			}
		});
	};

	return (
		<>
			<Notice
				message={successMsg}
				displayPosition='float'
				title={__('Great!', 'multivendorx')}
			/>

			<Container>
				<Column grid={8}>
					<Card title={__('Store owners', 'multivendorx')}>
						<FormGroupWrapper>
							<SelectInputUI
								name="store_owners"
								options={appLocalizer.store_owners || []}
								type="multi-select"
								value={(formData.store_owners || []).map(
									(id: any) => {
										const match = (
											appLocalizer.store_owners || []
										).find(
											(opt: any) =>
												String(opt.value) === String(id)
										);
										return match ? match.value : String(id);
									}
								)}
								onChange={(selected: any) => {
									const store_owners =
										(selected as any[])?.map(
											(option) => option.value
										) || [];
									const updated = {
										...formData,
										store_owners,
										state: '',
									};
									setFormData(updated);
									autoSave(updated);
								}}
							/>
						</FormGroupWrapper>

						{modules.includes('staff-manager') &&
							applyFilters(
								'additional_staff_manager_fields',
								null,
								formData,
								setFormData,
								autoSave
							)}

						{modules.includes('facilitator') &&
							applyFilters(
								'additional_facilitator_fields',
								null,
								formData,
								setFormData,
								autoSave
							)}
					</Card>
				</Column>

				<Column grid={4}>
					<Card
						id="primary-owner"
						title={__('Primary owner', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__(
									'Select primary owner',
									'multivendorx'
								)}
							>
								<SelectInputUI
									name="primary_owner"
									options={appLocalizer?.store_owners || []}
									value={formData.primary_owner}
									onChange={(newValue: any) => {
										if (
											!newValue ||
											Array.isArray(newValue)
										) {
											return;
										}
										const updated = {
											...formData,
											primary_owner: newValue,
										};
										setFormData(updated);
										autoSave(updated);
									}}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default StoreSquad;
