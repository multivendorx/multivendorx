import { AdminBreadcrumbs, getApiLink, useModules, Tabs, Container, Column, MessageState } from 'zyra';
import './customerServices.scss';
import '../AdminDashboard/adminDashboard.scss';
import Qna from './qnaTable';
import StoreReviews from './storeReviews ';
import { useLocation, Link } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

const CustomerServices = () => {
	const { modules } = useModules();

	const location = new URLSearchParams(useLocation().hash.substring(1));

	const tabData = [
		{
			type: 'file',
			module: 'question-answer',
			content: {
				id: 'questions',
				name: 'Questions',
				desc: 'Waiting for your response',
				icon: 'question',
				tabTitle: 'Product questions in queue',
				tabDes: 'Waiting for your response',
			},
		},
		{
			type: 'file',
			module: 'store-review',
			content: {
				id: 'review',
				name: 'Store Reviews',
				icon: 'store-review',
				desc: 'Track and manage reviews for all stores.',
				tabTitle: 'Store reviews at a glance',
				tabDes: 'Track and manage reviews for all stores.',
			},
		},
		{
			type: 'file',
			module: 'customer-support',
			content: {
				id: 'support-ticket',
				name: 'Support Ticket',
				des: 'Flagged for abuse review',
				icon: 'vacation',
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
							<h1>Upcoming Feature</h1>
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
			<AdminBreadcrumbs
				activeTabIcon="adminfont-customer-service"
				tabTitle={__('Customer Service', 'multivendorx')}
				description={__(
					'Manage store reviews, support requests, financial transactions, and reported issues.',
					'multivendorx'
				)}
			/>
			{tabData.length > 0 ? (
				<Tabs
					tabData={tabData}
					currentTab={location.get('subtab') as string}
					getForm={getForm}
					prepareUrl={(subTab: string) =>
						`?page=multivendorx#&tab=customer-support&subtab=${subTab}`
					}
					appLocalizer={appLocalizer}
					supprot={[]}
					Link={Link}
					hideTitle={true}
					hideBreadcrumb={true}
					template={'template-2'}
					premium={false}
					menuIcon={true}
				/>
			) : (
				<Container general>
					<Column>
						<MessageState
							title={__('Looks like customer support isn’t set up yet!', 'multivendorx')}
							desc={__('Turn on a support module to start assisting your customers.', 'multivendorx')}
							buttonText={__('Enable Now', 'multivendorx')}
							buttonLink={appLocalizer.module_page_url}
						/>
					</Column>
				</Container>
			)}
		</>
	);
};

export default CustomerServices;
