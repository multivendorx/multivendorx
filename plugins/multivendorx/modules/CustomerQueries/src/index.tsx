import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import Queries from './QueriesTable';
import { getApiLink } from '@zyra/core';

addFilter(
	'multivendorx_customer_api_configs',
	'multivendorx/customer-api',
	(configs, { appLocalizer }) => {
		configs.push({
			id: 'customer-queries',
			url: getApiLink(appLocalizer, 'customer-queries'),
			params: {
				page: 1,
				row: 1,
			},
			header: 'x-wp-status-unanswered',
		});
		return configs;
	}
);

addFilter(
	'multivendorx_customers_tab',
	'multivendorx/customer-queries-tab',
	(tabs) => {
		tabs.push({
			type: 'file',
			module: 'customer-queries',
			content: {
				id: 'customer-queries',
				headerTitle: __('Queries', 'multivendorx'),
				settingTitle: __('Product questions in queue', 'multivendorx'),
				settingSubTitle: __(
					'Waiting for your response',
					'multivendorx'
				),
				headerIcon: 'question yellow',
			},
		});

		return tabs;
	}
);

addFilter(
	'multivendorx_customers_tab_content',
	'multivendorx/customer-queries-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'customer-queries') {
			return <Queries />;
		}

		return defaultForm;
	}
);
