/* global appLocalizer */
import {
	useModules,
	Container,
	Column,
	ComponentStatusView,
	SettingsNavigator,
} from 'zyra';
import '../AdminDashboard/AdminDashboard.scss';
import { applyFilters } from '@wordpress/hooks';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

const CustomersFeedback = () => {
	const { modules } = useModules();
	const location = new URLSearchParams(useLocation().hash.substring(1));

	const settingContent = applyFilters(
		'multivendorx_customers_tab',
		[]
	).filter((tab) => !tab.module || modules.includes(tab.module));

	const getForm = (tabId: string) => {
		return (
			applyFilters('multivendorx_customers_tab_content', null, {
				tabId,
			}) || <div />
		);
	};

	return (
		<>
			{settingContent.length > 0 ? (
				<SettingsNavigator
					settingContent={settingContent}
					currentSetting={location.get('subtab') as string}
					getForm={getForm}
					prepareUrl={(subTab: string) =>
						`?page=multivendorx#&tab=customers&subtab=${subTab}`
					}
					appLocalizer={appLocalizer}
					Link={Link}
					variant={'compact'}
					menuIcon={true}
					headerIcon="customer-service"
					headerTitle={__('Customer Support', 'multivendorx')}
					headerDescription={__(
						'Manage store reviews, support requests, financial transactions, and reported issues.',
						'multivendorx'
					)}
				/>
			) : (
				<Container general>
					<Column>
						<ComponentStatusView
							title={__(
								'Looks like customer support isn’t set up yet!',
								'multivendorx'
							)}
							desc={__(
								'Turn on a support module to start assisting your customers.',
								'multivendorx'
							)}
							buttonText={__('Enable Now', 'multivendorx')}
							buttonLink={`${appLocalizer.admin_dashboard_url}#&tab=modules`}
						/>
					</Column>
				</Container>
			)}
		</>
	);
};

export default CustomersFeedback;
