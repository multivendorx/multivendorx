import { registerMultiVendorXRoute } from './routeRegistry';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import Stores from './components/Stores/Stores';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import StatusAndTools from './components/StatusAndTools/StatusAndTools';
import Commissions from './components/Commissions/Commissions';
import Analytics from './components/Reports/Reports';
import HelpSupport from './components/HelpSupport/HelpSupport';
import ApprovalQueue from './components/ApprovalQueue/ApprovalQueue';
import Notifications from './components/Notifications/Notifications';
import TransactionHistory from './components/TransactionHistory/TransactionHistory';
import CustomersFeedback from './components/CustomersFeedback/CustomersFeedback';

registerMultiVendorXRoute({ tab: 'dashboard', component: AdminDashboard });
registerMultiVendorXRoute({ tab: 'settings', component: Settings });
registerMultiVendorXRoute({ tab: 'status-tools', component: StatusAndTools });
registerMultiVendorXRoute({ tab: 'modules', component: Modules });
registerMultiVendorXRoute({ tab: 'stores', component: Stores });
registerMultiVendorXRoute({ tab: 'commissions', component: Commissions });
registerMultiVendorXRoute({tab: 'customers',component: CustomersFeedback});
registerMultiVendorXRoute({ tab: 'approval-queue', component: ApprovalQueue });
registerMultiVendorXRoute({
	tab: 'transaction-history',
	component: TransactionHistory,
});
registerMultiVendorXRoute({ tab: 'reports', component: Analytics });
registerMultiVendorXRoute({ tab: 'help-support', component: HelpSupport });
registerMultiVendorXRoute({ tab: 'notifications', component: Notifications });
