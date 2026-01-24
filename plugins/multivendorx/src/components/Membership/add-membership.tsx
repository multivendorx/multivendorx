import { Link, useLocation } from 'react-router-dom';
import { Tabs } from 'zyra';

import MessageAndMail from './messageAndMail';
import Plans from './plans';
import Settings from './settings';
import Subscribers from './subscribers';
import Notifications from './notifications';
import Membership from './membership';

const Memberships = () => {
	const location = useLocation();

	const hash = location.hash.replace(/^#/, '');
	const isAddMem = hash.includes('add');

	const hashParams = new URLSearchParams(hash);
	const currentTab = hashParams.get('subtab') || 'payment-membership-plans';

	const prepareUrl = (tabId: string) =>
		`?page=multivendorx#&tab=memberships&subtab=${tabId}`;

	const tabData = [
		{
			type: 'file',
			content: {
				id: 'payment-membership-plans',
				name: 'Plans',
				desc: 'Design pricing tiers that drive conversions and maximize revenue.',
				icon: 'adminfont-credit-card',
				hideTabHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'payment-membership-design',
				name: 'Subscribers',
				desc: 'Track every subscription at a glance-identify expiring plans, monitor revenue.',
				icon: 'adminfont-credit-card',
				hideTabHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'payment-membership-message',
				name: 'Settings',
				desc: 'Manage membership pages, reminders, renewals, and payment connections.',
				icon: 'adminfont-credit-card',
				hideTabHeader: true,
			},
		},
	];

	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'payment-membership-plans':
				return <Plans />;
			case 'payment-membership-design':
				return <Subscribers />;
			case 'payment-membership-message':
				return <Settings />;
			default:
				return <div></div>;
		}
	};

	return (
		<>
			{isAddMem && <Membership />}

			{!isAddMem && (
				<Tabs
					tabData={tabData}
					currentTab={currentTab}
					getForm={getForm}
					prepareUrl={prepareUrl}
					appLocalizer={appLocalizer}
					Link={Link}
					settingName={'Memberships'}
				/>
			)}
		</>
	);
};

export default Memberships;
