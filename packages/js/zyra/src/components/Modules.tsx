/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';

/**
 * Internal dependencies
 */
import Popoup from './Popup';
import { getApiLink, sendApiResponse } from '../utils/apiService';
import '../styles/web/Modules.scss';
import { useModules } from '../contexts/ModuleContext';

// Types
interface Module {
    id: string;
    name: string;
    desc: string;
    icon: string;
    doc_link: string;
    settings_link: string;
    pro_module?: boolean;
}

interface ProPopupContent {
    proUrl: string;
    title: string;
    messages: {
        icon: string;
        text: string;
    }[];
}

interface ModuleProps {
    modulesArray?: Module[];
    appLocalizer: Record< string, any >; // Allows any structure
    apiLink: string;
    proPopupContent: ProPopupContent;
    pluginName: string;
}

const Modules: React.FC< ModuleProps > = ( {
    modulesArray = [],
    appLocalizer,
    apiLink,
    proPopupContent,
    pluginName,
} ) => {
    const [ modelOpen, setModelOpen ] = useState< boolean >( false );
    const [ successMsg, setSuccessMsg ] = useState< string >( '' );

    const { modules, insertModule, removeModule } = useModules()

    const isModuleAvailable = ( moduleId: string ): boolean => {
        const module = modulesArray.find(
            ( moduleData ) => moduleData.id === moduleId
        );
        return module?.pro_module ? appLocalizer.khali_dabba ?? false : true;
    };

    const handleOnChange = async (
        event: React.ChangeEvent< HTMLInputElement >,
        moduleId: string
    ) => {
        if ( ! isModuleAvailable( moduleId ) ) {
            setModelOpen( true );
            return;
        }

        const action = event.target.checked ? 'activate' : 'deactivate';
        if ( action === 'activate' ) {
            insertModule?.( moduleId );
        } else {
            removeModule?.( moduleId );
        }
        localStorage.setItem(`force_${pluginName}_context_reload`, 'true');

        await sendApiResponse(
            appLocalizer,
            getApiLink( appLocalizer, apiLink ),
            { id: moduleId, action }
        );
        setSuccessMsg( `Module ${action}d` );
        setTimeout( () => setSuccessMsg( '' ), 2000 );
    };

    return (
        <div className="module-container">
            <Dialog
                className="admin-module-popup"
                open={ modelOpen }
                onClose={ () => setModelOpen( false ) }
            >
                <span
                    className="admin-font adminlib-cross"
                    role="button"
                    tabIndex={ 0 }
                    onClick={ () => setModelOpen( false ) }
                ></span>
                <Popoup
                    proUrl={proPopupContent.proUrl}
                    title={proPopupContent.title}
                    messages={proPopupContent.messages}
                />
            </Dialog>

            { successMsg && (
                <div className="admin-notice-display-title">
                    <i className="admin-font adminlib-icon-yes"></i>
                    { successMsg }
                </div>
            ) }

            <div className="tab-name">
                <h2>Modules</h2>
            </div>
            <div className="module-option-row">
                { modulesArray.map( ( module ) => (
                    <div className="module-list-item" key={ module.id }>
                        { module.pro_module && ! appLocalizer.khali_dabba && (
                            <span className="admin-pro-tag">Pro</span>
                        ) }
                        <div className="module-icon">
                            <i className={ `font ${ module.icon }` }></i>
                        </div>
                        <div className="card-meta">
                            <div className="meta-name">{ module.name }</div>
                            <p
                                className="meta-description"
                                dangerouslySetInnerHTML={ {
                                    __html: module.desc,
                                } }
                            ></p>
                        </div>
                        <div className="card-footer">
                            <div className="card-support">
                                <a
                                    href={ module.doc_link }
                                    className="admin-btn btn-purple card-support-btn"
                                >
                                    Docs
                                </a>
                                <a
                                    href={ module.settings_link }
                                    className="admin-btn btn-purple card-support-btn"
                                >
                                    Setting
                                </a>
                            </div>
                            <div
                                className="toggle-checkbox"
                                data-tour={ `${ module.id }-showcase-tour` }
                            >
                                <input
                                    type="checkbox"
                                    className="woo-toggle-checkbox"
                                    id={ `toggle-switch-${ module.id }` }
									checked={ modules.includes( module.id ) }
                                    onChange={ ( e ) =>
                                        handleOnChange( e, module.id )
                                    }
                                />
                                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                <label
                                    htmlFor={ `toggle-switch-${ module.id }` }
                                    className="toggle-switch-is_hide_cart_checkout"
                                ></label>
                            </div>
                        </div>
                    </div>
                ) ) }
            </div>
        </div>
    );
};

export default Modules;
