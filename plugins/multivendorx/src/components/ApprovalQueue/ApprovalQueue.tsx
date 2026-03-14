import {  SettingsNavigator, useModules } from 'zyra';
import {  useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useLocation, Link } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';
import PendingStores from './PendingStores';
import PendingProducts from './PendingProducts';
import PendingCoupons from './PendingCoupons';
import PendingWithdrawal from './PendingWithdrawalRequests';
import PendingDeactivateRequests from './PendingDeactivateRequests';
import { getSession } from '@/services/commonFunction';

const ApprovalQueue = () => {
	const storeCount = getSession('storeCount', 0);
	const productCount = getSession('productCount', 0);
	const couponCount = getSession('couponCount', 0);
	const withdrawCount = getSession('withdrawCount', 0);
	const deactivateCount = getSession('deactivateCount', 0);

	const { modules } = useModules();
	const settings = appLocalizer.settings_databases_value || {};

	const location = new URLSearchParams(useLocation().hash.substring(1));

	const baseSettingContent = [
		{
			type: 'file',
			condition: settings?.general?.approve_store === 'manually',
			content: {
				id: 'stores',
				headerTitle: __('Stores', 'multivendorx'),
				headerDescription: __('Eager to join the marketplace', 'multivendorx'),
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
				!settings?.['store-permissions']?.products?.includes(
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
			condition: settings?.disbursement?.withdraw_type === 'manual',
			content: {
				id: 'withdrawal',
				headerTitle: __('Withdrawals', 'multivendorx'),
				headerDescription: __('Queued for disbursement', 'multivendorx'),
				settingTitle: __('Withdrawals awaiting approval', 'multivendorx'),
				settingSubTitle: __('Review and process store payouts.', 'multivendorx'),
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
				settingTitle: __('Stores requesting deactivation', 'multivendorx'),
				settingSubTitle: __(
					'Approve or reject marketplace joiners.',
					'multivendorx'
				),
				headerIcon: 'rejecte teal',
				count: deactivateCount,
			},
		}
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
