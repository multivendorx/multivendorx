import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingReportAbuse from './PendingAbuseReports';
import PendingVerification from './PendingVerification';
import PendingTaxCompliance from './PendingTaxCompliance';

const reportAbuseState = {
	count: 0,
};

// function to update count
const setReportAbuseCount = (count: number) => {
	reportAbuseState.count = count;
};

const identityState = { count: 0 };

const setIdentityCount = (count: number) => {
	identityState.count = count;
};

const taxState = { count: 0 };

const setTaxCount = (count: number) => {
	taxState.count = count;
};

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
				settingTitle: __(
					'Flagged products awaiting action',
					'multivendorx'
				),
				settingSubTitle: __(
					'Review reports and maintain quality.',
					'multivendorx'
				),
				headerIcon: 'product indigo',
				count: reportAbuseState.count,
			},
		});

		return settingContent;
	}
);

addFilter(
	'multivendorx_approval_queue_tab',
	'multivendorx/identity-tab',
	(settingContent) => {
		settingContent.push({
			type: 'file',
			module: 'marketplace-compliance',
			content: {
				id: 'identity',
				headerTitle: __('Store Identity', 'multivendorx'),
				headerDescription: __(
					'Store files and documents for verification',
					'multivendorx'
				),
				settingTitle: __(
					'Documents waiting verification',
					'multivendorx'
				),
				settingSubTitle: __(
					'Review files and documents.',
					'multivendorx'
				),
				headerIcon: 'product indigo',
				count: identityState.count,
			},
		});

		return settingContent;
	}
);

addFilter(
	'multivendorx_approval_queue_tab',
	'multivendorx/tax-compliance-tab',
	(settingContent) => {
		settingContent.push({
			type: 'file',
			module: 'marketplace-compliance',
			content: {
				id: 'tax-compliance',
				headerTitle: __('Tax Compliance', 'multivendorx'),
				headerDescription: __(
					'Store tax documents for verification',
					'multivendorx'
				),
				settingTitle: __(
					'Tax documents awaiting review',
					'multivendorx'
				),
				settingSubTitle: __(
					'Review submitted tax compliance documents.',
					'multivendorx'
				),
				headerIcon: 'product indigo',
				count: taxState.count,
			},
		});

		return settingContent;
	}
);

addFilter(
	'multivendorx_approval_queue_tab_content',
	'multivendorx/tax-compliance-tab-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'tax-compliance') {
			return <PendingTaxCompliance setCount={setTaxCount} />;
		}

		return defaultForm;
	}
);

addFilter(
	'multivendorx_approval_queue_tab_content',
	'multivendorx/identity-tab-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'identity') {
			return console.log(identityState.count) ||<PendingVerification setCount={setIdentityCount}/>;
		}

		return defaultForm;
	}
);

addFilter(
	'multivendorx_approval_queue_tab_content',
	'multivendorx/report-abuse-tab-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'report-abuse') {
			return <PendingReportAbuse setCount={setReportAbuseCount} />;
		}

		return defaultForm;
	}
);
