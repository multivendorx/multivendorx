import { registerMultiVendorXRoute } from './routeRegistry';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import Stores from './components/Stores/Stores';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import StatusAndToolsRedirect from './components/Settings/StatusAndToolsRedirect';
import HelpSupportRedirect from './components/AdminDashboard/HelpSupportRedirect';
import Commissions from './components/Commissions/Commissions';
import Analytics from './components/Reports/Reports';
import ApprovalQueue from './components/ApprovalQueue/ApprovalQueue';
import Notifications from './components/Notifications/Notifications';
import TransactionHistory from './components/TransactionHistory/TransactionHistory';
import CustomersFeedback from './components/CustomersFeedback/CustomersFeedback';
import Compliance from './components/Compliance/Compliance';

registerMultiVendorXRoute({ tab: 'dashboard', component: AdminDashboard });
registerMultiVendorXRoute({ tab: 'settings', component: Settings });
// Status & Tools moved into Settings; old `#&tab=status-tools&subtab=…` links land on the same tab there.
registerMultiVendorXRoute({
	tab: 'status-tools',
	component: StatusAndToolsRedirect,
});
registerMultiVendorXRoute({ tab: 'modules', component: Modules });
registerMultiVendorXRoute({ tab: 'stores', component: Stores });
registerMultiVendorXRoute({ tab: 'commissions', component: Commissions });
registerMultiVendorXRoute({ tab: 'customers', component: CustomersFeedback });
registerMultiVendorXRoute({ tab: 'compliance', component: Compliance });
registerMultiVendorXRoute({ tab: 'approval-queue', component: ApprovalQueue });
registerMultiVendorXRoute({
	tab: 'transaction-history',
	component: TransactionHistory,
});
registerMultiVendorXRoute({ tab: 'reports', component: Analytics });
registerMultiVendorXRoute({ tab: 'notifications', component: Notifications });
// Help & Support moved to a card on the dashboard Overview; old `#&tab=help-support` links scroll to it there.
registerMultiVendorXRoute({
	tab: 'help-support',
	component: HelpSupportRedirect,
});
