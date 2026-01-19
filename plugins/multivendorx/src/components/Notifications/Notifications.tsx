import { Tabs } from 'zyra';
import { Link, useLocation } from 'react-router-dom';
import NotificationTable from './NotificationTable';
import ActivityTable from './ActivityTable';

const Notifications = () => {
	const location = new URLSearchParams(useLocation().hash.substring(1));
	const initialTab = location.get('subtab') || 'notifications';

	const tabData = [
		{
			type: 'file',
			content: {
				id: 'notifications',
				name: 'Notifications',
				desc: 'Store Info',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'activities',
				name: 'Activities',
				desc: 'Store Info',
				hideTabHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
	];

	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'notifications':
				return <NotificationTable />;
			case 'activities':
				return <ActivityTable />;
			default:
				return <div></div>;
		}
	};

	return (
		<Tabs
			tabData={tabData}
			currentTab={initialTab}
			getForm={getForm}
			prepareUrl={(tabid: string) => `?page=multivendorx#&tab=notifications&subtab=${tabid}`}
			appLocalizer={appLocalizer}
			template={'template-2'}
			premium={false}
			Link={Link}
			hideTitle={true}
			hideBreadcrumb={true}
		/>
	);
};

export default Notifications;
