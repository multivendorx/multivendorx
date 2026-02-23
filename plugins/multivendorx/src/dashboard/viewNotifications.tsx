import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { SettingsNavigator } from 'zyra';
import NotificationsTable from './notificationsTable';
import ActivitiesTable from './activityTable';
import AnnouncementsTable from './AnnouncementsTable';

const ViewNotifications = (React.FC = () => {
	const SimpleLink = ({ to, children, onClick, className }: any) => (
		<a href={to} onClick={onClick} className={className}>
			{children}
		</a>
	);

	const getCurrentTabFromUrl = () => {
		const hash = window.location.hash.replace(/^#/, '');
		const hashParams = new URLSearchParams(hash);
		return hashParams.get('subtab') || 'notifications';
	};

	const [currentTab, setCurrentTab] = useState(getCurrentTabFromUrl());

	useEffect(() => {
		const handleHashChange = () => setCurrentTab(getCurrentTabFromUrl());
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	// Build hash URL for a given tab
	const prepareUrl = (tabId: string) => `#subtab=${tabId}`;

	const settingContent = [
		{
			type: 'file',
			content: {
				id: 'notifications',
				headerTitle: __('Notifications', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'notification',
			},
		},
		{
			type: 'file',
			content: {
				id: 'activity',
				headerTitle: __('Activities', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'tools',
			},
		},
		{
			type: 'file',
			content: {
				id: 'announcements',
				headerTitle: __('Announcements', 'multivendorx'),
				hideSettingHeader: true,
				headerIcon: 'announcement',
			},
		},
	];

	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'notifications':
				return <NotificationsTable />;
			case 'activity':
				return <ActivitiesTable />;
			case 'announcements':
				return <AnnouncementsTable />;
			default:
				return <div></div>;
		}
	};
	return (
		<>
			<SettingsNavigator
				settingContent={settingContent}
				currentSetting={currentTab}
				getForm={getForm}
				prepareUrl={prepareUrl}
				appLocalizer={appLocalizer}
				settingName="Settings"
				variant={'compact'}
				Link={SimpleLink}
			/>
		</>
	);
});

export default ViewNotifications;
