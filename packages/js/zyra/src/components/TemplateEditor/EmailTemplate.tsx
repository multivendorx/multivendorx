// External Dependencies
import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

import {
    Block,
    BlockPatch,
    BlockRenderer,
    ColumnRenderer,
    useColumnManager,
    LeftPanel,
} from '../block';

import SettingMetaBox from '../SettingMetaBox';
import { FieldComponent } from '../types';

// Types
export interface EmailTemplate {
    id: string;
    name: string;
    previewText?: string;
    blocks: Block[];
}

interface EmailTemplateField {
    templates?: EmailTemplate[];
    defaultTemplateId?: string;
    [key: string]: any;
}

interface EmailTemplateProps {
    field: EmailTemplateField;
    value: any;
    onChange: (value: any) => void;
    canAccess: boolean;
    appLocalizer: any;
    setting?: Record<string, any>;
    name?: string;
    proSettingChange?: () => boolean;
}

// Constants
const EMAIL_BLOCKS = [
    { 
        id: 'heading', 
        icon: 'adminfont-form-textarea', 
        value: 'heading', 
        label: 'Heading',
        fixedName: 'email-heading',
        placeholder: 'Enter your heading here'
    },
    { 
        id: 'richtext', 
        icon: 'adminfont-t-letter-bold', 
        value: 'richtext', 
        label: 'Text',
        fixedName: 'email-text',
        placeholder: 'Enter your text content here'
    },
    { 
        id: 'image', 
        icon: 'adminfont-image', 
        value: 'image', 
        label: 'Image',
        fixedName: 'email-image'
    },
    { 
        id: 'button', 
        icon: 'adminfont-button', 
        value: 'button', 
        label: 'Button',
        fixedName: 'email-button',
        placeholder: 'Click me'
    },
    { 
        id: 'divider', 
        icon: 'adminfont-divider', 
        value: 'divider', 
        label: 'Divider',
        fixedName: 'email-divider'
    },
    { 
        id: 'columns', 
        icon: 'adminfont-blocks', 
        value: 'columns', 
        label: 'Columns',
        fixedName: 'email-columns'
    },
];

const DEFAULT_TEMPLATE: EmailTemplate = {
    id: 'default',
    name: 'Default Template',
    previewText: 'Default email template',
    blocks: [],
};

// Simple ID generator
let idCounter = Date.now();
const generateId = () => ++idCounter;

// Helper: Create a new block
const createBlock = (type: Block['type'], fixedName?: string, placeholder?: string, label?: string): Block => {
    const id = generateId();
    const block: any = {
        id,
        type,
        name: fixedName ?? `${type}-${id}`,
        label: label ?? type.charAt(0).toUpperCase() + type.slice(1),
    };

    if (placeholder) block.placeholder = placeholder;

    if (type === 'columns') {
        block.columns = [[], []];
        block.layout = '2-50';
    }
    if (type === 'heading') {
        block.text = placeholder || 'Heading Text';
        block.level = 2;
    }
    if (type === 'richtext') {
        block.html = placeholder || '<p>This is a demo text</p>';
    }
    if (type === 'button') {
        block.text = placeholder || 'Click me';
        block.url = '#';
    }
    if (type === 'image') {
        block.src = 'https://via.placeholder.com/300x200';
        block.alt = 'Placeholder image';
    }

    return block as Block;
};

