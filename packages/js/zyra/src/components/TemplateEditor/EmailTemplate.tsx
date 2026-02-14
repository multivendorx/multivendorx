// External Dependencies
import React, { useState, useEffect, useRef } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import {
    Block, BlockPatch, BlockRenderer, ColumnRenderer,
    useColumnManager, LeftPanel, createBlock
} from '../block';
import SettingMetaBox from '../SettingMetaBox';
import { FieldComponent } from '../types';

export interface EmailTemplate {
    id: string;
    name: string;
    previewText?: string;
    blocks: Block[];
}

interface EmailTemplateProps {
    field: any;
    value: any;
    onChange: (value: any) => void;
    canAccess: boolean;
    appLocalizer: any;
    setting?: Record<string, any>;
    name?: string;
    proSettingChange?: () => boolean;
}

const EMAIL_BLOCK_GROUPS = [{
    id: 'email',
    label: 'Email Blocks',
    blocks: [
        { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading', fixedName: 'email-heading', placeholder: 'Enter your heading here' },
        { id: 'richtext', icon: 'adminfont-t-letter-bold', value: 'richtext', label: 'Text', fixedName: 'email-text', placeholder: '<p>Enter your text content here</p>' },
        { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image', fixedName: 'email-image', placeholder: '' },
        { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button', fixedName: 'email-button', placeholder: 'Click me' },
        { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider', fixedName: 'email-divider' },
        { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns', fixedName: 'email-columns' },
    ]
}];

const DEFAULT_TEMPLATES: EmailTemplate[] = [{
    id: 'default',
    name: 'Default Template',
    previewText: 'Start with a blank email template',
    blocks: [],
}];

export const EmailTemplateUI: React.FC<EmailTemplateProps> = ({
    field, value, onChange, proSettingChange = () => false,
    name = field?.key || 'email-template', setting = {},
}) => {
    // Track if changes have been made
    const settingHasChanged = useRef(false);
    
    const savedData = value || setting[name] || {};
    const [templates, setTemplates] = useState<EmailTemplate[]>(() => 
        field?.templates?.length ? field.templates.map(t => ({ 
            ...t, ...savedData.templates?.find((st: EmailTemplate) => st.id === t.id) 
        })) : savedData.templates?.length ? savedData.templates : DEFAULT_TEMPLATES
    );
    
    const [activeTemplateId, setActiveTemplateId] = useState<string>(
        savedData.activeTemplateId || field?.defaultTemplateId || templates[0]?.id || DEFAULT_TEMPLATES[0].id
    );
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    const activeTemplate = templates.find(t => t.id === activeTemplateId);

    // Trigger onChange when templates or activeTemplateId change (if changes were made)
    useEffect(() => {
        if (settingHasChanged.current) {
            onChange({ templates, activeTemplateId });
            settingHasChanged.current = false;
        }
    }, [templates, activeTemplateId, onChange]);

    // Helper to mark that changes have been made
    const markChanged = () => {
        settingHasChanged.current = true;
    };

    const columnManager = useColumnManager({
        blocks: activeTemplate?.blocks || [],
        onBlocksUpdate: (blocks) => {
            setTemplates(prev => 
                prev.map(t => t.id === activeTemplateId ? { ...t, blocks } : t)
            );
            markChanged();
        },
        openBlock, setOpenBlock,
    });

    const updateBlocks = (blocks: Block[]) => {
        setTemplates(prev => 
            prev.map(t => t.id === activeTemplateId ? { ...t, blocks } : t)
        );
        markChanged();
    };

    const updateBlock = (index: number, patch: BlockPatch) => {
        if (proSettingChange() || !activeTemplate) return;
        const updated = [...activeTemplate.blocks];
        updated[index] = { ...updated[index], ...patch } as Block;
        updateBlocks(updated);
        if (openBlock?.id === updated[index].id) setOpenBlock(updated[index]);
    };

    const deleteBlock = (index: number) => {
        if (proSettingChange() || !activeTemplate) return;
        const deletedBlock = activeTemplate.blocks[index];
        updateBlocks(activeTemplate.blocks.filter((_, i) => i !== index));
        if (openBlock?.id === deletedBlock.id) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    };

    const handleSetList = (newList: any[]) => {
        if (proSettingChange()) return;
        const processedList = newList.map(item =>
            createBlock(item, 'email')
        );
        updateBlocks(processedList);
    };

    const handleSettingsChange = (key: string, value: any) => {
        if (proSettingChange() || !activeTemplate) return;
        
        if (columnManager.selectedLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedLocation;
            columnManager.handleChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value });
            markChanged(); // Mark changed after column child update
            return;
        }

        const index = activeTemplate.blocks.findIndex(b => b.id === openBlock?.id);
        if (index >= 0) {
            if (key === 'layout' && activeTemplate.blocks[index].type === 'columns') {
                columnManager.handleLayoutChange(index, value);
                markChanged(); // Mark changed after layout change
            } else {
                updateBlock(index, { [key]: value }); // updateBlock already calls markChanged through updateBlocks
            }
        }
    };

    const handleTemplateSelect = (id: string) => {
        setActiveTemplateId(id);
        setOpenBlock(null);
        columnManager.clearSelection();
        markChanged(); // Mark changed when template is selected
    };

    if (!activeTemplate) return <div className="email-template-error"><p>No active template found</p></div>;

    return (
        <div className="registration-from-wrapper email-builder">
            <LeftPanel
                blockGroups={EMAIL_BLOCK_GROUPS}
                templates={templates}
                activeTemplateId={activeTemplateId}
                onTemplateSelect={handleTemplateSelect}
                groupName="email" 
                showTemplatesTab 
                visibleGroups={['email']} 
                collapsible
            />

            <div className="registration-form-main-section email-canvas">
                <ReactSortable
                    list={activeTemplate.blocks} 
                    setList={handleSetList}
                    group={{ name: 'email', pull: true, put: true }} 
                    handle=".drag-handle"
                    animation={150} 
                    fallbackOnBody 
                    swapThreshold={0.65} 
                    className="email-canvas-sortable"
                >
                    {activeTemplate.blocks.map((block, index) => (
                        <div className="field-wrapper" key={block.id}>
                            {block.type === 'columns' ? (
                                <ColumnRenderer
                                    block={block} 
                                    parentIndex={index} 
                                    blocks={activeTemplate.blocks}
                                    isActive={openBlock?.id === block.id} 
                                    groupName="email"
                                    openBlock={openBlock} 
                                    setOpenBlock={setOpenBlock}
                                    onBlocksUpdate={(updatedBlocks) => {
                                        updateBlocks(updatedBlocks);
                                        // updateBlocks already calls markChanged
                                    }}
                                    onSelect={() => { 
                                        setOpenBlock(block); 
                                        columnManager.clearSelection(); 
                                    }}
                                    onDelete={() => deleteBlock(index)}
                                />
                            ) : (
                                <BlockRenderer
                                    block={block} 
                                    onSelect={() => { 
                                        setOpenBlock(block); 
                                        columnManager.clearSelection(); 
                                    }}
                                    onChange={(patch) => {
                                        updateBlock(index, patch);
                                        // updateBlock already calls markChanged through updateBlocks
                                    }}
                                    onDelete={() => deleteBlock(index)} 
                                    isActive={openBlock?.id === block.id}
                                />
                            )}
                        </div>
                    ))}
                </ReactSortable>
            </div>

            {openBlock && (
                <div className="registration-edit-form-wrapper">
                    <div className="registration-edit-form">
                        <div className="meta-setting-modal-content">
                            <div className="block-type-header">
                                <div className="block-type-title">
                                    <h3>{openBlock.type.charAt(0).toUpperCase() + openBlock.type.slice(1)} Settings</h3>
                                </div>
                            </div>
                            <SettingMetaBox
                                formField={openBlock} 
                                opened={{ click: true }} 
                                onChange={handleSettingsChange}
                                inputTypeList={EMAIL_BLOCK_GROUPS[0].blocks.map(b => ({ value: b.value, label: b.label }))}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const EmailTemplate: FieldComponent = {
    render: EmailTemplateUI,
    validate: (field, value) => field.required && !value ? `${field.label} is required` : null,
};

export default EmailTemplate;