import {
	useModules,
	Container,
	Column,
	ComponentStatusView,
	SettingsNavigator,
} from 'zyra';
import '../AdminDashboard/AdminDashboard.scss';
import Qna from './QnATable';
import StoreReviews from './StoreReviews';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

const CustomerSupport = () => {
	const { modules } = useModules();

	const location = new URLSearchParams(useLocation().hash.substring(1));

	const settingContent = [
		{
			type: 'file',
			module: 'question-answer',
			content: {
				id: 'questions',
				headerTitle: __('Questions', 'multivendorx'),
				headerIcon: 'question',
			},
		},
		{
			type: 'file',
			module: 'store-review',
			content: {
				id: 'review',
				headerTitle: __('Store Reviews', 'multivendorx'),
				headerIcon: 'store-review',
			},
		},
		{
			type: 'file',
			module: 'store-support',
			content: {
				id: 'support-ticket',
				headerTitle: __('Support Ticket', 'multivendorx'),
				headerIcon: 'vacation',
			},
		},
	].filter((tab) => !tab.module || modules.includes(tab.module));

	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'questions':
				return <Qna />;
			case 'review':
				return <StoreReviews />;
			case 'support-ticket':
				return (
					<div className="card-wrapper">
						<div className="card-content">
							<h1>{__('Upcoming Feature', 'multivendorx')}</h1>
						</div>
					</div>
				);
			default:
				return <div></div>;
		}
	};
	const link =
		typeof appLocalizer?.module_page_url === 'string' &&
			appLocalizer.module_page_url.trim().length > 0
			? appLocalizer.module_page_url
			: undefined;

	return (
		<>
			{settingContent.length > 0 ? (
				<SettingsNavigator
					settingContent={settingContent}
					currentSetting={location.get('subtab') as string}
					getForm={getForm}
					prepareUrl={(subTab: string) =>
						`?page=multivendorx#&tab=customer-support&subtab=${subTab}`
					}
					appLocalizer={appLocalizer}
					Link={Link}
					variant={'compact'}
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
							buttonLink={`${appLocalizer.plugin_url}modules`}
						/>
					</Column>
				</Container>
			)}
		</>
	);
};

export default CustomerSupport;
