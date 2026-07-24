import { registerVuloPilotRoute } from './routeRegistry';

import Dashboard from './pages/Dashboard/Dashboard';
import Health from './pages/Health/Health';
import SEO from './pages/SEO/SEO';
import GEO from './pages/GEO/GEO';
import WooCommerce from './pages/WooCommerce/WooCommerce';
import Automation from './pages/Automation/Automation';
import Reports from './pages/Reports/Reports';
import AIAssistant from './pages/AIAssistant/AIAssistant';
import Activity from './pages/Activity/Activity';
import Settings from './pages/Settings/Settings';
import Modules from './components/Modules/Modules';

registerVuloPilotRoute({ tab: 'dashboard', component: Dashboard });
registerVuloPilotRoute({ tab: 'health', component: Health });
registerVuloPilotRoute({ tab: 'seo', component: SEO });
registerVuloPilotRoute({ tab: 'geo', component: GEO });
registerVuloPilotRoute({ tab: 'woocommerce', component: WooCommerce });
registerVuloPilotRoute({ tab: 'automation', component: Automation });
registerVuloPilotRoute({ tab: 'reports', component: Reports });
registerVuloPilotRoute({ tab: 'ai-assistant', component: AIAssistant });
registerVuloPilotRoute({ tab: 'activity', component: Activity });
registerVuloPilotRoute({ tab: 'modules', component: Modules });
registerVuloPilotRoute({ tab: 'settings', component: Settings });
