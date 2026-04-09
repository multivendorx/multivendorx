/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { getApiLink, SelectInputUI, SettingsNavigator } from 'zyra';
import axios from 'axios';
import WalletTransaction from './WalletTransaction';
import { applyFilters } from '@wordpress/hooks';

type StoreOption = {
	label: string;
	value: number;
};

export const TransactionHistory: React.FC = () => {
	const [allStores, setAllStores] = useState<StoreOption[]>([]);
	const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
	const [selectedStoreLabel, setSelectedStoreLabel] = useState<string>('');

	// Fetch stores on mount
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { options: true },
		})
			.then((response) => {
				if (response?.data?.length) {
					const mappedStores = response.data.map((store) => ({
						value: store.id,
						label: store.store_name,
					}));
					setAllStores(mappedStores);
					setSelectedStoreId(mappedStores[0].value);
					setSelectedStoreLabel(mappedStores[0].label);
				}
			})
			.catch((error) => {
				console.error(
					__('Error fetching stores:', 'multivendorx'),
					error
				);
			});
	}, []);

	// Helper function to get store label by ID
	const getStoreLabelById = (storeId: number | null): string => {
		if (!storeId) {
			return '';
		}
		const store = allStores.find((s) => s.value === storeId);
		return store?.label || '';
	};

	const locationUrl = new URLSearchParams(useLocation().hash.substring(1));

	const settingContent = [
		{
			type: 'file',
			content: {
				id: 'wallet-transaction',
				headerTitle: __('Wallet Transaction', 'multivendorx'),
				headerIcon: 'wallet-in',
				hideSettingHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'direct-transaction',
				headerTitle: __('Direct Transaction', 'multivendorx'),
				headerIcon: 'direct-transaction',
				hideSettingHeader: true,
			},
		},
	];

	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'wallet-transaction':
				return selectedStoreId ? (
					<WalletTransaction storeId={selectedStoreId} />
				) : null;
			case 'direct-transaction':
				return applyFilters(
					'direct_transaction_output',
					null,
					selectedStoreId
				);
			default:
				return <div></div>;
		}
	};

	// Handle store change
	const handleStoreChange = (newValue: number | string | null) => {
		if (!newValue || typeof newValue !== 'number') {
			return;
		}

		setSelectedStoreId(newValue);
		setSelectedStoreLabel(getStoreLabelById(newValue));
	};

	return (
		<>
			<SettingsNavigator
				settingContent={settingContent}
				currentSetting={locationUrl.get('subtab') as string}
				getForm={getForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=transaction-history&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				variant={'compact'}
				menuIcon={true}
				headerIcon="store-reactivated"
				headerTitle={
					selectedStoreId
						? __(
								`Storewise Transaction History - ${selectedStoreLabel}`,
								'multivendorx'
							)
						: __('Storewise Transaction History', 'multivendorx')
				}
				headerDescription={
					selectedStoreId
						? __(
								`View and manage transactions for ${selectedStoreLabel} store`,
								'multivendorx'
							)
						: __(
								'View and manage storewise transactions',
								'multivendorx'
							)
				}
				customContent={
					<>
						<label>
							<i className="adminfont-switch-store"></i>
							{__('Switch Store:', 'multivendorx')}
						</label>

						<SelectInputUI
							name="store"
							value={selectedStoreId || ''}
							options={allStores}
							onChange={handleStoreChange}
							size="12rem"
						/>
					</>
				}
			/>
		</>
	);
};

export default TransactionHistory;
