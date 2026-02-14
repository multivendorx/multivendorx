// External Dependencies
import React, { useState, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import { BlockConfig } from '../block/blockTypes';

interface Template {
    id: string;
    name: string;
    previewText?: string;
}

interface BlockGroup {
    id: string;
    label: string;
    blocks: BlockConfig[];
    icon?: string;
}

interface LeftPanelProps {
    blockGroups?: BlockGroup[];
    templates?: Template[];
    activeTemplateId?: string;
    onTemplateSelect?: (templateId: string) => void;
    groupName?: string;
    showTemplatesTab?: boolean;
    visibleGroups?: string[]; // Array of group IDs to display (e.g., ['store', 'registration'])
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
    blockGroups = [],
    templates = [],
    activeTemplateId,
    onTemplateSelect,
    groupName = 'blocks',
    showTemplatesTab = false,
    visibleGroups = [],
}) => {
    const [activeTab, setActiveTab] = useState(showTemplatesTab ? 'templates' : 'blocks');
    
    // Track open/closed state for each group separately
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        // Initialize all groups as open by default
        const initialState: Record<string, boolean> = {};
        const groupsToShow = visibleGroups.length === 0 ? blockGroups : blockGroups.filter(group => visibleGroups.includes(group.id));
        groupsToShow.forEach(group => {
            initialState[group.id] = true;
        });
        return initialState;
    });

    // Determine which blocks to display
    const displayGroups = useCallback(() => {
        if (visibleGroups.length === 0) {
            return blockGroups;
        }
        return blockGroups.filter(group => visibleGroups.includes(group.id));
    }, [blockGroups, visibleGroups]);

    const toggleGroup = useCallback((groupId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    }, []);

    const groupsToDisplay = displayGroups();

    return (
        <div className="elements-wrapper">
            <div className="tab-titles">
                <div 
                    className={`title ${activeTab === 'blocks' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('blocks')}
                >
                    Blocks
                </div>
                
                {showTemplatesTab && templates.length > 0 && (
                    <div 
                        className={`title ${activeTab === 'templates' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('templates')}
                    >
                        Templates
                    </div>
                )}
            </div>

            <div className="tab-contend">
                {activeTab === 'blocks' && (
                    <>
                        {groupsToDisplay.map((group) => {
                            const isOpen = openGroups[group.id] !== false; // Default to true if not set
                            const groupBlocks = group.blocks;
                            
                            return (
                                <aside key={group.id} className="elements-section">
                                    <div
                                        className="section-meta"
                                        onClick={(e) => toggleGroup(group.id, e)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <h2>
                                            {group.label} <span>({groupBlocks.length})</span>
                                        </h2>
                                        <i
                                            className={`adminfont-pagination-right-arrow ${isOpen ? 'rotate' : ''}`}
                                        ></i>
                                    </div>

                                    <main
                                        className={`section-container ${isOpen ? 'open' : 'closed'}`}
                                    >
                                        <ReactSortable
                                            list={groupBlocks}
                                            setList={() => {}}
                                            sort={false}
                                            group={{ name: groupName, pull: 'clone', put: false }}
                                        >
                                            {groupBlocks.map((item) => (
                                                <div
                                                    key={item.value}
                                                    role="button"
                                                    tabIndex={0}
                                                    className="elements-items"
                                                >
                                                    <i className={item.icon} />
                                                    <p className="list-title">{item.label}</p>
                                                </div>
                                            ))}
                                        </ReactSortable>
                                    </main>
                                </aside>
                            );
                        })}
                    </>
                )}
                
                {activeTab === 'templates' && showTemplatesTab && (
                    <aside className="elements-section">
                        <div className="section-meta">
                            <h2>Templates <span>({templates.length})</span></h2>
                        </div>
                        <main className="section-container open">
                            {templates.map((tpl) => (
                                <div
                                    key={tpl.id}
                                    role="button"
                                    tabIndex={0}
                                    className={`template-item ${tpl.id === activeTemplateId ? 'active' : ''}`}
                                    onClick={() => onTemplateSelect?.(tpl.id)}
                                >
                                    <div className="template-name">{tpl.name}</div>
                                    {tpl.previewText && (
                                        <div className="template-preview">{tpl.previewText}</div>
                                    )}
                                </div>
                            ))}
                        </main>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;