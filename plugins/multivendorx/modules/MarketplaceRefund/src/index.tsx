/* global appLocalizer */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingRefund from './PendingRefund';
import axios from 'axios';

addFilter(
	'multivendorx_approval_queue_api_configs',
	'multivendorx/refund-api',
	(configs, { appLocalizer }) => {
		configs.push({
			id: 'refund-requests',
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			params: {
				meta_key: 'multivendorx_store_id',
				status: 'refund-requested',
				page: 1,
				per_page: 1,
			},
			header: 'x-wp-total',
		});
		return configs;
	}
);

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
            return (
                <PendingRefund />
            );
        }

        return defaultForm;
    }
);
