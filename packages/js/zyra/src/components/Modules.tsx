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
import AdminBreadcrumbs from './AdminBreadcrumbs';

// Types
interface Module {
    id: string;
    name: string;
    desc: string;
    icon: string;
    doc_link: string;
    video_link: string;
    req_plugin?: string[],
    settings_link: string;
    pro_module?: boolean;
    category?: string; // Optional to support no separators
    type?: undefined; // Prevents conflict with Separator
}

interface Separator {
    type: 'separator';
    id: string;
    label: string;
}

type ModuleItem = Module | Separator;

interface ProPopupContent {
    proUrl: string;
    title: string;
    messages: {
        icon: string;
        text: string;
    }[];
}

interface ModuleProps {
    modulesArray?: { category: boolean; modules: ModuleItem[] };
    appLocalizer: Record<string, any>;
    apiLink: string;
    proPopupContent: ProPopupContent;
    pluginName: string;
    brandImg: string;
}

const Modules: React.FC<ModuleProps> = ({
    modulesArray = { category: false, modules: [] },
    appLocalizer,
    apiLink,
    proPopupContent,
    brandImg,
    pluginName,
}) => {
    const [modelOpen, setModelOpen] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedFilter, setSelectedFilter] = useState<string>('Total');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const { modules, insertModule, removeModule } = useModules();

    // Get unique categories from separators, if any
    const categories = [
        { id: 'All', label: 'All' },
        ...modulesArray.modules
            .filter((item): item is Separator => 'type' in item && item.type === 'separator')
            .map(item => ({ id: item.id, label: item.label }))
    ];

    // Calculate module counts
    const totalModules = modulesArray.modules.filter(item => !('type' in item)).length;
    const activeModules = modules.length;
    const inactiveModules = totalModules - activeModules;

    // Filter modules and separators based on selected category, filter, and search query
    const filteredModules = modulesArray.modules.filter(item => {
        if ('type' in item && item.type === 'separator') {
            // Only show separator if there are modules in its category that pass the status and search filters
            const separatorCategory = item.id;
            const hasModulesInCategory = modulesArray.modules.some(module => {
                if ('type' in module) return false;
                const mod = module as Module;
                if (mod.category !== separatorCategory) return false;
                if (selectedFilter === 'Active' && !modules.includes(mod.id)) return false;
                if (selectedFilter === 'Inactive' && modules.includes(mod.id)) return false;
                if (searchQuery && !mod.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
            });
            return (selectedCategory === 'All' || item.id === selectedCategory) && hasModulesInCategory;
        }
        const module = item as Module;

        // If no category, include only if 'All' is selected
        if (!module.category && selectedCategory !== 'All') return false;
        // Apply category filter
        if (selectedCategory !== 'All' && module.category !== selectedCategory) {
            return false;
        }
        // Apply status filter
        if (selectedFilter === 'Active' && !modules.includes(module.id)) {
            return false;
        }
        if (selectedFilter === 'Inactive' && modules.includes(module.id)) {
            return false;
        }
        // Apply search filter
        if (searchQuery && !module.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true; // 'Total' shows all modules that pass category and search filters
    });

    const isModuleAvailable = (moduleId: string): boolean => {
        const module = modulesArray.modules.find(
            (moduleData) => 'id' in moduleData && moduleData.id === moduleId
        ) as Module;
        return module?.pro_module ? appLocalizer.khali_dabba ?? false : true;
    };

    const handleOnChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
        moduleId: string
    ) => {
        if (!isModuleAvailable(moduleId)) {
            setModelOpen(true);
            return;
        }

        const action = event.target.checked ? 'activate' : 'deactivate';
        try {
            if (action === 'activate') {
                insertModule?.(moduleId);
            } else {
                removeModule?.(moduleId);
            }
            localStorage.setItem(`force_${pluginName}_context_reload`, 'true');
            await sendApiResponse(appLocalizer, getApiLink(appLocalizer, apiLink), {
                id: moduleId,
                action,
            });
            setSuccessMsg(`Module ${action}d`);
            setTimeout(() => setSuccessMsg(''), 2000);
        } catch (error) {
            setSuccessMsg(`Error: Failed to ${action} module`);
            setTimeout(() => setSuccessMsg(''), 2000);
        }
    };

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-module"
                tabTitle="Modules"
            />

            <div className="module-container">
                <Dialog
                    className="admin-module-popup"
                    open={modelOpen}
                    onClose={() => setModelOpen(false)}
                >
                    <button
                        className="admin-font adminlib-cross"
                        onClick={() => setModelOpen(false)}
                        aria-label="Close dialog"
                    ></button>
                    <Popoup
                        proUrl={proPopupContent.proUrl}
                        title={proPopupContent.title}
                        messages={proPopupContent.messages}
                    />
                </Dialog>

                {successMsg && (
                    // <div className="admin-notice-wrapper">
                    //     <i className="admin-font adminlib-icon-yes"></i>
                    //     {successMsg}
                    // </div>
                    // <div className="admin-notice-wrapper notice-error">
                    //     <i className="admin-font adminlib-info"></i>
                    //     <div className="notice-details">
                    //         <div className="title">oops!</div>
                    //         <div className="desc">{successMsg}</div>
                    //     </div>
                    // </div>
                    <div className="admin-notice-wrapper">
                        <i className="admin-font adminlib-icon-yes"></i>
                        <div className="notice-details">
                            <div className="title">Great!</div>
                            <div className="desc">{successMsg}</div>
                        </div>
                    </div>
                )}

                {/* <div className="tab-name">
                    <h2>Modules</h2>
                </div> */}

                <div className="category-filter">
                    {/* <div className="module-status-filter">
                        <button
                            className={`filter-button ${selectedFilter === 'Total' ? 'active' : ''}`}
                            onClick={() => setSelectedFilter('Total')}
                        >
                            Total Modules ({totalModules})
                        </button>
                        <button
                            className={`filter-button ${selectedFilter === 'Active' ? 'active' : ''}`}
                            onClick={() => setSelectedFilter('Active')}
                        >
                            Active Modules ({activeModules})
                        </button>
                        <button
                            className={`filter-button ${selectedFilter === 'Inactive' ? 'active' : ''}`}
                            onClick={() => setSelectedFilter('Inactive')}
                        >
                            Inactive Modules ({inactiveModules})
                        </button>
                    </div> */}
                    {/* <div className="module-search">
                        <label htmlFor="module-search">Search Modules: </label>
                        <input
                            id="module-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by module name..."
                        />
                    </div> */}
                    {modulesArray.category && categories.length > 1 && (
                        <>
                            {categories.map((category) => (
                                <span
                                    key={category.id}
                                    id={category.id}
                                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.label}
                                </span>
                            ))}
                        </>
                    )}
                </div>

                <div className="module-option-row">
                    {filteredModules.map((item, index) => {
                        if ('type' in item && item.type === 'separator') {
                            return null;
                        }

                        const module = item as Module;
                        const requiredPlugins = module.req_plugin || (module as any).req_pluging || [];
                        return (
                            <div className="module-list-item" key={module.id}>
                                <div className="module-body">
                                    <div className="module-header">
                                        <div className="icon">
                                            <i className={`font ${module.icon}`}></i>
                                        </div>
                                        <div className="pro-tag">
                                            {module.pro_module && !appLocalizer.khali_dabba && (
                                                <i className="adminlib-pro-tag"></i>
                                            )}
                                        </div>
                                        {/* <div
                                            className="toggle-checkbox"
                                            data-tour={`${module.id}-showcase-tour`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="woo-toggle-checkbox"
                                                id={`toggle-switch-${module.id}`}
                                                checked={modules.includes(module.id)}
                                                onChange={(e) => handleOnChange(e, module.id)}
                                            />
                                            <label
                                                htmlFor={`toggle-switch-${module.id}`}
                                                className="toggle-switch-is_hide_cart_checkout"
                                            ></label>
                                        </div> */}
                                    </div>
                                    <div className="module-details">
                                        
                                            <div className="meta-name">{module.name}
                                                {module.category && ( <span className="admin-badge blue">{module.category}</span>  )}
                                            </div>
                                       
                                        <p
                                            className="meta-description"
                                            dangerouslySetInnerHTML={{ __html: module.desc }}
                                        ></p>
                                        {requiredPlugins.length > 0 && (
                                            <div className="requires">
                                                <div className="requires-title">Requires:</div>
                                                <p className="meta-description">{requiredPlugins.join(', ')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="module-footer">
                                    <div className="buttons">
                                        {module.doc_link && ( <a href={module.doc_link}><i className="adminlib-book"></i></a> )}
                                        {module.video_link && ( <a href={module.video_link}><i className="adminlib-button-appearance"></i></a> )}
                                    </div>
                                    <div
                                        className="toggle-checkbox"
                                        data-tour={`${module.id}-showcase-tour`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="woo-toggle-checkbox"
                                            id={`toggle-switch-${module.id}`}
                                            checked={modules.includes(module.id)}
                                            onChange={(e) => handleOnChange(e, module.id)}
                                        />
                                        <label
                                            htmlFor={`toggle-switch-${module.id}`}
                                            className="toggle-switch-is_hide_cart_checkout"
                                        ></label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Modules;