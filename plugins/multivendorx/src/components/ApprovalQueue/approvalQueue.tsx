import { AdminBreadcrumbs, getApiLink, Tabs, useModules } from 'zyra';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import PendingStores from './pendingStores';
import PendingProducts from './pendingProducts';
import PendingCoupons from './pendingCoupons';
import PendingRefund from './pendingRefund';
import PendingReportAbuse from './pendingAbuseReports';
import PendingWithdrawal from './pendingWithdrawalRequests';
import PendingDeactivateRequests from './pendingDeactivateRequests';

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
				params: { count: true, status: 'pending' },
			})
				.then((res) => setStoreCount(res.data || 0))
				.finally(() => {setIsLoading(false);})
				.catch(() => {});
		}

		// Product Count (only if can publish products)
		if (
			!settings?.['store-capability']?.products?.includes(
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
				.finally(() => {setIsLoading(false);})
				.catch(() => {});
		}

		//Coupon Count (only if can publish coupons)
		if (
			settings?.['store-capability']?.coupons?.includes('publish_coupons')
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
				.finally(() => {setIsLoading(false);})
				.catch(() => {});
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
				.finally(() => {setIsLoading(false);})
				.catch(() => {});
		}

		// Report Abuse (only if module active)
		if (modules.includes('marketplace-compliance')) {
			axios
				.get(getApiLink(appLocalizer, 'report-abuse'), {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: { count: true },
				})
				.then((res) => setReportAbuseCount(res.data || 0))
				.finally(() => {setIsLoading(false);})
				.catch(() => {});
		}

		// Withdraw Count (only if manual withdraw enabled)
		if (settings?.disbursement?.withdraw_type === 'manual') {
			axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'store'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { count: true, pending_withdraw: true },
			})
				.then((res) => setWithdrawCount(res.data || 0))
				.finally(() => {setIsLoading(false);})
				.catch(() => {});
		}

		// Deactivate Store Request (always active)
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { count: true, deactivate: true },
		})
			.then((res) => setDeactivateCount(res.data || 0))
			.finally(() => {setIsLoading(false);})
			.catch(() => {});
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

	const tabData = [
		{
			type: 'file',
			condition: settings?.general?.approve_store === 'manually',
			content: {
				id: 'stores',
				name: 'Stores',
				desc: 'Eager to join the marketplace',
				icon: 'storefront yellow',
				tabTitle: 'Store in review queue',
				tabDes: 'Next in line! Approve or reject new store join requests.',
				count: storeCount,
			},
		},
		{
			type: 'file',
			condition:
				!settings?.['store-capability']?.products?.includes(
					'publish_products'
				),
			content: {
				id: 'products',
				name: 'Products',
				desc: 'Pending your approval',
				icon: 'multi-product red',
				tabTitle: 'Products awaiting review',
				tabDes: 'Approve these listings to start generating sales in your marketplace.',
				count: productCount,
			},
		},
		{
			type: 'file',
			condition:
				settings?.['store-capability']?.coupons?.includes(
					'publish_coupons'
				),
			content: {
				id: 'coupons',
				name: 'Coupons',
				desc: 'Need a quick review',
				icon: 'coupon green',
				tabTitle: 'Coupons up for review',
				tabDes: 'Approve, decline, or tweak before they go live.',
				count: couponCount,
			},
		},
		{
			type: 'file',
			module: 'wholesale',
			content: {
				id: 'wholesale-customer',
				name: 'Customers',
				desc: 'Ready for your approval',
				icon: 'user-circle pink',
				count: 9,
			},
		},
		{
			type: 'file',
			module: 'marketplace-refund',
			content: {
				id: 'refund-requests',
				name: 'Refunds',
				desc: 'Need your decision',
				icon: 'marketplace-refund blue',
				tabTitle: 'Refund tracker',
				tabDes: 'Monitor refund trends and stay informed on store returns.',
				count: refundCount,
			},
		},
		{
			type: 'file',
			module: 'marketplace-compliance',
			content: {
				id: 'report-abuse',
				name: 'Flagged',
				desc: 'Product reported for assessment',
				icon: 'product indigo',
				tabTitle: 'Flagged products awaiting action',
				tabDes: 'Review reports and maintain quality.',
				count: reportAbuseCount,
			},
		},
		{
			type: 'file',
			condition: settings?.disbursement?.withdraw_type === 'manual',
			content: {
				id: 'withdrawal',
				name: 'Withdrawals',
				desc: 'Queued for disbursement',
				icon: 'bank orange',
				tabTitle: 'Withdrawals awaiting approval',
				tabDes: 'Review and process store payouts.',
				count: withdrawCount,
			},
		},
		{
			type: 'file',
			content: {
				id: 'deactivate-requests',
				name: 'Deactivations',
				desc: 'Permanent store closure request',
				icon: 'rejecte teal',
				tabTitle: 'Stores requesting deactivation',
				tabDes: 'Approve or reject marketplace joiners.',
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
			<AdminBreadcrumbs
				activeTabIcon="adminfont-approval"
				tabTitle="Approval Queue"
				description={
					'Manage all pending administrative actions including approvals, payouts, and notifications.'
				}
			/>
			<Tabs
				tabData={tabData}
				currentTab={location.get('subtab') as string}
				getForm={getForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=approval-queue&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				supprot={[]}
				Link={Link}
				hideTitle={true}
				hideBreadcrumb={true}
				template={'template-3'}
				premium={false}
				menuIcon={true}
				desc={true}
				isLoading={isLoading}
			/>
		</>
	);
};

export default ApprovalQueue;
