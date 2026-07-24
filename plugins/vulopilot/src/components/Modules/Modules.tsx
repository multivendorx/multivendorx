/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import {
	ContainerComponent,
	ModuleGridComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { getModuleData } from '../../services/templateService';

/**
 * Mirrors the free multivendorx plugin's own
 * `components/Modules/Modules.tsx` exactly — same
 * NavigatorHeaderComponent + ContainerComponent + zyra's shared
 * `ModuleGridComponent` (which itself handles the enable/disable REST
 * call, search, and category filtering; see
 * Controllers\Settings::set_modules()/get_modules() for the backend
 * half). See ./index.ts's own docblock for why VuloPilot's catalog is a
 * short, honestly-scoped list rather than multivendorx's much larger one.
 */
const Modules = () => {
	const modulesArray = getModuleData();

	return (
		<>
			<NavigatorHeaderComponent
				headerIcon="module"
				headerTitle={__('Modules', 'vulopilot')}
				headerDescription={__(
					'Enable or disable optional VuloPilot features.',
					'vulopilot'
				)}
			/>
			<ContainerComponent general>
				<ModuleGridComponent
					modulesArray={modulesArray}
					appLocalizer={appLocalizer}
					apiLink="modules"
					pluginName="vulopilot"
				/>
			</ContainerComponent>
		</>
	);
};

export default Modules;
