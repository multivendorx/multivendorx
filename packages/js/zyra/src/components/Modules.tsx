import React, { useState, useMemo, useEffect } from 'react';
import { getApiLink, sendApiResponse } from '../utils/apiService';
import { useModules } from '../contexts/ModuleContext';
import '../styles/web/Modules.scss';
import { MultiCheckBoxUI } from './MultiCheckbox';
import HeaderSearch from './HeaderSearch';
import { SelectInputUI } from './SelectInput';
import { PopupUI } from './Popup';
import { Notice } from './Notice';

interface Module {
    id: string;
    name: string;
    desc?: string;
    icon: string;
    docLink?: string;
    videoLink?: string;
    reqPluging?: { name: string; slug: string; link: string }[];
    settingsLink?: string;
    proModule?: boolean;
    category?: string | string[];
    type?: string;
    reloadOnChange?: boolean;
    miniModule?: boolean;
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
    active_plugins?: string[];
}

interface ModuleProps {
    modulesArray?: { category: boolean; modules: ModuleItem[] };
    apiLink: string;
    pluginName: string;
    appLocalizer: AppLocalizer;
    proPopupContent?: React.FC;
    variant?: 'default' | 'mini-module';
}

const isModule = (item: ModuleItem): item is Module => !('type' in item);