// Main Component
export const EmailTemplateUI: React.FC<EmailTemplateProps> = ({
    field,
    value,
    onChange,
    proSettingChange = () => false,
    name = field?.key || 'email-template',
    setting = {},
}) => {
    // Get saved data
    const savedData = value || setting[name] || {};
    const savedTemplates = savedData.templates || [];
    const savedActiveId = savedData.activeTemplateId;
    
    // Initialize templates
    const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
        // If we have saved templates, use them
        if (savedTemplates.length > 0) return savedTemplates;
        
        // If field provides templates from backend, use those
        if (field?.templates?.length > 0) return field.templates;
        
        // Otherwise use default
        return [DEFAULT_TEMPLATE];
    });
    
    // Initialize active template ID
    const [activeTemplateId, setActiveTemplateId] = useState<string>(() => {
        if (savedActiveId) return savedActiveId;
        if (field?.defaultTemplateId) return field.defaultTemplateId;
        return templates[0]?.id || DEFAULT_TEMPLATE.id;
    });
    
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    
    const activeTemplate = templates.find(t => t.id === activeTemplateId);
    
    if (!activeTemplate) {
        // Fallback - create a default template
        const fallbackTemplate = DEFAULT_TEMPLATE;
        setTemplates([fallbackTemplate]);
        setActiveTemplateId(fallbackTemplate.id);
        return <div>Loading template...</div>;
    }

    // Save to parent
    const saveToParent = (updatedTemplates: EmailTemplate[], updatedActiveId: string) => {
        onChange({
            ...value,
            [name]: {
                templates: updatedTemplates,
                activeTemplateId: updatedActiveId,
            }
        });
    };

    const updateBlocks = (blocks: Block[]) => {
        if (proSettingChange()) return;
        
        const updated = templates.map(t =>
            t.id === activeTemplateId ? { ...t, blocks } : t
        );
        
        setTemplates(updated);
        saveToParent(updated, activeTemplateId);
    };

    const updateBlock = (index: number, patch: BlockPatch) => {
        if (proSettingChange()) return;
        
        const updated = [...activeTemplate.blocks];
        updated[index] = { ...updated[index], ...patch } as Block;
        updateBlocks(updated);
        
        if (openBlock?.id === updated[index].id) setOpenBlock(updated[index]);
    };

    const deleteBlock = (index: number) => {
        if (proSettingChange()) return;
        
        const deletedId = activeTemplate.blocks[index].id;
        const updated = activeTemplate.blocks.filter((_, i) => i !== index);
        updateBlocks(updated);
        
        if (openBlock?.id === deletedId) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    };

    const handleSetList = (newList: any[]) => {
        if (proSettingChange()) return;
        
        const processed = newList.map(item => {
            if (item?.id && item?.type) return item as Block;
            
            if (item?.value) {
                const config = EMAIL_BLOCKS.find(b => b.value === item.value);
                return createBlock(
                    item.value,
                    config?.fixedName,
                    config?.placeholder,
                    config?.label
                );
            }
            
            return item;
        });
        
        updateBlocks(processed);
    };

    const columnManager = useColumnManager({
        blocks: activeTemplate.blocks,
        onBlocksUpdate: updateBlocks,
        openBlock,
        setOpenBlock,
    });

    const handleSettingsChange = (key: string, value: any) => {
        if (proSettingChange()) return;

        if (columnManager.selectedLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedLocation;
            columnManager.handleChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value } as any);
        } else {
            const index = activeTemplate.blocks.findIndex(b => b.id === openBlock?.id);
            if (index >= 0) {
                if (key === 'layout' && activeTemplate.blocks[index].type === 'columns') {
                    columnManager.handleLayoutChange(index, value);
                } else {
                    updateBlock(index, { [key]: value } as any);
                }
            }
        }
    };

    return (
        <div className="registration-from-wrapper email-builder">
            <LeftPanel
                blocks={EMAIL_BLOCKS}
                templates={templates}
                activeTemplateId={activeTemplateId}
                onTemplateSelect={setActiveTemplateId}
                groupName="email"
                showTemplatesTab={true}
            />

            <div className="registration-form-main-section email-canvas">
                <ReactSortable
                    list={activeTemplate.blocks}
                    setList={handleSetList}
                    group={{ name: 'email', pull: true, put: true }}
                    handle=".drag-handle"
                    animation={150}
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
                                    onBlocksUpdate={updateBlocks}
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
                                    onChange={(patch) => updateBlock(index, patch)}
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
                    <SettingMetaBox
                        formField={openBlock}
                        opened={{ click: true }}
                        onChange={handleSettingsChange}
                        inputTypeList={EMAIL_BLOCKS.map(b => ({ value: b.value, label: b.label }))}
                    />
                </div>
            )}
        </div>
    );
};

const EmailTemplate: FieldComponent = {
    render: EmailTemplateUI,
    validate: (field, value) => {
        if (field.required && !value) return `${field.label} is required`;
        return null;
    },
};

export default EmailTemplate;