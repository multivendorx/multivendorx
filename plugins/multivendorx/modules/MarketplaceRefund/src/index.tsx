import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingRefund from './PendingRefund';

let refundCountState = {
	count : 0
};

// function to update count
const setRefundCount = (count: number) => {
	refundCountState.count = count;
};

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
				count: refundCountState.count,
			},
		});

		return settingContent;
	}
);


addFilter(
	'multivendorx_approval_queue_tab_content',
	'multivendorx/refund-tab-content',
	(defaultForm, { tabId }) => {

		if (tabId === 'refund-requests') {
			return <PendingRefund setCount={setRefundCount} />;
		}

		return defaultForm;
	}
);