/* global appLocalizer */
import { useState, useEffect } from 'react';

import { getApiLink, useModules } from '@zyra/core';
import { NavigatorComponent } from '@zyra/components';
import { __ } from '@wordpress/i18n';
import { useLocation, Link } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';
import { fetchQueueCounts } from '../../services/queueCounts';
import '../queue-tabs.scss';
import PendingStores from './PendingStores';
import PendingProducts from './PendingProducts';
import PendingCoupons from './PendingCoupons';
import PendingWithdrawal from './PendingWithdrawalRequests';
import PendingDeactivateRequests from './PendingDeactivateRequests';

if (!window.multivendorxStore) {
	window.multivendorxStore = {
		counts: {},
		listeners: [],
		setCount(id, count) {
			if (this.counts[id] === count) {
				return;
			}
			this.counts[id] = count;
			this.listeners.forEach((fn) => fn(this.counts));
		},
		subscribe(fn) {
			this.listeners.push(fn);
			return () => {
				this.listeners = this.listeners.filter((l) => l !== fn);
			};
		},
	};
}

const ApprovalQueue = () => {
	const [counts, setCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		const store = window.multivendorxStore;

		// initial
		setCounts({ ...store.counts });

		// subscribe
		return store.subscribe((newCounts) => {
			setCounts({ ...newCounts });
		});
	}, []);

	useEffect(() => {
		const store = window.multivendorxStore;

		let apiConfigs: any[] = [
			{
				id: 'stores',
				url: getApiLink(appLocalizer, 'stores'),
				params: { status: 'pending', page: 1, row: 1 },
				header: 'x-wp-status-pending',
			},
			{
				id: 'products',
				url: `${appLocalizer.apiUrl}/wc/v3/products`,
				params: {
					per_page: 1,
					meta_key: 'multivendorx_store_id',
					status: 'pending',
				},
				header: 'x-wp-total',
			},
			{
				id: 'coupons',
				url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
				params: {
					per_page: 1,
					meta_key: 'multivendorx_store_id',
					status: 'pending',
				},
				header: 'x-wp-total',
			},
			{
				id: 'withdrawal',
				url: getApiLink(appLocalizer, 'stores'),
				params: { page: 1, row: 1, pending_withdraw: true },
				header: 'x-wp-total',
			},
			{
				id: 'deactivate-requests',
				url: getApiLink(appLocalizer, 'stores'),
				params: { page: 1, row: 1, deactivate: true },
				header: 'x-wp-total',
			},
		];

		apiConfigs = applyFilters(
			'multivendorx_approval_queue_api_configs',
			apiConfigs,
			{ appLocalizer }
		);

		fetchQueueCounts(apiConfigs, (id, count) => store.setCount(id, count));
	}, []);

	const { modules } = useModules();
	const settings = appLocalizer.admin_settings || {};
	const location = new URLSearchParams(useLocation().hash.substring(1));

	const baseSettingContent = [
		{
			type: 'file',
			condition: settings?.onboarding?.approve_store === 'manually',
			content: {
				id: 'stores',
				headerTitle: __('Stores', 'multivendorx'),
				headerDescription: __('New store applications', 'multivendorx'),
				settingTitle: __('Stores waiting for approval', 'multivendorx'),
				settingSubTitle: __(
					'Approve a store to open it on your marketplace, or reject it with a reason.',
					'multivendorx'
				),
				headerIcon: 'storefront',
			},
		},
		{
			type: 'file',
			// condition:
			// 	!settings?.['store-permissions']?.products?.includes(
			// 		'publish_products'
			// 	),
			content: {
				id: 'products',
				headerTitle: __('Products', 'multivendorx'),
				headerDescription: __(
					'New listings from stores',
					'multivendorx'
				),
				settingTitle: __('Products waiting for review', 'multivendorx'),
				settingSubTitle: __(
					'Publish a listing to put it on sale, or reject it so the store can fix it.',
					'multivendorx'
				),
				headerIcon: 'multi-product',
			},
		},
		{
			type: 'file',
			condition:
				!settings?.['store-permissions']?.coupons?.includes(
					'publish_coupons'
				),
			content: {
				id: 'coupons',
				headerTitle: __('Coupons', 'multivendorx'),
				headerDescription: __(
					'Discounts stores created',
					'multivendorx'
				),
				settingTitle: __('Coupons waiting for review', 'multivendorx'),
				settingSubTitle: __(
					'Publish a coupon so shoppers can use it, or reject it before it goes live.',
					'multivendorx'
				),
				headerIcon: 'coupon',
			},
		},
		{
			type: 'file',
			condition: settings?.payouts?.withdraw_type === 'manual',
			content: {
				id: 'withdrawal',
				headerTitle: __('Withdrawals', 'multivendorx'),
				headerDescription: __(
					'Stores asking to be paid',
					'multivendorx'
				),
				settingTitle: __(
					'Withdrawals waiting for approval',
					'multivendorx'
				),
				settingSubTitle: __(
					'Approve a request to pay the store from its wallet.',
					'multivendorx'
				),
				headerIcon: 'bank',
			},
		},
		{
			type: 'file',
			content: {
				id: 'deactivate-requests',
				headerTitle: __('Deactivations', 'multivendorx'),
				headerDescription: __('Stores asking to close', 'multivendorx'),
				settingTitle: __('Stores asking to close', 'multivendorx'),
				settingSubTitle: __(
					'Approve to close the store for good, or reject to keep it open.',
					'multivendorx'
				),
				headerIcon: 'rejecte',
			},
		},
	];

	const filteredSettings = applyFilters(
		'multivendorx_approval_queue_tab',
		baseSettingContent,
		{ settings, modules }
	);

	const settingContent = filteredSettings.filter(
		(tab) =>
			(!tab.module || modules.includes(tab.module)) &&
			(tab.condition === undefined || tab.condition)
	);

	const settingContentWithCounts = settingContent.map((tab) => ({
		...tab,
		content: {
			...tab.content,
			// Only a queue with something in it shows a count; zyra skips an empty count, so a clear queue stays quiet.
			count: counts[tab.content.id] ? String(counts[tab.content.id]) : '',
		},
	}));

	const getForm = (tabId: string) => {
		const defaultForm = (() => {
			switch (tabId) {
				case 'stores':
					return <PendingStores />;
				case 'products':
					return <PendingProducts />;
				case 'coupons':
					return <PendingCoupons />;
				case 'withdrawal':
					return <PendingWithdrawal />;
				case 'deactivate-requests':
					return <PendingDeactivateRequests />;
				default:
					return null;
			}
		})();

		return applyFilters(
			'multivendorx_approval_queue_tab_content',
			defaultForm,
			{
				tabId,
			}
		);
	};

	return (
		<NavigatorComponent
			settingContent={settingContentWithCounts}
			currentSetting={location.get('subtab') as string}
			getForm={getForm}
			prepareUrl={(subTab: string) =>
				`?page=multivendorx#&tab=approval-queue&subtab=${subTab}`
			}
			appLocalizer={appLocalizer}
			menuIcon={true}
			Link={Link}
			variant={'card'}
			headerIcon="approval"
			headerTitle={__('Approval Queue', 'multivendorx')}
			headerDescription={__(
				'Everything stores are waiting on you for: new stores, listings, coupons, payouts and closures.',
				'multivendorx'
			)}
			className="mvx-queue-page"
		/>
	);
};

export default ApprovalQueue;
