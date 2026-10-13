/* global appLocalizer */

import { ContainerComponent, NavigatorHeaderComponent, ModuleGridComponent } from '@zyra/components';
import { __ } from '@wordpress/i18n';
import { getModuleData } from '../../services/templateService';
import proPopupContent from '../Popup/Popup';

const PluginModules = () => {
	const modulesArray = getModuleData();

	return (
		<>
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
