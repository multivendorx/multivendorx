// External dependencies
import React, { useEffect, useState } from 'react';

// Internal dependencies
import { getApiLink, sendApiResponse } from '../utils/apiService';
import { useModules } from '../contexts/ModuleContext';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import '../styles/web/Modules.scss';
import SuccessNotice from './SuccessNotice';
import { MultiCheckBoxUI } from './MultiCheckbox';
import HeaderSearch from './HeaderSearch';
import { SelectInputUI } from './SelectInput';

// Types
interface Module {
    id: string;
    name: string;
    desc?: string;
    icon: string;
    docLink?: string;
    videoLink?: string;
    reqPluging?: { name: string; link: string }[];
    settingsLink?: string;
    proModule?: boolean;
    category?: string | string[];
    type?: string;
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

// Type Guard
const isModule = (item: ModuleItem): item is Module => !('type' in item);

const Modules: React.FC<ModuleProps> = ({
    modulesArray = { category: false, modules: [] },
    appLocalizer,
    apiLink,
    proPopupContent: ProPopupComponent,
    pluginName,
}) => {
    const [modelOpen, setModelOpen] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedFilter, setSelectedFilter] = useState<string>('Total');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const { modules, insertModule, removeModule } = useModules();
    const totalCount = modulesArray.modules.filter(isModule).length;

    const activeCount = modulesArray.modules.filter(
        (item) => isModule(item) && modules.includes(item.id)
    ).length;

    const inactiveCount = totalCount - activeCount;

    const formatCategory = (category: string): string =>
        category
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const getCategories = (category?: string | string[]): string[] =>
        category ? (Array.isArray(category) ? category : [category]) : [];

    const categories = [
        { id: 'All', label: 'All' },
        ...modulesArray.modules
            .filter((item): item is Separator => !isModule(item) && item.type === 'separator')
            .map((item) => ({ id: item.id, label: item.label })),
    ];

    const filteredModules = modulesArray.modules.filter((item) => {
        if (!isModule(item)) {
            // Separator logic: show if it has any modules in that category
            const separatorCategory = item.id;
            const hasModulesInCategory = modulesArray.modules.some(
                (m) => isModule(m) && getCategories(m.category).includes(separatorCategory)
            );
            return (selectedCategory === 'All' || item.id === selectedCategory) && hasModulesInCategory;
        }

        // Module logic
        const modCats = getCategories(item.category);
        if (selectedCategory !== 'All' && !modCats.includes(selectedCategory)) return false;
        if (selectedFilter === 'Active' && !modules.includes(item.id)) return false;
        if (selectedFilter === 'Inactive' && modules.includes(item.id)) return false;
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const isModuleAvailable = (moduleId: string): boolean => {
        const module = modulesArray.modules.find(
            (moduleData) => isModule(moduleData) && moduleData.id === moduleId
        ) as Module;
        return module?.proModule ? appLocalizer.khali_dabba ?? false : true;
    };

    const handleOnChange = async (
        event: [],
        moduleId: string,
        reloadOnChange = false
    ) => {
        if (!isModuleAvailable(moduleId)) {
            setModelOpen(true);
            return;
        }

        const action = event.length > 0 ? 'activate' : 'deactivate';
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
            if (reloadOnChange) window.location.reload();
        } catch (error) {
            setSuccessMsg(`Error: Failed to ${action} module ${error}`);
            setTimeout(() => setSuccessMsg(''), 2000);
        }
    };

    useEffect(() => {
        let highlightedElement: HTMLElement | null = null;
        let hasHighlightedOnce = false;

        const scrollToTargetSection = () => {
            if (hasHighlightedOnce) return;
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.replace('#&', ''));
            const targetId = params.get('module');
            if (!targetId) return;

            setTimeout(() => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    targetElement.classList.add('highlight');
                    highlightedElement = targetElement;
                    hasHighlightedOnce = true;
                }
            }, 500);
        };

        const handleClickAnywhere = (e: Event) => {
            if (highlightedElement && !highlightedElement.contains(e.target as Node)) {
                highlightedElement.classList.remove('highlight');
                highlightedElement = null;
            }
        };

