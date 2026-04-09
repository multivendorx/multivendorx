import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import StoreReviews from './StoreReviews';

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
				headerIcon: 'store-review',
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
