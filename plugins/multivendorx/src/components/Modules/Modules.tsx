import { AdminBreadcrumbs, Container, Modules } from 'zyra';
// import context
import { __ } from '@wordpress/i18n';
import { getModuleData } from '../../services/templateService';
import proPopupContent from '../Popup/Popup';

const PluginModules = () => {
	const modulesArray = getModuleData();

	return (
		<>
			<AdminBreadcrumbs
				settingIcon="adminfont-module"
				headerTitle={__('Modules', 'multivendorx')}
				description={__('Manage marketplace features by enabling or disabling modules. Turning a module on activates its settings and workflows, while turning it off hides them from admin and stores.', 'multivendorx')}
			/>
			<Container general>
				<Modules
					modulesArray={modulesArray}
					appLocalizer={appLocalizer}
					apiLink="modules"
					proPopupContent={proPopupContent}
					pluginName="multivendorx"
				/>
			</Container>
		</>
	);
};

export default PluginModules;
