import { addFilter } from '@wordpress/hooks';
import Knowledgebase from './Knowledgebase';

addFilter(
	'multivendorx_admin_submenu_render',
	'multivendorx/knowledgebase',
	(output, { tab }) => {
		if (tab === 'knowledgebase') {
			return <Knowledgebase />;
		}
		return output;
	}
);