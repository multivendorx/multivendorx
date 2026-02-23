import { SettingsNavigator } from 'zyra';
import { Link, useLocation } from 'react-router-dom';
import NotificationTable from './NotificationTable';
import ActivityTable from './ActivityTable';
import { __ } from '@wordpress/i18n';

const Notifications = () => {
	const location = new URLSearchParams(useLocation().hash.substring(1));

	const settingContent = [
		{
			type: 'file',
			content: {
				id: 'notifications',
				name: __('Notifications', 'multivendorx'),
				desc: __('Store Info', 'multivendorx'),
				hideSettingHeader: true,
				icon: 'adminfont-credit-card',
			},
		},
		{
			type: 'file',
			content: {
				id: 'activities',
				name: __('Activities', 'multivendorx'),
				desc: __('Store Info', 'multivendorx'),
				hideSettingHeader: true,
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
		<SettingsNavigator
			settingContent={settingContent}
			currentSetting={location.get('subtab') as string}
			getForm={getForm}
			prepareUrl={(tabid: string) =>
				`?page=multivendorx#&tab=notifications&subtab=${tabid}`
			}
			appLocalizer={appLocalizer}
			variant={'compact'}
			Link={Link}
		/>
	);
};

export default Notifications;
