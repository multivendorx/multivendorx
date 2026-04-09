/* global appLocalizer */
import React, { useEffect, useState } from 'react';
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
	NoticeManager,
	InfoItem,
	ButtonInputUI,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

// Define proper interfaces
interface StoreOwner {
	label: string;
	value: string;
	[key: string]: unknown;
}

interface AdditionalOwner {
	id: string;
	label: string;
	email: string;
}

interface StaffMember {
	id: string;
	name: string;
	email: string;
	role: string;
	permissions: string[];
	status: 'active' | 'inactive';
	avatarInitials: string;
}

interface StoreSquadFormData {
	store_owners?: string[];
	primary_owner?: string;
	state?: string;
	staff_members?: StaffMember[];
	[key: string]: string | string[] | StaffMember[] | undefined;
}

interface StoreSquadProps {
	id: string | null;
}


const StoreSquad: React.FC<StoreSquadProps> = ({ id }) => {
	const { modules } = useModules();
	const [formData, setFormData] = useState<StoreSquadFormData>({});
	const [showPrimaryOwnerSelect, setShowPrimaryOwnerSelect] = useState<boolean>(true);
	const [selectedOwnerInfo, setSelectedOwnerInfo] = useState<StoreOwner | null>(null);
	const [showAdditionalOwnerSelect, setShowAdditionalOwnerSelect] = useState<boolean>(false);
	const [additionalOwners, setAdditionalOwners] = useState<AdditionalOwner[]>([]);

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

			// If there's an existing primary owner, show the InfoItem instead of select
			if (data.primary_owner) {
				const owner = (appLocalizer.store_owners || []).find(
					(opt: StoreOwner) => opt.value === data.primary_owner
				);
				if (owner) {
					setSelectedOwnerInfo(owner);
					setShowPrimaryOwnerSelect(false);
				}
			}

			// Load existing additional owners from store_owners array
			if (data.store_owners && Array.isArray(data.store_owners)) {
				const loadedOwners = data.store_owners.map((ownerValue: string) => {
					const owner = (appLocalizer.store_owners || []).find(
						(opt: StoreOwner) => opt.value === ownerValue
					);
					return {
						id: ownerValue,
						label: owner?.label || ownerValue,
						email: owner?.value || ownerValue,
					};
				});
				setAdditionalOwners(loadedOwners);
			}
		});
	}, [id]);

	const autoSave = (updatedData: StoreSquadFormData) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				...updatedData,
				user: 'true',
			},
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

	const handlePrimaryOwnerSelect = (primary_owner: string | string[]) => {
		if (Array.isArray(primary_owner)) {
			return;
		}

		const selectedOwner = (appLocalizer.store_owners || []).find(
			(opt: StoreOwner) => opt.value === primary_owner
		);

		if (selectedOwner) {
			setSelectedOwnerInfo(selectedOwner);
			setShowPrimaryOwnerSelect(false);
		}

		const updated = {
			...formData,
			primary_owner: primary_owner || '',
		};

		setFormData(updated);
		autoSave(updated);
	};


	const handleAddAdditionalOwner = () => {
		setShowAdditionalOwnerSelect(true);
	};

	const handleAdditionalOwnerSelect = (selectedOwners: string | string[]) => {
		const ownersArray = Array.isArray(selectedOwners)
			? selectedOwners
			: selectedOwners
				? [selectedOwners]
				: [];

		if (ownersArray.length > 0) {
			const newOwner = ownersArray[0];
			const ownerInfo = (appLocalizer.store_owners || []).find(
				(opt: StoreOwner) => opt.value === newOwner
			);

			if (ownerInfo && !additionalOwners.some(owner => owner.id === newOwner)) {
				const newAdditionalOwner: AdditionalOwner = {
					id: newOwner,
					label: ownerInfo.label,
					email: ownerInfo.value,
				};

				const updatedAdditionalOwners = [...additionalOwners, newAdditionalOwner];
				setAdditionalOwners(updatedAdditionalOwners);

				const updatedStoreOwners = updatedAdditionalOwners.map(owner => owner.id);
				const updated = {
					...formData,
					store_owners: updatedStoreOwners,
				};
				setFormData(updated);
				autoSave(updated);
			}
		}

		setShowAdditionalOwnerSelect(false);
	};

	const handleRemoveAdditionalOwner = (ownerId: string) => {
		const updatedAdditionalOwners = additionalOwners.filter(owner => owner.id !== ownerId);
		setAdditionalOwners(updatedAdditionalOwners);

		const updatedStoreOwners = updatedAdditionalOwners.map(owner => owner.id);
		const updated = {
			...formData,
			store_owners: updatedStoreOwners,
		};
		setFormData(updated);
		autoSave(updated);
	};

	return (
		<Container>
			{
				applyFilters(
					'multivendorx_store_edit_staff_top_section',
					null,
					id,
					modules
				)
			}

			<Column grid={4}>
				<Card
					id="primary-owner"
					title={__('Store ownership', 'multivendorx')}
				>
					<FormGroupWrapper>
						<FormGroup
							label={__('Primary owner', 'multivendorx')}
							desc={__('Primary owner cannot be removed.', 'multivendorx')}
						>
							<>
								<InfoItem
									title={selectedOwnerInfo?.label || __('Store Owner', 'multivendorx')}
									titleLink={selectedOwnerInfo?.value || '#'}
									avatar={{
										iconClass: "item-icon adminfont-person admin-color-green",
									}}
									descriptions={[
										{
											label: __('Email: ', 'multivendorx'),
											value: selectedOwnerInfo?.email || 'owner@example.com',
										},
										{
											label: __('Phone: ', 'multivendorx'),
											value: selectedOwnerInfo?.phone || '+1 234 567 8900',
										}
									]}
									badges={[
										{
											text: __('Primary Owner', 'multivendorx'),
											className: 'green',
										}
									]}
									rightContent={
										<ButtonInputUI
											buttons={[
												{
													text: __('Transfer', 'multivendorx'),
													onClick: () => setShowPrimaryOwnerSelect(true),
													color: 'gray',
												}
											]}
										/>
									}
								/>

								{showPrimaryOwnerSelect && (
									<SelectInputUI
										name="primary_owner"
										options={appLocalizer?.store_owners || []}
										value={formData.primary_owner}
										onChange={handlePrimaryOwnerSelect}
									/>
								)}
							</>
						</FormGroup>

						<FormGroup
							label={__('Additional owners', 'multivendorx')}
						>
							<div className="additional-owners-wrapper">
								{additionalOwners.map((owner) => (
									<InfoItem
										key={owner.id}
										title={owner.label}
										avatar={{
											iconClass: `item-icon adminfont-person admin-color-green`,
										}}
										descriptions={[
											{
												label: __('Email: ', 'multivendorx'),
												value: 'earthyways@test.com',
											},
										]}
										badges={[
											{
												text: __('Co-owner', 'multivendorx'),
												className: 'blue',
											},
										]}
										rightContent={
											<ButtonInputUI
												buttons={[
													{
														text: __('Remove', 'multivendorx'),
														color: 'red',
														onClick: () => handleRemoveAdditionalOwner(owner.id),
													},
												]}
											/>
										}
									/>
								))}
							</div>

							{showAdditionalOwnerSelect && (
								<SelectInputUI
									name="store_owners"
									options={appLocalizer.store_owners || []}
									type="multi-select"
									value={[]}
									size="20rem"
									onChange={handleAdditionalOwnerSelect}
								/>
							)}

							<ButtonInputUI
								buttons={[
									{
										text: __('Add additional owner', 'multivendorx'),
										color: 'purple',
										icon: 'plus',
										onClick: handleAddAdditionalOwner,
									},
								]}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</Card>
			</Column>
		</Container>
	);
};

export default StoreSquad;