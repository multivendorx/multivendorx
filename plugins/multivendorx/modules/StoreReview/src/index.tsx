import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import StoreReviews from './StoreReviews';
import { getApiLink } from '@zyra/core';

addFilter(
	'multivendorx_customer_api_configs',
	'multivendorx/store-review-api',
	(configs, { appLocalizer }) => {
		configs.push({
			id: 'store-review',
			url: getApiLink(appLocalizer, 'reviews'),
			params: {
				page: 1,
				row: 1,
			},
			header: 'x-wp-status-pending',
		});
		return configs;
	}
);

addFilter(
	'multivendorx_customers_tab',
	'multivendorx/store-review-tab',
	(tabs) => {
		tabs.push({
			type: 'file',
			module: 'store-review',
			content: {
				id: 'store-review',
				headerTitle: __('Store Reviews', 'multivendorx'),
				headerIcon: 'store-review red',
				settingTitle: __('Store reviews at a glance', 'multivendorx'),
				settingSubTitle: __(
					'Track and manage reviews for all stores.',
					'multivendorx'
				),
			},
		});

		return tabs;
	}
);

addFilter(
	'multivendorx_customers_tab_content',
	'multivendorx/store-review-content',
	(defaultForm, { tabId }) => {
		if (tabId === 'store-review') {
			return <StoreReviews />;
		}

		return defaultForm;
	}
);
