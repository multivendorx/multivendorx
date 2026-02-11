import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import { BlockConfig } from '../block/blockTypes';

interface Template {
    id: string;
    name: string;
    previewText?: string;
}

interface LeftPanelProps {
    blocks: BlockConfig[];
    templates?: Template[];
    activeTemplateId?: string;
    onTemplateSelect?: (templateId: string) => void;
    groupName?: string;
    showTemplatesTab?: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
    blocks,
    templates = [],
    activeTemplateId,
    onTemplateSelect,
    groupName = 'blocks',
    showTemplatesTab = false,
}) => {
    const [activeTab, setActiveTab] = React.useState(showTemplatesTab ? 'blocks' : 'blocks');

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
                        <ReactSortable
                            list={blocks}
                            setList={() => {}}
                            sort={false}
                            group={{ name: groupName, pull: 'clone', put: false }}
                            className="section-container open"
                        >
                            {blocks.map((item) => (
                                <div key={item.value} className="elements-items">
                                    <i className={item.icon} />
                                    <p className="list-title">{item.label}</p>
                                </div>
                            ))}
                        </ReactSortable>
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