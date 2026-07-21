/* global appLocalizer */

import { ContainerComponent, NavigatorHeaderComponent, ModuleGridComponent } from '@zyra/components';
import { __ } from '@wordpress/i18n';
import { getModuleData } from '../../services/templateService';
import proPopupContent from '../Popup/Popup';

const PluginModules = () => {
	const modulesArray = getModuleData();

	return (
		<>
			<NavigatorHeaderComponent
				headerIcon="module"
				headerTitle={__('ModuleGridComponent', 'multivendorx')}
				headerDescription={__(
					'Manage marketplace features by enabling or disabling modules. Turning a module on activates its settings and workflows, while turning it off hides them from admin and stores.',
					'multivendorx'
				)}
			/>
			<ContainerComponent general>
				<ModuleGridComponent
					modulesArray={modulesArray}
					appLocalizer={appLocalizer}
					apiLink="modules"
					proPopupContent={proPopupContent}
					pluginName="multivendorx"
				/>
			</ContainerComponent>
		</>
	);
};

export default PluginModules;
