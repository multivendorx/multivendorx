/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import '../Announcements/announcements.scss';
import { AdminBreadcrumbs, getApiLink, SelectInput, Tabs } from 'zyra';
import axios from 'axios';
import WalletTransaction from './walletTransaction';
import { applyFilters } from '@wordpress/hooks';

export const TransactionHistory: React.FC = () => {
	const [allStores, setAllStores] = useState<any[]>([]);
	const [selectedStore, setSelectedStore] = useState<any>(null);
	const [dateRange, setDateRange] = useState<{
		startDate: Date | null;
		endDate: Date | null;
	}>({
		startDate: null,
		endDate: null,
	});

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

	const tabData = [
		{
			type: 'file',
			content: {
				id: 'wallet-transaction',
				name: __('Wallet Transaction', 'multivendorx'),
				icon: 'wallet-in',
				hideTabHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'direct-transaction',
				name: __('Direct Transaction', 'multivendorx'),
				icon: 'direct-transaction',
				hideTabHeader: true,
			},
		},
	];
	
	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'wallet-transaction':
				return (
					<WalletTransaction
						storeId={selectedStore?.value}
						dateRange={dateRange}
					/>
				);
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

	return (
		<>
			<AdminBreadcrumbs
				activeTabIcon="adminfont-store-reactivated"
				tabTitle={
					selectedStore
						? __(
								`Storewise Transaction History - ${selectedStore.label}`,
								'multivendorx'
							)
						: __('Storewise Transaction History', 'multivendorx')
				}
				description={
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
				customContent={
					<>
						<label>
							<i className="adminfont-switch-store"></i>
							{__('Switch Store', 'multivendorx')}
						</label>

						<SelectInput
							name="store"
							value={selectedStore?.value || ''}
							options={allStores}
							type="select"
							onChange={(newValue: any) =>
								setSelectedStore(newValue)
							}
							size="12rem"
						/>
					</>
				}
			/>

			<Tabs
				tabData={tabData}
				currentTab={locationUrl.get('subtab') as string}
				getForm={getForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=transaction-history&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				supprot={[]} // keeping your original key
				Link={Link}
				hideTitle={true}
				hideBreadcrumb={true}
				template={'template-2'}
				premium={false}
				menuIcon={true}
			/>
		</>
	);
};

export default TransactionHistory;
