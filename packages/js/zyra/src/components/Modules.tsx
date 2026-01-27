/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';

/**
 * Internal dependencies
 */
import { getApiLink, sendApiResponse } from '../utils/apiService';
import { useModules } from '../contexts/ModuleContext';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import '../styles/web/Modules.scss';

// Types
interface Module {
    id: string;
    name: string;
    desc: string;
    icon: string;
    doc_link: string;
    video_link: string;
    req_plugin?: { name: string; link: string }[];
    settings_link: string;
    pro_module?: boolean;
    category?: string | string[]; // Optional to support no separators
    type?: string; // Prevents conflict with Separator
    reloadOnChange?: boolean;
}

interface Separator {
    type: 'separator';
    id: string;
    label: string;
}

type ModuleItem = Module | Separator;

interface AppLocalizer {
    khali_dabba?: boolean;
    nonce: string;
    apiUrl: string;
    restUrl: string;
}

interface ModuleProps {
    modulesArray?: { category: boolean; modules: ModuleItem[] };
    apiLink: string;
    pluginName: string;
    brandImg: string;
    appLocalizer: AppLocalizer;
    proPopupContent?: React.FC;
}

const Modules: React.FC< ModuleProps > = ( {
    modulesArray = { category: false, modules: [] },
    appLocalizer,
    apiLink,
    proPopupContent: ProPopupComponent,
    pluginName,
} ) => {
    const [ modelOpen, setModelOpen ] = useState< boolean >( false );
    const [ successMsg, setSuccessMsg ] = useState< string >( '' );
    const [ selectedCategory, setSelectedCategory ] =
        useState< string >( 'All' );
    const [ selectedFilter ] = useState< string >( 'Total' );
    const [ searchQuery ] = useState< string >( '' );

    const { modules, insertModule, removeModule } = useModules();

    const formatCategory = ( category: string ): string => {
        if ( ! category ) {
            return '';
        }
        return category
            .split( '_' )
            .map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
            .join( ' ' );
    };
    const getCategories = ( category?: string | string[] ): string[] => {
        if ( ! category ) {
            return [];
        }
        return Array.isArray( category ) ? category : [ category ];
    };
    // Get unique categories from separators, if any
    const categories = [
        { id: 'All', label: 'All' },
        ...modulesArray.modules
            .filter(
                ( item ): item is Separator =>
                    'type' in item && item.type === 'separator'
            )
            .map( ( item ) => ( { id: item.id, label: item.label } ) ),
    ];

    // Filter modules and separators based on selected category, filter, and search query
    const filteredModules = modulesArray.modules.filter( ( item ) => {
        if ( 'type' in item && item.type === 'separator' ) {
            // Only show separator if there are modules in its category that pass the status and search filters
            const separatorCategory = item.id;
            const hasModulesInCategory = modulesArray.modules.some(
                ( module ) => {
                    if ( 'type' in module ) {
                        return false;
                    }
                    const mod = module as Module;
                    if ( ! mod.category?.includes( separatorCategory ) ) {
                        return false;
                    }
                    if (
                        selectedFilter === 'Active' &&
                        ! modules.includes( mod.id )
                    ) {
                        return false;
                    }
                    if (
                        selectedFilter === 'Inactive' &&
                        modules.includes( mod.id )
                    ) {
                        return false;
                    }
                    if (
                        searchQuery &&
                        ! mod.name
                            .toLowerCase()
                            .includes( searchQuery.toLowerCase() )
                    ) {
                        return false;
                    }
                    return true;
                }
            );
            return (
                ( selectedCategory === 'All' ||
                    item.id === selectedCategory ) &&
                hasModulesInCategory
            );
        }
        const module = item as Module;

        // If no category, include only if 'All' is selected
        if ( ! module.category && selectedCategory !== 'All' ) {
            return false;
        }
        // Apply category filter
        if (
            selectedCategory !== 'All' &&
            ! getCategories( module.category ).includes( selectedCategory )
        ) {
            return false;
        }
        // Apply status filter
        if ( selectedFilter === 'Active' && ! modules.includes( module.id ) ) {
            return false;
        }
        if ( selectedFilter === 'Inactive' && modules.includes( module.id ) ) {
            return false;
        }
        // Apply search filter
        if (
            searchQuery &&
            ! module.name.toLowerCase().includes( searchQuery.toLowerCase() )
        ) {
            return false;
        }
        return true; // 'Total' shows all modules that pass category and search filters
    } );

    const isModuleAvailable = ( moduleId: string ): boolean => {
        const module = modulesArray.modules.find(
            ( moduleData ) => 'id' in moduleData && moduleData.id === moduleId
        ) as Module;
        return module?.pro_module ? appLocalizer.khali_dabba ?? false : true;
    };

    const handleOnChange = async (
        event: React.ChangeEvent< HTMLInputElement >,
        moduleId: string,
        reloadOnChange = false
    ) => {
        if ( ! isModuleAvailable( moduleId ) ) {
            setModelOpen( true );
            return;
        }

        const action = event.target.checked ? 'activate' : 'deactivate';
        try {
            if ( action === 'activate' ) {
                insertModule?.( moduleId );
            } else {
                removeModule?.( moduleId );
            }
            localStorage.setItem(
                `force_${ pluginName }_context_reload`,
                'true'
            );
            await sendApiResponse(
                appLocalizer,
                getApiLink( appLocalizer, apiLink ),
                {
                    id: moduleId,
                    action,
                }
            );
            setSuccessMsg( `Module ${ action }d` );
            setTimeout( () => setSuccessMsg( '' ), 2000 );
            if ( reloadOnChange ) {
                window.location.reload();
            }
        } catch ( error ) {
            setSuccessMsg( `Error: Failed to ${ action } module ${ error }` );
            setTimeout( () => setSuccessMsg( '' ), 2000 );
        }
    };
    useEffect( () => {
        let highlightedElement: HTMLElement | null = null;
        let hasHighlightedOnce = false;

        const scrollToTargetSection = () => {
            if ( hasHighlightedOnce ) {
                return;
            }

            const hash = window.location.hash;
            const params = new URLSearchParams( hash.replace( '#&', '' ) );
            const targetId = params.get( 'module' );

            if ( ! targetId ) {
                return;
            }

            setTimeout( () => {
                const targetElement = document.getElementById( targetId );
                if ( targetElement ) {
                    targetElement.scrollIntoView( {
                        behavior: 'smooth',
                        block: 'start',
                    } );

                    targetElement.classList.add( 'highlight' );
                    highlightedElement = targetElement;
                    hasHighlightedOnce = true;
                }
            }, 500 );
        };

        // Remove highlight class
        const handleClickAnywhere = ( e: Event ) => {
            if (
                highlightedElement &&
                ! highlightedElement.contains( e.target as Node )
            ) {
                highlightedElement.classList.remove( 'highlight' );
                highlightedElement = null;
            }
        };

        scrollToTargetSection();

        document.addEventListener( 'pointerdown', handleClickAnywhere );

        return () => {
            document.removeEventListener( 'pointerdown', handleClickAnywhere );
        };
    }, [] );

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminfont-module"
                tabTitle="Modules"
                description={
                    'Manage marketplace features by enabling or disabling modules. Turning a module on activates its settings and workflows, while turning it off hides them from admin and vendors.'
                }
            />

            <div className="module-container general-wrapper">
                <Dialog
                    className="admin-module-popup"
                    open={ modelOpen }
                    onClose={ () => setModelOpen( false ) }
                >
                    <button
                        className="admin-font adminfont-cross"
                        onClick={ () => setModelOpen( false ) }
                        aria-label="Close dialog"
                    ></button>
                    { ProPopupComponent && <ProPopupComponent /> }
                </Dialog>

                { successMsg && (
                    <div className="admin-notice-wrapper">
                        <i className="admin-font adminfont-icon-yes"></i>
                        <div className="notice-details">
                            <div className="title">Success!</div>
                            <div className="desc">{ successMsg }</div>
                        </div>
                    </div>
                ) }

                <div className="category-filter">
                    { modulesArray.category && categories.length > 1 && (
                        <>
                            { categories.map( ( category ) => (
                                <span
                                    key={ category.id }
                                    id={ category.id }
                                    className={ `category-item ${
                                        selectedCategory === category.id
                                            ? 'active'
                                            : ''
                                    }` }
                                    onClick={ () =>
                                        setSelectedCategory( category.id )
                                    }
                                >
                                    { category.label }
                                </span>
                            ) ) }
                        </>
                    ) }
                </div>

                <div className="module-option-row">
                    { filteredModules.map( ( item, index ) => {
                        if ( 'type' in item && item.type === 'separator' ) {
                            return null;
                        }

                        const module = item as Module;
                        const requiredPlugins =
                            module.req_plugin ||
                            (
                                module as {
                                    req_pluging?: {
                                        name: string;
                                        link: string;
                                    }[];
                                }
                             ).req_pluging ||
                            [];
                        return (
                            <div
                                data-inedx={ index }
                                className="module-list-item"
                                key={ module.id }
                                id={ module.id }
                            >
                                <div className="module-body">
                                    <div className="module-header">
                                        <div className="icon">
                                            <i
                                                className={ `font ${ module.icon }` }
                                            ></i>
                                        </div>
                                        <div className="pro-tag">
                                            { module.pro_module &&
                                                ! appLocalizer.khali_dabba && (
                                                    <i className="adminfont-pro-tag"></i>
                                                ) }
                                        </div>
                                    </div>
                                    <div className="module-details">
                                        <div className="meta-name">
                                            { module.name }
                                        </div>
                                        <div className="tag-wrapper">
                                            { getCategories(
                                                module.category
                                            ).map( ( cat, idx ) => (
                                                <span
                                                    key={ idx }
                                                    className="admin-badge blue"
                                                >
                                                    { formatCategory( cat ) }
                                                </span>
                                            ) ) }
                                        </div>
                                        <p
                                            className="meta-description"
                                            dangerouslySetInnerHTML={ {
                                                __html: module.desc,
                                            } }
                                        ></p>
                                    </div>
                                </div>
                                <div className="footer-wrapper">
                                    { requiredPlugins.length > 0 && (
                                        <div className="requires">
                                            <div className="requires-title">
                                                Requires:
                                            </div>
                                            { requiredPlugins.map(
                                                (
                                                    plugin: {
                                                        name: string;
                                                        link: string;
                                                    },
                                                    idx: number
                                                ) => (
                                                    <span key={ idx }>
                                                        <a
                                                            href={ plugin.link }
                                                            className="link-item"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            { plugin.name }
                                                        </a>
                                                        { idx <
                                                        requiredPlugins.length -
                                                            1
                                                            ? ', '
                                                            : '' }
                                                    </span>
                                                )
                                            ) }
                                        </div>
                                    ) }
                                    <div className="module-footer">
                                        <div className="buttons">
                                            { module.doc_link && (
                                                <a
                                                    href={ module.doc_link }
                                                    target="_blank"
                                                >
                                                    <i className="adminfont-book"></i>
                                                </a>
                                            ) }
                                            { module.video_link && (
                                                <a
                                                    href={ module.video_link }
                                                    target="_blank"
                                                >
                                                    <i className="adminfont-button-appearance"></i>
                                                </a>
                                            ) }
                                            { module.settings_link && (
                                                <a
                                                    href={
                                                        module.settings_link
                                                    }
                                                >
                                                    <i className="adminfont-setting"></i>
                                                </a>
                                            ) }
                                        </div>
                                        <div
                                            className="toggle-checkbox"
                                            data-tour={ `${ module.id }-showcase-tour` }
                                        >
                                            <input
                                                type="checkbox"
                                                className="woo-toggle-checkbox"
                                                id={ `toggle-switch-${ module.id }` }
                                                checked={ modules.includes(
                                                    module.id
                                                ) }
                                                onChange={ ( e ) =>
                                                    handleOnChange(
                                                        e,
                                                        module.id,
                                                        module.reloadOnChange
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={ `toggle-switch-${ module.id }` }
                                                className="toggle-switch-is_hide_cart_checkout"
                                            ></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    } ) }
                </div>
            </div>
        </>
    );
};

export default Modules;
