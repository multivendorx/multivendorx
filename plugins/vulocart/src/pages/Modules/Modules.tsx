import { ContainerComponent, NavigatorHeaderComponent, ModuleGridComponent } from '@zyra/components';
import { __ } from '@wordpress/i18n';
import modulesConfig from '../../modules-config';

/**
 * Mirrors `multivendorx/src/components/Modules/Modules.tsx` almost
 * verbatim — `ModuleGridComponent` reads active state from zyra's own
 * `useModules()` store (seeded by `initializeModules()` in
 * src/index.tsx) and POSTs `{ id, action }` to `apiLink` on toggle
 * (classes/RestAPI/Controllers/Modules.php).
 */
const Modules = () => {
	return (
		<>
			<NavigatorHeaderComponent
				headerIcon="module"
				headerTitle={ __( 'Modules', 'vulocart' ) }
				headerDescription={ __(
					'Enable or disable VuloCart features. Turning a module on activates its settings and REST routes; turning it off hides them.',
					'vulocart'
				) }
			/>
			<ContainerComponent general>
				<ModuleGridComponent
					modulesArray={ modulesConfig }
					apiLink="modules"
					pluginName="vulocart"
				/>
			</ContainerComponent>
		</>
	);
};

export default Modules;
