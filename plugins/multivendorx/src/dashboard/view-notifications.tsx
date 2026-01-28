import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Tabs } from 'zyra';
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

	const tabData = [
		{
			type: 'file',
			content: {
				id: 'notifications',
				name: 'Notifications',
				desc: 'general',
				hideTabHeader: true,
				icon: 'notification',
			},
		},
		{
			type: 'file',
			content: {
				id: 'activity',
				name: 'Activities',
				desc: 'appearance',
				hideTabHeader: true,
				icon: 'tools',
			},
		},
		{
			type: 'file',
			content: {
				id: 'announcements',
				name: 'Announcements',
				desc: 'Store Info',
				hideTabHeader: true,
				icon: 'announcement',
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
			<Tabs
				tabData={tabData}
				currentTab={currentTab}
				getForm={getForm}
				prepareUrl={prepareUrl}
				appLocalizer={appLocalizer}
				settingName="Settings"
				template={'template-2'}
				supprot={[]}
				premium={false}
				Link={SimpleLink}
				hideTitle={true}
				hideBreadcrumb={true}
				menuIcon={true}
			/>
		</>
	);
});

export default ViewNotifications;
