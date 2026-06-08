/* global appLocalizer */
import { NavigatorHeader, Container, Modules } from 'zyra';
import { __ } from '@wordpress/i18n';
import { getModuleData } from '../../services/templateService';
import proPopupContent from '../Popup/Popup';

const PluginModules = () => {
	const modulesArray = getModuleData();

	return (
		<>
			<NavigatorHeader
				headerIcon="module"
				headerTitle={__('Modules', 'catalogx')}
				headerDescription={__(
					'Manage marketplace features by enabling or disabling modules. Turning a module on activates its settings and workflows, while turning it off hides them from admin and stores.',
					'catalogx'
				)}
			/>
			<Container general>
				<Modules
					modulesArray={modulesArray}
					appLocalizer={appLocalizer}
					apiLink="modules"
					proPopupContent={proPopupContent}
					pluginName="catalogx"
					filter={false}
				/>
			</Container>
		</>
	);
};

export default PluginModules;
