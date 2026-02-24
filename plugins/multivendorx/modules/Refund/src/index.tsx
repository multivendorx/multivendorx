import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingRefund from './PendingRefund';
import axios from 'axios';

let refundCount = 0;

// Fetch once
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
	.then((res) => {
		refundCount = Number(res.headers['x-wp-total']) || 0;
	})
	.catch(() => {});


addFilter(
	'multivendorx_approval_queue_tab',
	'multivendorx/refund-tab',
	(settingContent) => {

		settingContent.push({
			type: 'file',
			module: 'marketplace-refund',
			content: {
				id: 'refund-requests',
				headerTitle: __('Refunds', 'multivendorx'),
				headerDescription: __('Need your decision', 'multivendorx'),
				settingTitle: __('Refund tracker', 'multivendorx'),
				settingSubTitle: __(
					'Monitor refund trends and stay informed on returns.',
					'multivendorx'
				),
				headerIcon: 'marketplace-refund blue',
				count: refundCount,
			},
		});

		return settingContent;
	}
);


addFilter(
	'multivendorx_approval_queue_tab_content',
	'multivendorx/refund-tab-content',
	(defaultForm, { tabId, refreshCounts }) => {

		if (tabId === 'refund-requests') {
			return <PendingRefund onUpdated={refreshCounts} />;
		}

		return defaultForm;
	}
);