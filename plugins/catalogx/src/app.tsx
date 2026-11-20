/* global appLocalizer */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { NoticeComponent } from '@zyra/components';

import Settings from './components/Settings/Settings';
// Registers the `builderform-email` settings field, which zyra 1.0.65 no longer registers itself.
import './components/Settings/EmailTemplateField';
import EnquiryMessages from './components/EnquiryMessages/enquiryMessages';
import WholesaleUser from './components/WholesaleUser/wholesaleUser';
import Rules from './components/Rules/Rules';
import QuoteRequests from './components/QuoteRequests/QuoteRequests';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import SearchHeader from './components/Header/SearchHeader';
import GuidedTour from './components/Tour/Tours';
import './styles/admin.scss';

localStorage.setItem('force_catalogx_context_reload', 'true');

/**
 * Old links that pointed at screens which moved: `tab=modules` (Modules is a Settings tab) and `tab=help-support`
 * (Help & Support is a card on the dashboard). Each maps to the hash that shows it now.
 */
const movedLink = (hashParams: URLSearchParams): string | null => {
	const tab = hashParams.get('tab');

	if ('modules' === tab) {
		const module = hashParams.get('module');

		return `#&tab=settings&subtab=modules${module ? `&module=${encodeURIComponent(module)}` : ''}`;
	}

	if ('help-support' === tab) {
		return '#&tab=dashboard&view=help-support';
	}

	return null;
};

/**
 * Picks the screen for the open tab. Tabs are admin sidebar submenu entries (classes/Admin.php), each pointing to
 * `catalogx#&tab={tab}`, so switching tabs only changes the hash.
 */
const Route = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const hashParams = new URLSearchParams(location.hash);
	const tab = hashParams.get('tab');
	const redirectTo = movedLink(hashParams);

	useEffect(() => {
		if (redirectTo) {
			navigate(`${location.pathname}${location.search}${redirectTo}`, {
				replace: true,
			});
		}
	}, [redirectTo]);

	// The submenu entries are hash tabs, which WordPress can't match on the server, so mark the open one here.
	useEffect(() => {
		document
			.querySelectorAll('#toplevel_page_catalogx .wp-submenu li')
			.forEach((item) => {
				const link = item.querySelector('a');
				const href = link?.getAttribute('href') ?? '';
				const linkTab = new URLSearchParams(
					href.split('#')[1] ?? ''
				).get('tab');
				const isCurrent = !!tab && linkTab === tab;

				item.classList.toggle('current', isCurrent);
				link?.classList.toggle('current', isCurrent);
			});
	}, [tab]);

	switch (tab) {
		case 'dashboard':
			return <AdminDashboard />;
		case 'settings':
			return <Settings id="settings" />;
		case 'quote-requests':
			return <QuoteRequests />;
		case 'wholesale-users':
			return <WholesaleUser />;
		case 'enquiry-messages':
			return <EnquiryMessages />;
		case 'rules':
			return <Rules />;
		default:
			return null;
	}
};

const bannerItem = [
	__(
		'<b>Advanced enquiry management:</b> Organize, track, and respond to every enquiry from one powerful dashboard.',
		'catalogx'
	),
	__(
		'<b>Multi-product enquiries:</b> Let customers enquire about multiple products in a single request to generate more qualified leads.',
		'catalogx'
	),
	__(
		'<b>Professional quotations:</b> Create, send, approve, and manage quotations with expiry dates and PDF downloads.',
		'catalogx'
	),
	__(
		'<b>Wholesale selling:</b> Unlock B2B sales with wholesale pricing, customer roles, and bulk ordering tools.',
		'catalogx'
	),
	__(
		'<b>Dynamic pricing rules:</b> Create advanced pricing strategies based on customer roles, quantities, products, and categories.',
		'catalogx'
	),
	__(
		'<b>Visual page builder:</b> Build enquiry, quotation, and wholesale pages without writing a single line of code.',
		'catalogx'
	),
	__(
		'<b>Custom form builder:</b> Design enquiry and quotation forms that collect exactly the information your business needs.',
		'catalogx'
	),
	__(
		'<b>Higher conversions:</b> Show both purchasing and enquiry options together so customers can buy or contact you their way.',
		'catalogx'
	),
];

const BANNER_DISMISS_STORAGE_KEY = 'catalogx_banner_dismissed';

/** Whether the Pro banner was dismissed in this browser (storage can throw in private windows). */
const isBannerDismissed = (): boolean => {
	try {
		return 'true' === localStorage.getItem(BANNER_DISMISS_STORAGE_KEY);
	} catch {
		return false;
	}
};

/**
 * Root of the admin app: the search header, the Pro banner (Free only, until dismissed), the guided tour and the
 * screen for the open tab.
 */
const App = () => (
	<>
		<SearchHeader />
		{!appLocalizer.khali_dabba && !isBannerDismissed() && (
			<NoticeComponent
				uniqueKey="banner"
				type="banner"
				dismissStorageKey={BANNER_DISMISS_STORAGE_KEY}
				validity="lifetime"
				displayPosition="banner"
				message={bannerItem}
				actionLabel={__('Upgrade Now', 'catalogx')}
				onAction={() => {
					window.location.href = appLocalizer.pro_url;
				}}
			/>
		)}
		<GuidedTour />
		<Route />
	</>
);

export default App;
