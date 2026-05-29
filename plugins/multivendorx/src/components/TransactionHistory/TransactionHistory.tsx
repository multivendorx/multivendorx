/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import {
	ComponentStatusView,
	getApiLink,
	SelectInputUI,
	SettingsNavigator,
} from 'zyra';
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
	const [userId, setUserId] = useState<number | null>(null);
	const [userName, setUserName] = useState<string>('');
	const [currentTab, setCurrentTab] = useState('wallet-transaction');

	// Fetch stores on mount
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'stores'),
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

	const defaultSettingContent = [
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

	const settingContent = applyFilters(
		'multivendorx_transaction_history_tabs',
		defaultSettingContent
	);
	// Handle store change
	const handleStoreChange = (newValue: number | string | null) => {
		if (!newValue || typeof newValue !== 'number') {
			return;
		}

		setSelectedStoreId(newValue);
		setSelectedStoreLabel(getStoreLabelById(newValue));
	};
	const defaultNavigatorMeta = {
		headerTitle: selectedStoreId
			? __(
				`Storewise Transaction History - ${selectedStoreLabel}`,
				'multivendorx'
			)
			: __('Storewise Transaction History', 'multivendorx'),

		headerDescription: selectedStoreId
			? __(
				`View and manage transactions for ${selectedStoreLabel} store`,
				'multivendorx'
			)
			: __('View and manage storewise transactions', 'multivendorx'),

		customContent: (
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
		),
	};

	const navigatorMeta = applyFilters(
		'multivendorx_transaction_history_navigator_meta',
		defaultNavigatorMeta,
		{
			selectedStoreId,
			selectedStoreLabel,
			allStores,
			currentTab,
			setUserId,
			setUserName,
			userId,
			userName
		}
	);

	const getForm = (tabId: string) => {
		setCurrentTab(tabId);
		const externalContent = applyFilters(
			'multivendorx_transaction_history_tab_content',
			null,
			tabId,
			selectedStoreId,
			userId
		);

		if (externalContent) {
			return externalContent;
		}

		switch (tabId) {
			case 'wallet-transaction':
				return selectedStoreId ? (
					<WalletTransaction storeId={selectedStoreId} />
				) : null;

			case 'direct-transaction':
				if (appLocalizer.khali_dabba) {
					return applyFilters(
						'multivendorx_direct_transaction',
						null,
						selectedStoreId
					);
				}

				return (
					<ComponentStatusView
						title={__(
							'Real-time store payments',
							'multivendorx'
						)}
						desc={__(
							'Track all direct marketplace payments in real time from a single admin dashboard.',
							'multivendorx'
						)}
						buttonText={__('Upgrade to Pro', 'multivendorx')}
						buttonLink={appLocalizer.shop_url}
					/>
				);
			default:
				return <div></div>;
		}
	};

	return (
		<>
			<SettingsNavigator
				settingContent={settingContent}
				getForm={getForm}
				currentSetting={currentTab}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=transaction-history&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				variant={'compact'}
				menuIcon={true}
				headerIcon="store-reactivated"
				headerTitle={navigatorMeta.headerTitle}
				headerDescription={navigatorMeta.headerDescription}
				customContent={navigatorMeta.customContent}
			/>
		</>
	);
};

export default TransactionHistory;
