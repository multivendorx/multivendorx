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
    parent_category?: string; // Optional to support no separators
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
                if (mod.parent_category !== separatorCategory) return false;
                if (selectedFilter === 'Active' && !modules.includes(mod.id)) return false;
                if (selectedFilter === 'Inactive' && modules.includes(mod.id)) return false;
                if (searchQuery && !mod.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
            });
            return (selectedCategory === 'All' || item.id === selectedCategory) && hasModulesInCategory;
        }
        const module = item as Module;
        // If no parent_category, include only if 'All' is selected
        if (!module.parent_category && selectedCategory !== 'All') return false;
        // Apply category filter
        if (selectedCategory !== 'All' && module.parent_category !== selectedCategory) {
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
                <div className="admin-notice-display-title">
                    <i className="admin-font adminlib-icon-yes"></i>
                    {successMsg}
                </div>
            )}

            {/* <div className="tab-name">
                <h2>Modules</h2>
            </div> */}

            <div className="top-header">
                <div className="left-section">
                    <img
                        className="brand-logo"
                        src={brandImg}
                        alt="Logo"
                    />
                </div>
                <div className="right-section">
                    <div className="search-field">
                        <i className="adminlib-search"></i>
                        <input type="text" className="basic-input" placeholder="Search Here" />
                    </div>
                </div>
            </div>

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
                    // if ('type' in item && item.type === 'separator') {
                    //     return (
                    //         <div key={`separator-${item.id}`} className="module-separator">
                    //             <h3 className="separator-title">{item.label}</h3>
                    //         </div>
                    //     );
                    // }

                    const module = item as Module;

                    return (
                        <div className="module-list-item" key={module.id}>
                            {module.pro_module && !appLocalizer.khali_dabba && (
                                <span className="admin-pro-tag">Pro</span>
                            )}
                            <div className="module-body">
                                <div className="module-header">
                                    <div className="icon">
                                        <i className={`font ${module.icon}`}></i>
                                    </div>
                                    <div className="pro-tag">
                                        <i className="adminlib-pro-tab"></i>
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
                                    <div className="meta-name">{module.name}</div>
                                    <p
                                        className="meta-description"
                                        dangerouslySetInnerHTML={{ __html: module.desc }}
                                    ></p>
                                    <div className="requires">Requires:</div>
                                    <p
                                        className="meta-description"
                                    >WooCommerce Appointment</p>
                                </div>
                            </div>
                            <div className="module-footer">
                                <div className="buttons">
                                    <a href="#"><i className="adminlib-book"></i></a>
                                    <a href="#"><i className="adminlib-button-appearance"></i></a>
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
    );
};

export default Modules;