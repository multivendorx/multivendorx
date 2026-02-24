import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import StoreReviews from './StoreReviews';

addFilter(
	'multivendorx_customer_support_tab',
	'multivendorx/store-review-tab',
	(tabs) => {
		tabs.push({
			type: 'file',
			module: 'store-review',
			content: {
				id: 'review',
				headerTitle: __('Store Reviews', 'multivendorx'),
				headerIcon: 'store-review',
			},
		});

		return tabs;
	}
);

addFilter(
	'multivendorx_customer_support_tab_content',
	'multivendorx/store-review-content',
	(defaultForm, { tabId }) => {

		if (tabId === 'review') {
			return <StoreReviews />;
		}

		return defaultForm;
	}
);