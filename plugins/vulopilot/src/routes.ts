import { registerVuloPilotRoute } from './routeRegistry';

import Dashboard from './pages/Dashboard/Dashboard';
import Health from './pages/Health/Health';
import SEO from './pages/SEO/SEO';
import Performance from './pages/Performance/Performance';
import Accessibility from './pages/Accessibility/Accessibility';
import GEO from './pages/GEO/GEO';
import CrawlerTraffic from './pages/CrawlerTraffic/CrawlerTraffic';
import WooCommerce from './pages/WooCommerce/WooCommerce';
import Automation from './pages/Automation/Automation';
import Reports from './pages/Reports/Reports';
import AIAssistant from './pages/AIAssistant/AIAssistant';
import Activity from './pages/Activity/Activity';
import Settings from './pages/Settings/Settings';
import Modules from './components/Modules/Modules';
import BrandVisibility from './pages/BrandVisibility/BrandVisibility';
import Security from './pages/Security/Security';
import AIContent from './pages/AIContent/AIContent';
import Content from './pages/Content/Content';
import Schema from './pages/Schema/Schema';
import Redirects from './pages/Redirects/Redirects';

registerVuloPilotRoute({ tab: 'dashboard', component: Dashboard });
registerVuloPilotRoute({ tab: 'health', component: Health });
registerVuloPilotRoute({ tab: 'seo', component: SEO });
registerVuloPilotRoute({ tab: 'performance', component: Performance });
registerVuloPilotRoute({ tab: 'accessibility', component: Accessibility });
registerVuloPilotRoute({ tab: 'geo', component: GEO });
registerVuloPilotRoute({
	tab: 'crawler-traffic',
	component: CrawlerTraffic,
});
registerVuloPilotRoute({ tab: 'woocommerce', component: WooCommerce });
registerVuloPilotRoute({ tab: 'automation', component: Automation });
registerVuloPilotRoute({ tab: 'reports', component: Reports });
registerVuloPilotRoute({ tab: 'ai-assistant', component: AIAssistant });
registerVuloPilotRoute({ tab: 'activity', component: Activity });
registerVuloPilotRoute({ tab: 'modules', component: Modules });
registerVuloPilotRoute({ tab: 'settings', component: Settings });
registerVuloPilotRoute({
	tab: 'brand-visibility',
	component: BrandVisibility,
});
registerVuloPilotRoute({ tab: 'security', component: Security });
registerVuloPilotRoute({ tab: 'ai-content', component: AIContent });
registerVuloPilotRoute({ tab: 'content', component: Content });
registerVuloPilotRoute({ tab: 'schema', component: Schema });
registerVuloPilotRoute({ tab: 'redirects', component: Redirects });
