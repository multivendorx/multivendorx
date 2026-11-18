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

/**
 * Settings → Modules, laid out like VuloCart's: category pills, an All / Active / Inactive switch with search, then a
 * compact card per module (icon, name, category, settings link and switch, two lines of description, what is
 * included free and what Pro adds). The cards are zyra's `ModuleGridComponent`; modules.scss restyles it.
 *
 * zyra reads the active state from its `useModules()` store and POSTs `{ id, action }` to `catalogx/v1/modules` when a
 * switch is flipped. A locked Pro module opens the Pro popup instead.
 */
const PluginModules: React.FC = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="module"
			headerTitle={__('Modules', 'catalogx')}
			headerDescription={__(
				'Turn on only the features your store uses. A module’s settings and pages appear once it is on; turning it off hides them again.',
				'catalogx'
			)}
		/>
		<ContainerComponent general>
			<ModuleGridComponent
				modulesArray={getModuleData()}
				apiLink="modules"
				pluginName="catalogx"
				proPopupContent={ShowProPopup}
				freeBadgeText={__('Included', 'catalogx')}
				proBadgeText={__('With Pro', 'catalogx')}
				labels={{
					all: __('All', 'catalogx'),
					allStatus: __('All', 'catalogx'),
					active: __('Active', 'catalogx'),
					inactive: __('Inactive', 'catalogx'),
					searchPlaceholder: __('Search modules', 'catalogx'),
					moduleCount: (count: number) =>
						sprintf(
							/* translators: %d: number of modules shown. */
							_n('%d module', '%d modules', count, 'catalogx'),
							count
						),
					clearAll: __('Clear all', 'catalogx'),
					requires: __('Requires:', 'catalogx'),
					install: __('Install', 'catalogx'),
					requiredPluginsTitle: __('Required plugins missing', 'catalogx'),
					requiredPluginsDesc: __(
						'This module needs the following plugins to work.',
						'catalogx'
					),
					pluginsRequired: __('Plugins required', 'catalogx'),
					successTitle: __('Saved', 'catalogx'),
					errorTitle: __('Could not save', 'catalogx'),
					activated: __('Module turned on', 'catalogx'),
					deactivated: __('Module turned off', 'catalogx'),
					activateFailed: __('The module could not be turned on.', 'catalogx'),
					deactivateFailed: __('The module could not be turned off.', 'catalogx'),
				}}
			/>
		</ContainerComponent>
	</>
);

export default PluginModules;