        scrollToTargetSection();
        document.addEventListener('pointerdown', handleClickAnywhere);
        return () => document.removeEventListener('pointerdown', handleClickAnywhere);
    }, []);
    const statusOptions = [
        { label: `All (${totalCount})`, value: 'All' },
        { label: `Active (${activeCount})`, value: 'Active' },
        { label: `Inactive (${inactiveCount})`, value: 'Inactive' },
    ];

    return (
        <>
            <AdminBreadcrumbs
                settingIcon="adminfont-module"
                headerTitle="Modules"
                description={'Manage marketplace features by enabling or disabling modules.'}
            />

            <div className="module-container general-wrapper">
                {/* <Dialog className="admin-module-popup" open={modelOpen} onClose={() => setModelOpen(false)}>
                    <button
                        className="admin-font adminfont-cross"
                        onClick={() => setModelOpen(false)}
                        aria-label="Close dialog"
                    ></button>
                    {ProPopupComponent && <ProPopupComponent />}
                </Dialog> */}

                {successMsg && (<SuccessNotice title={'Success!'} message={successMsg} />)}
                <div className="module-search">
                    {/* <span
                        className={`status-item ${selectedFilter === 'All' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('All')}
                    >
                        All ({totalCount})
                    </span>

                    <span
                        className={`status-item ${selectedFilter === 'Active' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('Active')}
                    >
                        Active ({activeCount})
                    </span>

                    <span
                        className={`status-item ${selectedFilter === 'Inactive' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('Inactive')}
                    >
                        Inactive ({inactiveCount})
                    </span> */}
                        <HeaderSearch
                            search={{
                                placeholder: 'Search .....',
                                options: statusOptions
                            }}
                            onQueryUpdate={(e) => {
                                setSearchQuery(e.searchValue);
                                if ('searchAction' in e) {
                                    setSelectedFilter(e.searchAction);
                                }
                            }}
                        />
                    </div>

                    <div className="category-filter">
                        {modulesArray.category && categories.length > 1 &&
                            categories.map((category) => (
                                <span
                                    key={category.id}
                                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.label}
                                </span>
                            ))
                        }
                    </div>

                    <div className="module-option-row">
                        {filteredModules.map((item, index) => {
                            if (!isModule(item)) return null;

                            const module = item;
                            const requiredPlugins = module.reqPluging || [];

                            return (
                                <div data-index={index} className="module-list-item" key={module.id} id={module.id}>
                                    <div className="module-body">
                                        <div className="module-header">
                                            <div className="icon"><i className={`font ${module.icon}`}></i></div>
                                            <div className="pro-tag">
                                                {module.proModule && !appLocalizer.khali_dabba && (
                                                    <i className="adminfont-pro-tag"></i>
                                                )}
                                            </div>
                                        </div>
                                        <div className="module-details">
                                            <div className="meta-name">{module.name}</div>
                                            <div className="tag-wrapper">
                                                {getCategories(module.category).map((cat, idx) => (
                                                    <span key={idx} className="admin-badge blue">
                                                        {formatCategory(cat)}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="meta-description" dangerouslySetInnerHTML={{ __html: module.desc || '' }}></p>
                                        </div>
                                    </div>
                                    <div className="footer-wrapper">
                                        {requiredPlugins.length > 0 && (
                                            <div className="requires">
                                                <div className="requires-title">Requires:</div>
                                                {requiredPlugins.map((plugin, idx) => (
                                                    <span key={idx}>
                                                        <a href={plugin.link} className="link-item" target="_blank" rel="noopener noreferrer">
                                                            {plugin.name}
                                                        </a>
                                                        {idx < requiredPlugins.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="module-footer">
                                            <div className="buttons">
                                                {module.docLink && <a href={module.docLink} target="_blank"><i className="adminfont-book"></i></a>}
                                                {module.videoLink && <a href={module.videoLink} target="_blank"><i className="adminfont-button-appearance"></i></a>}
                                                {module.settingsLink && <a href={module.settingsLink}><i className="adminfont-setting"></i></a>}
                                            </div>
                                            <div className="toggle-checkbox" data-tour={`${module.id}-showcase-tour`}>
                                                <MultiCheckBoxUI
                                                    look="toggle"
                                                    type="checkbox"
                                                    value={modules.includes(module.id) ? [module.id] : []}
                                                    onChange={(e) =>
                                                        handleOnChange(
                                                            e,
                                                            module.id,
                                                            module.reloadOnChange
                                                        )}
                                                    options={[
                                                        { key: module.id, value: module.id },
                                                    ]}
                                                />
                                            </div>
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