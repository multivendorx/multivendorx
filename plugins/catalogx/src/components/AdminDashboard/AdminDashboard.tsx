/* global appLocalizer */
import './AdminDashboard.scss';
import { Column, Container, TabsUI } from 'zyra';
import { __ } from '@wordpress/i18n';
import FreeVsProTab from './FreeVsProTab';
import DashboardTab from './DashboardTab';

const AdminDashboard = () => {
	const upgradeButton = !appLocalizer.khali_dabba && (
		<a
			href={appLocalizer.shop_url}
			target="_blank"
			className="admin-btn btn-purple"
		>
			<i className="adminfont-pro-tag"></i>
			{__('Upgrade Now', 'catalogx')}
			<i className="adminfont-arrow-right icon-pro-btn"></i>
		</a>
	);

	const tabs = [
		{
			key: 'dashboard',
			label: __('Dashboard', 'catalogx'),
			icon: 'module',
			content: <DashboardTab />,
		},
		{
			key: 'free-vs-pro',
			pro: true,
			label: __('Free vs Pro', 'catalogx'),
			icon: 'pros-and-cons',
			content: <FreeVsProTab />,
		},
	].filter((tab) => !(appLocalizer?.khali_dabba && tab.pro));

	return (
		<Container className="dashboard-tab">
			<Column>
				<TabsUI
					tabs={tabs}
					className="background"
					headerExtra={upgradeButton}
				/>
			</Column>
		</Container>
	);
};

export default AdminDashboard;
