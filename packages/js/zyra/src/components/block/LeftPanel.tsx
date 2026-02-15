// External Dependencies
import React, { useState, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import Tabs from '../Tabs';
import { BlockConfig } from '../block/blockTypes';

interface LeftPanelProps {
    blockGroups?: { id: string; label: string; blocks: BlockConfig[]; icon?: string }[];
    templates?: { id: string; name: string; previewText?: string }[];
    activeTemplateId?: string;
    onTemplateSelect?: (id: string) => void;
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
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
        () => Object.fromEntries(
            (visibleGroups.length ? blockGroups.filter(g => visibleGroups.includes(g.id)) : blockGroups)
                .map(g => [g.id, true])
        )
    );

    const toggleGroup = useCallback((id: string) => 
        setOpenGroups(prev => ({ ...prev, [id]: !prev[id] })), []);

    const groupsToShow = visibleGroups.length 
        ? blockGroups.filter(g => visibleGroups.includes(g.id))
        : blockGroups;

    const blocksContent = (
        <>
            {groupsToShow.map(({ id, label, blocks }) => (
                <aside key={id} className="elements-section">
                    <div className="section-meta" onClick={() => toggleGroup(id)}>
                        <div>{label} <span>({blocks.length})</span></div>
                        <i className={`adminfont-pagination-right-arrow ${openGroups[id] ? 'rotate' : ''}`} />
                    </div>
                    {openGroups[id] && (
                        <main className="section-container open">
                            <ReactSortable list={blocks} setList={() => {}} sort={false} 
                                group={{ name: groupName, pull: 'clone', put: false }}>
                                {blocks.map(({ value, icon, label }) => (
                                    <div key={value} className="elements-items">
                                        <i className={icon} /><p className="list-title">{label}</p>
                                    </div>
                                ))}
                            </ReactSortable>
                        </main>
                    )}
                </aside>
            ))}
        </>
    );

    const templatesContent = showTemplatesTab && (
        <aside className="elements-section">
            <div className="section-meta"><h2>Templates <span>({templates.length})</span></h2></div>
            <main className="section-container open">
                {templates.map(({ id, name, previewText }) => (
                    <div key={id} className={`template-item ${id === activeTemplateId ? 'active' : ''}`}
                        onClick={() => onTemplateSelect?.(id)}>
                        <div className="template-name">{name}</div>
                        {previewText && <div className="template-preview">{previewText}</div>}
                    </div>
                ))}
            </main>
        </aside>
    );

    return (
        <div className="elements-wrapper">
            <Tabs tabs={[
                { label: 'Blocks', content: blocksContent },
                ...(showTemplatesTab && templates.length ? [{ label: 'Templates', content: templatesContent }] : [])
            ]} />
        </div>
    );
};

export default LeftPanel;