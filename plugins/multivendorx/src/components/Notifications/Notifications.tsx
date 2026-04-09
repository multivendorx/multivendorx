/* global appLocalizer */
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
				headerTitle: __('Notifications', 'multivendorx'),
				headerIcon: 'marketplace-membership',
				hideSettingHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'activities',
				headerTitle: __('Activities', 'multivendorx'),
				headerIcon: 'marketplace-membership',
				hideSettingHeader: true,
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
			menuIcon={true}
			headerIcon="report"
			headerTitle={__('notifications', 'multivendorx')}
			headerDescription={__(
				'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Facilis odio atque sunt autem exercitationem praesentium ullam deleniti iste laboriosam iure.',
				'multivendorx'
			)}
			variant={'compact'}
			Link={Link}
		/>
	);
};

export default Notifications;