const Modules: React.FC<ModuleProps> = ({
    modulesArray = { category: false, modules: [] },
    appLocalizer,
    apiLink,
    proPopupContent: ProPopupComponent,
    pluginName,
    variant = 'default'
}) => {

    const [modelOpen, setModelOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const { modules, insertModule, removeModule } = useModules();

    const moduleList = useMemo(
        () => modulesArray.modules.filter(isModule),
        [modulesArray.modules]
    );

    const totalCount = moduleList.length;
    const activeCount = moduleList.filter(m => modules.includes(m.id)).length;
    const inactiveCount = totalCount - activeCount;

    const formatCategory = (category: string): string =>
        category
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const getCategories = (category?: string | string[]) =>
        category ? (Array.isArray(category) ? category : [category]) : [];

    const categories = [
        { id: 'All', label: 'All' },
        ...modulesArray.modules
            .filter((item): item is Separator => !isModule(item))
            .map(item => ({ id: item.id, label: item.label })),
    ];

    const isModuleAvailable = (module: Module) =>
        module.proModule ? appLocalizer.khali_dabba ?? false : true;

    const handleOnChange = (
        event: string[],
        module: Module
    ) => {

        document.querySelector('.module-list-item.highlight')
            ?.classList.remove('highlight');

        if (!isModuleAvailable(module)) {
            setModelOpen(true);
            return;
        }

        if (module.reqPluging?.some(
            plugin => !appLocalizer.active_plugins?.includes(plugin.slug)
        )) return;

        const action = event.length > 0 ? 'activate' : 'deactivate';

        action === 'activate'
            ? insertModule?.(module.id)
            : removeModule?.(module.id);

        localStorage.setItem(`force_${pluginName}_context_reload`, 'true');

        sendApiResponse(
            appLocalizer,
            getApiLink(appLocalizer, apiLink),
            { id: module.id, action }
        )
            .then(() => {
                setSuccessMsg(`Module ${action}d`);
                setTimeout(() => setSuccessMsg(''), 2000);

                if (module.reloadOnChange) {
                    window.location.reload();
                }
            })
            .catch(() => {
                setSuccessMsg(`Error: Failed to ${action} module`);
                setTimeout(() => setSuccessMsg(''), 2000);
            });
    };

    const filteredModules = useMemo(() => {
        return modulesArray.modules.filter(module => {
            if (!isModule(module)) return false;
            if (variant === 'mini-module' && !module.miniModule) return false;

            const moduleCategories = getCategories(module.category);
            const isActive = modules.includes(module.id);

            const matchesCategory =
                selectedCategory === 'All' ||
                moduleCategories.includes(selectedCategory);

            const matchesStatus =
                selectedFilter === 'All' ||
                (selectedFilter === 'Active' && isActive) ||
                (selectedFilter === 'Inactive' && !isActive);

            const matchesSearch =
                !searchQuery ||
                module.name.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesStatus && matchesSearch;
        });
    }, [moduleList, selectedCategory, selectedFilter, searchQuery, modules]);

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
            {modelOpen && (
                <PopupUI
                    position="lightbox"
                    open={modelOpen}
                    onClose={() => setModelOpen(false)}
                    width={31.25}
                    height="auto"
                >
                    {ProPopupComponent && <ProPopupComponent />}
                </PopupUI>
            )}

            {successMsg && (
                <Notice
                    message={successMsg}
                    displayPosition='float'
                    title='Success!'
                // onDismiss={() => setSuccessMsg(null)}
                />
            )}

            <div className="module-container" data-variant={variant}>

                {/* FILTER SECTION */}
                {variant === 'default' && (
                    <div className="filter-wrapper">

                        {modulesArray.category && categories.length > 1 && (
                            <div className="category-filter">
                                {categories.map((category) => (
                                    <span
                                        key={category.id}
                                        className={`category-item ${selectedCategory === category.id ? 'active' : ''
                                            }`}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        {category.label}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="module-search">
                            <HeaderSearch
                                variant="mini-search"
                                search={{ placeholder: 'Search .....' }}
                                onQueryUpdate={(e) => {
                                    setSearchQuery(e.searchValue);
                                    if ('searchAction' in e) {
                                        setSelectedFilter(e.searchAction);
                                    }
                                }}
                            />

                            <SelectInputUI
                                type="single-select"
                                options={statusOptions}
                                value={selectedFilter}
                                size="8rem"
                                onChange={(newValue) =>
                                    setSelectedFilter(newValue.value)
                                }
                            />
                        </div>
                    </div>
                )}

                <div className="module-option-row">
                    {filteredModules.map((item, index) => {

                        if (!isModule(item)) return null;

                        const module = item;
                        const isActive = modules.includes(module.id);
                        const requiredPlugins = module.reqPluging || [];
                        const moduleCategories = getCategories(module.category);

                        const toggleComponent = (
                            <MultiCheckBoxUI
                                look="toggle"
                                type="checkbox"
                                value={isActive ? [module.id] : []}
                                onChange={(e) => handleOnChange(e, module)}
                                options={[{ key: module.id, value: module.id }]}
                            />
                        );

                        return (
                            <div
                                key={module.id}
                                id={module.id}
                                data-index={index}
                                className="module-list-item"
                            >
                                <div className="module-body">

                                    <div className="module-header">
                                        <div className="icon">
                                            <i className={`font adminfont-${module.id}`} />
                                        </div>

                                        {module.proModule && !appLocalizer.khali_dabba && (
                                            <div className="pro-tag">
                                                <i className="adminfont-pro-tag" />
                                            </div>
                                        )}

                                        {variant === 'mini-module' &&
                                            (appLocalizer.khali_dabba || !module.proModule) && (
                                                <div className="toggle-checkbox">
                                                    {toggleComponent}
                                                </div>
                                            )}
                                    </div>

                                    <div className="module-details">
                                        <div className="meta-name">
                                            {module.name}
                                        </div>

                                        {variant === 'default' && (
                                            <>
                                                {moduleCategories.length > 0 && (
                                                    <div className="tag-wrapper">
                                                        {moduleCategories.map((cat, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="admin-badge blue"
                                                            >
                                                                {formatCategory(cat)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <p
                                                    className="meta-description"
                                                    dangerouslySetInnerHTML={{
                                                        __html: module.desc || '',
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {variant === 'default' && (
                                    <div className="footer-wrapper">

                                        {requiredPlugins.length > 0 && (
                                            <div className="requires">
                                                <div className="requires-title">
                                                    Requires:
                                                </div>
                                                {requiredPlugins.map((plugin, idx) => (
                                                    <span key={idx}>
                                                        <a
                                                            href={plugin.link}
                                                            className="link-item"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {plugin.name}
                                                        </a>
                                                        {idx < requiredPlugins.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="module-footer">
                                            <div className="buttons">
                                                {module.docLink && (
                                                    <a href={module.docLink} target="_blank" rel="noreferrer">
                                                        <i className="adminfont-book" />
                                                    </a>
                                                )}
                                                {module.videoLink && (
                                                    <a href={module.videoLink} target="_blank" rel="noreferrer">
                                                        <i className="adminfont-button-appearance" />
                                                    </a>
                                                )}
                                                {module.settingsLink && (
                                                    <a href={module.settingsLink}>
                                                        <i className="adminfont-setting" />
                                                    </a>
                                                )}
                                            </div>

                                            <div
                                                className="toggle-checkbox"
                                                data-tour={`${module.id}-showcase-tour`}
                                            >
                                                {toggleComponent}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Modules;
