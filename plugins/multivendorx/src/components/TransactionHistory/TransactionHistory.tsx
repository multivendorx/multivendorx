/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { __, sprintf } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';

import { SelectInput } from '@zyra/inputs';
import { NavigatorComponent } from '@zyra/components';
import axios from 'axios';
import WalletTransaction from './WalletTransaction';
import DirectTransactionPreview from './DirectTransactionPreview';
import './transaction-history.scss';
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
	// True once the store list has loaded and is empty, so the wallet shows its "no stores yet" preview.
	const [hasNoStores, setHasNoStores] = useState(false);

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
				} else {
					setHasNoStores(true);
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
				headerTitle: __('Wallet transactions', 'multivendorx'),
				headerIcon: 'wallet-in',
				hideSettingHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'direct-transaction',
				headerTitle: __('Direct transactions', 'multivendorx'),
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
		headerTitle: __('Transaction history', 'multivendorx'),

		headerDescription: selectedStoreLabel
			? sprintf(
					/* translators: %s: store name. */
					__(
						'Wallet balance, payouts and statements for %s.',
						'multivendorx'
					),
					selectedStoreLabel
				)
			: __(
					'Wallet balance, payouts and statements for each store.',
					'multivendorx'
				),

		// Shown in the page header, beside the title it changes. (Pro's Facilitator tab swaps in its own switcher.)
		customContent: (
			<div className="mvx-store-switcher">
				<label htmlFor="mvx-transaction-store">
					{__('Store', 'multivendorx')}
				</label>
				<SelectInput
					name="store"
					id="mvx-transaction-store"
					value={selectedStoreId || ''}
					options={allStores}
					onChange={handleStoreChange}
					size="14rem"
				/>
			</div>
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
				if (selectedStoreId || hasNoStores) {
					return <WalletTransaction storeId={selectedStoreId} />;
				}

				return null;

			case 'direct-transaction':
				if (appLocalizer.khali_dabba) {
					return applyFilters(
						'multivendorx_direct_transaction',
						null,
						selectedStoreId
					);
				}

				return <DirectTransactionPreview />;
			default:
				return <div></div>;
		}
	};

	return (
		<>
			<NavigatorComponent
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
				headerCustomContent={navigatorMeta.customContent}
				className="mvx-transaction-history"
			/>
		</>
	);
};

export default TransactionHistory;
