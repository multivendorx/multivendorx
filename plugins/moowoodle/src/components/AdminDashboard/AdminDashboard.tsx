/* global appLocalizer */
import './AdminDashboard.scss';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
	TabsComponent,
} from '@zyra/components';
import { __ } from '@wordpress/i18n';
import FreeVsProTab from './FreeVsProTab';
import DashboardTab from './DashboardTab';

/**
 * MooWoodle → Dashboard: the same page header as every other MooWoodle screen, then the dashboard. Free sites also get
 * a Free vs Pro tab; with Pro there is nothing to compare, so the dashboard shows without a tab bar.
 */
const AdminDashboard = () => {
	const isPro = !!appLocalizer.khali_dabba;

	const upgradeButton = !isPro && (
		<a
			href={appLocalizer.shop_url}
			target="_blank"
			rel="noopener noreferrer"
			className="admin-btn btn-purple"
		>
			<i className="adminfont-pro-tag" aria-hidden="true"></i>
			{__('Upgrade to Pro', 'moowoodle')}
			<span className="screen-reader-text">
				{__('(opens in a new tab)', 'moowoodle')}
			</span>
		</a>
	);

	return (
		<>
			<NavigatorHeaderComponent
				headerIcon="module"
				headerTitle={__('Dashboard', 'moowoodle')}
				headerDescription={__(
					'How your courses are selling, what needs a look, and the next step to take.',
					'moowoodle'
				)}
				headerCustomContent={upgradeButton || undefined}
			/>
			<ContainerComponent general className="dashboard-tab">
				<ColumnComponent>
					{isPro ? (
						<DashboardTab />
					) : (
						<TabsComponent
							tabs={[
								{
									key: 'dashboard',
									label: __('Overview', 'moowoodle'),
									icon: 'module',
									content: <DashboardTab />,
								},
								{
									key: 'free-vs-pro',
									label: __('Free vs Pro', 'moowoodle'),
									icon: 'pros-and-cons',
									content: <FreeVsProTab />,
								},
							]}
							className="background"
						/>
					)}
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default AdminDashboard;
