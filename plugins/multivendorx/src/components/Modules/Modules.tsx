import React from 'react';
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	ContainerComponent,
	NavigatorHeaderComponent,
	ModuleGridComponent,
} from '@zyra/components';
import { getModuleData } from '../../services/templateService';
import ShowProPopup from '../Popup/Popup';
import './modules.scss';

/** ModuleGridComponent's texts, shared by Settings → Modules and the dashboard's Modules card. */
export const MODULE_GRID_LABELS = {
	all: __('All', 'multivendorx'),
	allStatus: __('All', 'multivendorx'),
	active: __('Active', 'multivendorx'),
	inactive: __('Inactive', 'multivendorx'),
	searchPlaceholder: __('Search modules', 'multivendorx'),
	moduleCount: (count: number) =>
		sprintf(
			/* translators: %d: number of modules shown. */
			_n('%d module', '%d modules', count, 'multivendorx'),
			count
		),
	clearAll: __('Clear all', 'multivendorx'),
	requires: __('Requires:', 'multivendorx'),
	install: __('Install', 'multivendorx'),
	requiredPluginsTitle: __('Required plugins missing', 'multivendorx'),
	requiredPluginsDesc: __(
		'This module needs the following plugins to work.',
		'multivendorx'
	),
	pluginsRequired: __('Plugins required', 'multivendorx'),
	successTitle: __('Saved', 'multivendorx'),
	errorTitle: __('Could not save', 'multivendorx'),
	activated: __('Module turned on', 'multivendorx'),
	deactivated: __('Module turned off', 'multivendorx'),
	activateFailed: __('The module could not be turned on.', 'multivendorx'),
	deactivateFailed: __('The module could not be turned off.', 'multivendorx'),
};

/**
 * Settings → Modules, laid out like VuloCart's: category pills, an All / Active / Inactive switch with search, then a
 * compact card per module (icon, name, category, settings link and switch, two lines of description, what is
 * included free and what Pro adds). The cards are zyra's `ModuleGridComponent`; modules.scss restyles it.
 *
 * zyra reads the active state from its `useModules()` store and POSTs `{ id, action }` to `multivendorx/v1/modules` when a
 * switch is flipped. A locked Pro module opens the Pro popup instead.
 */
const PluginModules: React.FC = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="module"
			headerTitle={__('Modules', 'multivendorx')}
			headerDescription={__(
				'Turn on only the features your marketplace uses. A module’s settings and pages appear once it is on; turning it off hides them from the admin and from stores.',
				'multivendorx'
			)}
		/>
		<ContainerComponent general>
			<ModuleGridComponent
				modulesArray={getModuleData()}
				apiLink="modules"
				pluginName="multivendorx"
				proPopupContent={ShowProPopup}
				freeBadgeText={__('Included', 'multivendorx')}
				proBadgeText={__('With Pro', 'multivendorx')}
				labels={MODULE_GRID_LABELS}
			/>
		</ContainerComponent>
	</>
);

export default PluginModules;
