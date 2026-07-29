import { registerVuloCartRoute } from './routeRegistry';

import Dashboard from './pages/Dashboard/Dashboard';
import Modules from './pages/Modules/Modules';
import Settings from './pages/Settings/Settings';

// Orders and Offerings are not VuloCart tabs — both are mounted as their
// own standalone top-level WP admin menus instead (src/index.tsx,
// classes/Admin/Menu.php's add_orders_menu()/add_offerings_menu()), so
// neither is registered here.
registerVuloCartRoute( { tab: 'dashboard', component: Dashboard } );
registerVuloCartRoute( { tab: 'modules', component: Modules } );
registerVuloCartRoute( { tab: 'settings', component: Settings } );
