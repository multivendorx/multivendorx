/* global appLocalizer */
import { useState, useEffect } from 'react';
import { SettingsNavigator, useModules, getApiLink } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { useLocation, Link } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';
import PendingStores from './PendingStores';
import PendingProducts from './PendingProducts';
import PendingCoupons from './PendingCoupons';
import PendingWithdrawal from './PendingWithdrawalRequests';
import PendingDeactivateRequests from './PendingDeactivateRequests';

const ApprovalQueue = () => {
	const [storeCount, setStoreCount] = useState<number>(0);
	const [productCount, setProductCount] = useState<number>(0);
	const [couponCount, setCouponCount] = useState<number>(0);
	const [withdrawCount, setWithdrawCount] = useState<number>(0);
	const [deactivateCount, setDeactivateCount] = useState<number>(0);

	useEffect(() => {
		const fetchPendingCount = () => {
			axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'store'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { status: 'pending', page: 1, row: 1 },
			})
				.then((res) => {
					const pendingCount =
						Number(res.headers['x-wp-status-pending']) || 0;

					setStoreCount(pendingCount);
				});
		
			axios
				.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						per_page: 1,
						meta_key: 'multivendorx_store_id',
						status: 'pending',
					},
				})
				.then((res) =>
					setProductCount(parseInt(res.headers['x-wp-total']) || 0)
				);
		

			axios
				.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						per_page: 1,
						meta_key: 'multivendorx_store_id',
						status: 'pending',
					},
				})
				.then((res) =>
					setCouponCount(parseInt(res.headers['x-wp-total']) || 0)
				);
		
			axios
				.get(getApiLink(appLocalizer, 'store'), {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						page: 1,
						row: 1,
						pending_withdraw: true,
					},
				})
				.then((res) => {
					setWithdrawCount(Number(res.headers['x-wp-total']) || 0);
				});
		
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: 1,
					row: 1,
					deactivate: true,
				},
			})
			.then((res) => {
				setDeactivateCount(Number(res.headers['x-wp-total']) || 0);
			});
	
		};
		fetchPendingCount();
	}, []);

	const { modules } = useModules();
	const settings = appLocalizer.settings_databases_value || {};

	const location = new URLSearchParams(useLocation().hash.substring(1));
	const baseSettingContent = [
		{
			type: 'file',
			condition: settings?.onboarding?.approve_store === 'manually',
			content: {
				id: 'stores',
				headerTitle: __('Stores', 'multivendorx'),
				headerDescription: __(
					'Eager to join the marketplace',
					'multivendorx'
				),
				settingTitle: __('Store in review queue', 'multivendorx'),
				settingSubTitle: __(
					'Next in line! Approve or reject new store join requests.',
					'multivendorx'
				),
				headerIcon: 'storefront yellow',
				count: storeCount,
			},
		},
		{
			type: 'file',
			condition:
				settings?.['store-permissions']?.products?.includes(
					'publish_products'
				),
			content: {
				id: 'products',
				headerTitle: __('Products', 'multivendorx'),
				headerDescription: __('Pending your approval', 'multivendorx'),
				settingTitle: __('Products awaiting review', 'multivendorx'),
				settingSubTitle: __(
					'Approve these listings to start generating sales in your marketplace.',
					'multivendorx'
				),
				headerIcon: 'multi-product red',
				count: productCount,
			},
		},
		{
			type: 'file',
			condition:
				settings?.['store-permissions']?.coupons?.includes(
					'publish_coupons'
				),
			content: {
				id: 'coupons',
				headerTitle: __('Coupons', 'multivendorx'),
				headerDescription: __('Need a quick review', 'multivendorx'),
				settingTitle: __('Coupons up for review', 'multivendorx'),
				settingSubTitle: __(
					'Approve, decline, or tweak before they go live.',
					'multivendorx'
				),
				headerIcon: 'coupon green',
				count: couponCount,
			},
		},
		{
			type: 'file',
			condition: settings?.payouts?.withdraw_type === 'manual',
			content: {
				id: 'withdrawal',
				headerTitle: __('Withdrawals', 'multivendorx'),
				headerDescription: __(
					'Queued for disbursement',
					'multivendorx'
				),
				settingTitle: __(
					'Withdrawals awaiting approval',
					'multivendorx'
				),
				settingSubTitle: __(
					'Review and process store payouts.',
					'multivendorx'
				),
				headerIcon: 'bank orange',
				count: withdrawCount,
			},
		},
		{
			type: 'file',
			content: {
				id: 'deactivate-requests',
				headerTitle: __('Deactivations', 'multivendorx'),
				headerDescription: __(
					'Permanent store closure request',
					'multivendorx'
				),
				settingTitle: __(
					'Stores requesting deactivation',
					'multivendorx'
				),
				settingSubTitle: __(
					'Approve or reject marketplace joiners.',
					'multivendorx'
				),
				headerIcon: 'rejecte teal',
				count: deactivateCount,
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

	const getForm = (tabId: string) => {
		const defaultForm = (() => {
			switch (tabId) {
				case 'stores':
					return <PendingStores onCountChange={setStoreCount}/>;

				case 'products':
					return <PendingProducts onCountChange={setProductCount}/>;

				case 'coupons':
					return <PendingCoupons onCountChange={setCouponCount}/>;

				case 'withdrawal':
					return <PendingWithdrawal onCountChange={setWithdrawCount}/>;

				case 'deactivate-requests':
					return <PendingDeactivateRequests onCountChange={setDeactivateCount} />;

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
		<SettingsNavigator
			settingContent={settingContent}
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
				'Manage all pending administrative actions including approvals, payouts, and notifications.',
				'multivendorx'
			)}
		/>
	);
};

export default ApprovalQueue;
