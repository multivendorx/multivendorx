import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import Queries from './QueriesTable';

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
				headerIcon: 'question',
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
