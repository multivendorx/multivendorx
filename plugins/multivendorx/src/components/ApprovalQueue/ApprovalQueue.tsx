import { NavigatorHeader, getApiLink, SettingsNavigator, useModules } from 'zyra';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import PendingStores from './PendingStores';
import PendingProducts from './PendingProducts';
import PendingCoupons from './PendingCoupons';
import PendingRefund from './PendingRefund';
import PendingReportAbuse from './PendingAbuseReports';
import PendingWithdrawal from './PendingWithdrawalRequests';
import PendingDeactivateRequests from './PendingDeactivateRequests';

const ApprovalQueue = () => {
	const [storeCount, setStoreCount] = useState<number>(0);
	const [productCount, setProductCount] = useState<number>(0);
	const [couponCount, setCouponCount] = useState<number>(0);
	const [refundCount, setRefundCount] = useState<number>(0);
	const [reportAbuseCount, setReportAbuseCount] = useState<number>(0);
	const [withdrawCount, setWithdrawCount] = useState<number>(0);
	const [deactivateCount, setDeactivateCount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(true);
	const { modules } = useModules();
	const ranOnce = useRef(false);
	const settings = appLocalizer.settings_databases_value || {};

	const refreshCounts = async () => {
		setIsLoading(true);
		//Store Count (only if store approval is manual)
		if (settings?.general?.approve_store === 'manually') {
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
				})
				.catch(() => { })
				.finally(() => {
					setIsLoading(false);
				});

		}

		// Product Count (only if can publish products)
		if (
			!settings?.['store-permissions']?.products?.includes(
				'publish_products'
			)
		) {
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
				)
				.finally(() => { setIsLoading(false); })
				.catch(() => { });
		}

		//Coupon Count (only if can publish coupons)
		if (
			settings?.['store-permissions']?.coupons?.includes('publish_coupons')
		) {
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
				)
				.finally(() => { setIsLoading(false); })
				.catch(() => { });
		}

		// Refund Count (only if refund module active)
		if (modules.includes('marketplace-refund')) {
			axios({
				method: 'GET',
				url: `${appLocalizer.apiUrl}/wc/v3/orders`,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					meta_key: 'multivendorx_store_id',
					status: 'refund-requested',
					page: 1,
					per_page: 1,
				},
			})
				.then((res) =>
					setRefundCount(Number(res.headers['x-wp-total']) || 0)
				)
				.finally(() => { setIsLoading(false); })
				.catch(() => { });
		}

		// Report Abuse (only if module active)
		if (modules.includes('marketplace-compliance')) {
			axios
				.get(getApiLink(appLocalizer, 'report-abuse'), {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						page: 1,
						row: 1,
					},
				})
				.then((res) => {
					setReportAbuseCount(Number(res.headers['x-wp-total']) || 0);
				})
				.catch(() => { })
				.finally(() => {
					setIsLoading(false);
				});
		}

		// Withdraw Count (only if manual withdraw enabled)
		if (settings?.disbursement?.withdraw_type === 'manual') {
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
					setWithdrawCount(
						Number(res.headers['x-wp-total']) || 0
					);
				})
				.catch(() => { })
				.finally(() => {
					setIsLoading(false);
				});
		}

		// Deactivate Store Request (always active)
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
				setDeactivateCount(
					Number(res.headers['x-wp-total']) || 0
				);
			})
			.catch(() => { })
			.finally(() => {
				setIsLoading(false);
			});

	};

	useEffect(() => {
		// Wait until modules load
		if (!modules || modules.length === 0) {
			return;
		}

		// Prevent double run in Strict Mode
		if (ranOnce.current) {
			return;
		}
		ranOnce.current = true;

		refreshCounts();
	}, [modules]);

	const location = new URLSearchParams(useLocation().hash.substring(1));

	const settingContent = [
		{
			type: 'file',
			// condition: settings?.general?.approve_store === 'manually',
			content: {
				id: 'stores',
				settingName: 'Stores',
				settingTitle: 'Title test',
				settingSubTitle: 'Title test sub title',
				settingDescription: 'Eager to join the marketplace',
				settingIcon: 'storefront yellow',
				count: storeCount,
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
				settingName: 'Products',
				settingDescription: 'Pending your approval',
				settingIcon: 'multi-product red',
				count: productCount,
			},
		},
		{
			type: 'file',
			// condition:
			// 	settings?.['store-permissions']?.coupons?.includes(
			// 		'publish_coupons'
			// 	),
			content: {
				id: 'coupons',
				settingName: 'Coupons',
				settingDescription: 'Need a quick review',
				settingIcon: 'coupon green',
				count: couponCount,
			},
		},
		{
			type: 'file',
			// module: 'wholesale',
			content: {
				id: 'wholesale-customer',
				settingName: 'Customers',
				settingDescription: 'Ready for your approval',
				settingIcon: 'user-circle pink',
				count: 9,
			},
		},
		{
			type: 'file',
			// module: 'marketplace-refund',
			content: {
				id: 'refund-requests',
				settingName: 'Refunds',
				settingDescription: 'Need your decision',
				settingIcon: 'marketplace-refund blue',
				count: refundCount,
			},
		},
		{
			type: 'file',
			// module: 'marketplace-compliance',
			content: {
				id: 'report-abuse',
				settingName: 'Flagged',
				settingDescription: 'Product reported for assessment',
				settingIcon: 'product indigo',
				count: reportAbuseCount,
			},
		},
		{
			type: 'file',
			// condition: settings?.disbursement?.withdraw_type === 'manual',
			content: {
				id: 'withdrawal',
				settingName: 'Withdrawals',
				settingDescription: 'Queued for disbursement',
				settingIcon: 'bank orange',
				count: withdrawCount,
			},
		},
		{
			type: 'file',
			content: {
				id: 'deactivate-requests',
				settingName: 'Deactivations',
				settingDescription: 'Permanent store closure request',
				settingIcon: 'rejecte teal',
				count: deactivateCount,
			},
		},
	].filter(
		(tab) =>
			//Show if:
			(!tab.module || modules.includes(tab.module)) && // module active or not required
			(tab.condition === undefined || tab.condition) // condition true or not set
	);

	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'stores':
				return <PendingStores onUpdated={refreshCounts} />;

			case 'products':
				return <PendingProducts onUpdated={refreshCounts} />;

			case 'coupons':
				return <PendingCoupons onUpdated={refreshCounts} />;

			case 'wholesale-customer':
				return <h1>Upcoming Feature</h1>;

			case 'refund-requests':
				return <PendingRefund onUpdated={refreshCounts} />;

			case 'report-abuse':
				return <PendingReportAbuse onUpdated={refreshCounts} />;

			case 'withdrawal':
				return <PendingWithdrawal onUpdated={refreshCounts} />;

			case 'deactivate-requests':
				return <PendingDeactivateRequests onUpdated={refreshCounts} />;

			default:
				return <div></div>;
		}
	};

	return (
		<>
			{/* <NavigatorHeader
				headerIcon="adminfont-approval"
				headerTitle="Approval Queue"
				headerDescription={
					'Manage all pending administrative actions including approvals, payouts, and notifications.'
				}
			/> */}
			<SettingsNavigator
				settingContent={settingContent}
				currentSetting={location.get('subtab') as string}
				getForm={getForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=approval-queue&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				variant={'card'}
				headerIcon="adminfont-approval"
				headerTitle="Approval Queue"
				headerDescription={
					'Manage all pending administrative actions including approvals, payouts, and notifications.'
				}
			/>
		</>
	);
};

export default ApprovalQueue;
