/* global appLocalizer */
import './AdminDashboard.scss';
import { LayoutColumnComponent, ContainerComponent, TabsComponent } from '@zyra/components';
import { __ } from '@wordpress/i18n';
import FreeVsProTab from './FreeVsProTab';
import DashboardTab from './DashboardTab';

const AdminDashboard = () => {
	const upgradeButton = !appLocalizer.khali_dabba && (
		<a
			href={appLocalizer.pro_url}
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
		<ContainerComponent className="dashboard-tab">
			<LayoutColumnComponent>
				<TabsComponent
					tabs={tabs}
					className="background"
					headerExtra={upgradeButton}
				/>
			</LayoutColumnComponent>
		</ContainerComponent>
	);
};

export default AdminDashboard;
