/* global appLocalizer */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingReportAbuse from './PendingAbuseReports';
import { getApiLink } from 'zyra';

addFilter(
	'multivendorx_compliance_api_configs',
	'multivendorx/report-abuse-api',
	(configs, { appLocalizer }) => {
		configs.push({
			id: 'report-abuse',
			url: getApiLink(appLocalizer, 'compliance/report-abuse'),
			params: { page: 1, row: 1 },
			header: 'x-wp-total',
		});

		return configs;
	}
);

addFilter(
	'multivendorx_compliance_tab',
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
				settingTitle: __(
					'Flagged products awaiting action',
					'multivendorx'
				),
				settingSubTitle: __(
					'Review reports and maintain quality.',
					'multivendorx'
				),
				headerIcon: 'storefront indigo',
			},
		});

		return settingContent;
	}
);

addFilter(
	'multivendorx_compliance_tab_content',
	'multivendorx/report-abuse-tab-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'report-abuse') {
			return <PendingReportAbuse />;
		}

		return defaultForm;
	}
);
