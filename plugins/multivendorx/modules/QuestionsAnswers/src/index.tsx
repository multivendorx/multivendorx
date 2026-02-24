import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import Qna from './QnATable';

addFilter(
	'multivendorx_customer_support_tab',
	'multivendorx/question-answer-tab',
	(tabs) => {
		tabs.push({
			type: 'file',
			module: 'question-answer',
			content: {
				id: 'questions',
				headerTitle: __('Questions', 'multivendorx'),
				headerIcon: 'question',
			},
		});

		return tabs;
	}
);

addFilter(
	'multivendorx_customer_support_tab_content',
	'multivendorx/question-answer-content',
	(defaultForm, { tabId }) => {

		if (tabId === 'questions') {
			return <Qna />;
		}

		return defaultForm;
	}
);