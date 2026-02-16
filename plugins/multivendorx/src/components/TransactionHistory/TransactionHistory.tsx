/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import '../Announcements/Announcements.scss';
import { getApiLink, SelectInputUI, SettingsNavigator } from 'zyra';
import axios from 'axios';
import WalletTransaction from './WalletTransaction';
import { addFilter, applyFilters, removeFilter } from '@wordpress/hooks';

export const TransactionHistory: React.FC = () => {
	const [allStores, setAllStores] = useState<any[]>([]);
	const [selectedStore, setSelectedStore] = useState<any>(null);

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
					const mappedStores = response.data.map((store: any) => ({
						value: store.id,
						label: store.store_name,
					}));
					setAllStores(mappedStores);
					setSelectedStore(mappedStores[0]);
				}
			})
			.catch((error) => {
				console.error(
					__('Error fetching stores:', 'multivendorx'),
					error
				);
			});
	}, []);

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
				return selectedStore?.value ? (
					<WalletTransaction storeId={selectedStore.value} />
				) : null;
			case 'direct-transaction':
				const output = applyFilters(
					'direct_transaction_output',
					null,
					selectedStore
				);

				return output;

			default:
				return <div></div>;
		}
	};
	
	const StoreSwitcher = (
		<div className="store-switcher-wrapper">
			<label>
				<i className="switch-store"></i>
				{__('Switch Storesss', 'multivendorx')}
			</label>
			<SelectInputUI
				name="store"
				value={selectedStore?.value || ''}
				options={allStores}
				onChange={(newValue: any) => setSelectedStore(newValue)}
				size="12rem"
			/>
		</div>
	);

	useEffect(() => {
		addFilter(
			'zyra_navigator_header_after',
			'multivendorx/transaction-history-switcher',
			() => StoreSwitcher
		);

		return () => {
			removeFilter('zyra_navigator_header_after', 'multivendorx/transaction-history-switcher');
		};
	}, [allStores, selectedStore]);

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
					selectedStore
						? __(
							`Storewise Transaction History - ${selectedStore.label}`,
							'multivendorx'
						)
						: __('Storewise Transaction History', 'multivendorx')
				}
				headerDescription={
					selectedStore
						? __(
							`View and manage transactions for ${selectedStore.label} store`,
							'multivendorx'
						)
						: __(
							'View and manage storewise transactions',
							'multivendorx'
						)
				}
			/>
		</>
	);
};

export default TransactionHistory;
