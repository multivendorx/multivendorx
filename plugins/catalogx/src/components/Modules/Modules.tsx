import { Modules } from 'zyra';
import { getModuleData } from '../../services/templateService';
import proPopupContent from '../Popup/Popup';

const PluginModules = () => {
    const modulesArray = getModuleData();

    return (
        <Modules
            modulesArray={modulesArray}
            appLocalizer={appLocalizer}
            apiLink="modules"
            proPopupContent={proPopupContent}
            pluginName="catalogx"
        />
    );
};

export default PluginModules;
