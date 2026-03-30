/* global appLocalizer */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import PendingReportAbuse from './PendingAbuseReports';
import PendingVerification from './PendingVerification';
import PendingTaxCompliance from './PendingTaxCompliance';
import axios from 'axios';
import { getApiLink } from 'zyra';

window.__multivendorxPendingCounts = window.__multivendorxPendingCounts || {};

axios
    .get(getApiLink(appLocalizer, 'report-abuse'), {
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
        params: { page: 1, row: 1 },
    })
    .then((res) => {
        const count = Number(res.headers['x-wp-total']) || 0;
        window.__multivendorxPendingCounts['report-abuse'] = count;
        window.dispatchEvent(
            new CustomEvent('multivendorx:count-update', {
                detail: { id: 'report-abuse', count },
            })
        );
    });

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
                count: 0,
            },
        });

        return settingContent;
    }
);

addFilter(
    'multivendorx_approval_queue_tab_content',
    'multivendorx/report-abuse-tab-content',
    (defaultForm, { tabId }) => {
        if (tabId === 'report-abuse') {
            return (
                <PendingReportAbuse
                    setCount={(count) => {
                        window.__multivendorxPendingCounts['report-abuse'] = count;
                        window.dispatchEvent(
                            new CustomEvent('multivendorx:count-update', {
                                detail: { id: 'report-abuse', count },
                            })
                        );
                    }}
                />
            );
        }

        return defaultForm;
    }
);