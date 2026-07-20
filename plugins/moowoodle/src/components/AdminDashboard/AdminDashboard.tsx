/* global appLocalizer */
import './AdminDashboard.scss';
// import '../dashboard.scss';
import { Column, Container } from '@zyra/components';
import { TabsUI } from '@zyra/admin';
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
			{__('Upgrade Now', 'moowoodle')}
			<i className="adminfont-arrow-right icon-pro-btn"></i>
		</a>
	);

	const tabs = [
		{
			key: 'dashboard',
			label: __('Dashboard', 'moowoodle'),
			icon: 'module',
			content: <DashboardTab />,
		},
		{
			key: 'free-vs-pro',
			pro: true,
			label: __('Free vs Pro', 'moowoodle'),
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
