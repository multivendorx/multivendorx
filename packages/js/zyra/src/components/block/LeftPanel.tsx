import React from 'react';
import { ReactSortable } from 'react-sortablejs';
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
    blocks?: BlockConfig[]; // Legacy support
    blockGroups?: BlockGroup[]; // New grouped approach
    templates?: Template[];
    activeTemplateId?: string;
    onTemplateSelect?: (templateId: string) => void;
    groupName?: string;
    showTemplatesTab?: boolean;
    visibleGroups?: string[]; // Array of group IDs to display (e.g., ['store', 'registration'])
    collapsible?: boolean; // Whether groups can be collapsed
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
    blocks = [],
    blockGroups = [],
    templates = [],
    activeTemplateId,
    onTemplateSelect,
    groupName = 'blocks',
    showTemplatesTab = false,
    visibleGroups = [], // If empty, show all groups
    collapsible = true,
}) => {
    const [activeTab, setActiveTab] = React.useState(showTemplatesTab ? 'blocks' : 'blocks');
    const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

    // Determine which blocks to display
    const displayGroups = React.useMemo(() => {
        // Legacy mode: if blocks prop is used, create a single default group
        if (blocks.length > 0 && blockGroups.length === 0) {
            return [{
                id: 'default',
                label: 'All Blocks',
                blocks: blocks,
            }];
        }

        // New mode: use blockGroups
        if (visibleGroups.length === 0) {
            // No filter - show all groups
            return blockGroups;
        }

        // Filter groups based on visibleGroups
        return blockGroups.filter(group => visibleGroups.includes(group.id));
    }, [blocks, blockGroups, visibleGroups]);

    const toggleGroupCollapse = (groupId: string) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

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
                    <aside className="elements-section">
                        {displayGroups.map((group) => {
                            const isCollapsed = collapsedGroups.has(group.id);
                            
                            return (
                                <div key={group.id} className="block-group">
                                    {/* Group Header - only show if multiple groups */}
                                    {displayGroups.length > 1 && (
                                        <div 
                                            className={`block-group-header ${collapsible ? 'collapsible' : ''}`}
                                            onClick={() => collapsible && toggleGroupCollapse(group.id)}
                                        >
                                            <div className="block-group-title">
                                                {group.icon && <i className={group.icon} />}
                                                <span>{group.label}</span>
                                            </div>
                                            {collapsible && (
                                                <i className={`adminfont-${isCollapsed ? 'plus' : 'minus'}`} />
                                            )}
                                        </div>
                                    )}

                                    {/* Group Blocks */}
                                    {!isCollapsed && (
                                        <ReactSortable
                                            list={group.blocks}
                                            setList={() => {}}
                                            sort={false}
                                            group={{ name: groupName, pull: 'clone', put: false }}
                                            className={`section-container open ${group.id}-group`}
                                        >
                                            {group.blocks.map((item) => (
                                                <div key={item.value} className="elements-items">
                                                    <i className={item.icon} />
                                                    <p className="list-title">{item.label}</p>
                                                </div>
                                            ))}
                                        </ReactSortable>
                                    )}
                                </div>
                            );
                        })}
                    </aside>
                )}
                
                {activeTab === 'templates' && showTemplatesTab && (
                    <aside className="template-list">
                        {templates.map((tpl) => (
                            <div
                                key={tpl.id}
                                className={`template-item ${tpl.id === activeTemplateId ? 'active' : ''}`}
                                onClick={() => onTemplateSelect?.(tpl.id)}
                            >
                                {tpl.name}
                                <div className="template-image-wrapper">
                                    <div className="template-image">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </aside>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;