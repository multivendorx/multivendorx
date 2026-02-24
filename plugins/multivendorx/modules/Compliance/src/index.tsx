import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { getApiLink } from 'zyra';
import PendingReportAbuse from './PendingAbuseReports';
import axios from 'axios';

let reportAbuseCount = 0;

axios
    .get(getApiLink(appLocalizer, 'report-abuse'), {
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
        params: {
            page: 1,
            row: 1,
        },
    })
    .then((res) => {
        reportAbuseCount = Number(res.headers['x-wp-total']) || 0;
    })
    .catch(() => { });


addFilter(
	'multivendorx_approval_queue_tab',
	'multivendorx/report-abuse-tab',
	(settingContent) => {

		settingContent.push({
			type: 'file',
			module: 'marketplace-compliance',
			content: {
				id: 'report-abuse',
				headerTitle: __('Flagged', 'multivendorx'),
				headerDescription: __(
					'Product reported for assessment',
					'multivendorx'
				),
				settingTitle: __('Flagged products awaiting action', 'multivendorx'),
				settingSubTitle: __('Review reports and maintain quality.', 'multivendorx'),
				headerIcon: 'product indigo',
				count: reportAbuseCount,
			},
		});

		return settingContent;
	}
);


addFilter(
	'multivendorx_approval_queue_tab_content',
	'multivendorx/report-abuse-tab-content',
	(defaultForm, { tabId, refreshCounts }) => {
		if (tabId === 'report-abuse') {
			return <PendingReportAbuse onUpdated={refreshCounts} />;
		}

		return defaultForm;
	}
);