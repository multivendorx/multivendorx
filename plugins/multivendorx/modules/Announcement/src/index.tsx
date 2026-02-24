import { addFilter } from '@wordpress/hooks';
import Announcements from './Announcements';

addFilter(
	'multivendorx_admin_submenu_render',
	'multivendorx/announcements',
	(output, { tab }) => {
		if (tab === 'announcements') {
			return <Announcements />;
		}
		return output;
	}
);