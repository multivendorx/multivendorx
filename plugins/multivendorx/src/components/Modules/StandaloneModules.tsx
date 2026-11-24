import React from 'react';
import Modules from './Modules';

/**
 * The standalone `#&tab=modules` top-level route (routes.ts). `Modules.tsx`'s own
 * modules.scss scopes every rule under `.multivendorx-settings`, a class Settings.tsx's
 * NavigatorComponent normally supplies on an ancestor for the Settings → Modules sub-tab.
 * This route has no such ancestor, so it needs the class added here instead -- kept out of
 * Modules.tsx itself, since adding it there breaks `.multivendorx-settings .tab-content >
 * .container-wrapper` (a direct-child selector) when Modules renders as that sub-tab.
 */
const StandaloneModules: React.FC = () => (
	<div className="multivendorx-settings">
		<Modules />
	</div>
);

export default StandaloneModules;
