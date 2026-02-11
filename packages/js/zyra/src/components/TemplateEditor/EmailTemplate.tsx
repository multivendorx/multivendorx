/**
 * EmailTemplate.tsx - CLEAN VERSION
 * Uses ColumnBlockManager for all column operations
 */

import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

import {
    Block,
    BlockPatch,
    normalizeBlock,
    BlockRenderer,
    ColumnRenderer,
    useColumnManager,
    LeftPanel,
} from '../block';

import SettingMetaBox from '../SettingMetaBox';
import BasicInput from '../BasicInput';
import TextArea from '../TextArea';
import FileInput from '../FileInput';
import AddressField from '../AddressField';
import { FieldComponent } from '../types';


export interface EmailTemplate {
    id: string;
    name: string;
    previewText?: string;
    blocks: Block[];
}

interface EmailTemplateProps {
    templates?: EmailTemplate[];
    defaultTemplateId?: string;
}

const EMAIL_BLOCKS = [
    { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading' },
    { id: 'richtext', icon: 'adminfont-t-letter-bold', value: 'richtext', label: 'Text' },
    { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image' },
    { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button' },
    { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider' },
    { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns' },
];

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'order-placed',
        name: 'Template 1',
        previewText: 'Your order has been received',
        blocks: [],
    },
];

export const EmailTemplateUI: React.FC<EmailTemplateProps> = ({
    templates: propTemplates,
    defaultTemplateId,
}) => {
    // Template state
    const [templates, setTemplates] = useState<EmailTemplate[]>(
        propTemplates || DEFAULT_EMAIL_TEMPLATES
    );
    
    const initialTemplateId = defaultTemplateId || 
        (propTemplates?.[0]?.id || DEFAULT_EMAIL_TEMPLATES[0].id);
    
    const [activeTemplateId, setActiveTemplateId] = useState<string>(initialTemplateId);
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    
    const showTemplatesTab = propTemplates !== undefined;
    const activeTemplate = templates.find((t) => t.id === activeTemplateId);
    
    if (!activeTemplate) {
        return <div className="email-template-error">No active template found</div>;
    }

    // Block operations
    const updateBlocks = (blocks: Block[]) => {
        setTemplates((prev) =>
            prev.map((tpl) =>
                tpl.id === activeTemplateId ? { ...tpl, blocks } : tpl
            )
        );
    };

    const updateBlock = (index: number, patch: BlockPatch) => {
        const updated = [...activeTemplate.blocks];
        updated[index] = { ...updated[index], ...patch } as Block;
        updateBlocks(updated);
        
        if (openBlock?.id === updated[index].id) {
            setOpenBlock(updated[index]);
        }
    };

    const deleteBlock = (index: number) => {
        const deletedBlock = activeTemplate.blocks[index];
        const updated = [...activeTemplate.blocks];
        updated.splice(index, 1);
        updateBlocks(updated);
        
        if (openBlock?.id === deletedBlock.id) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    };

    // Column manager hook
    const columnManager = useColumnManager({
        blocks: activeTemplate.blocks,
        onBlocksUpdate: updateBlocks,
        openBlock,
        setOpenBlock,
    });

    // Settings change handler
    const handleSettingsChange = (key: string, value: any) => {
        // Check if editing a column child
        if (columnManager.selectedBlockLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedBlockLocation;
            columnManager.handleColumnChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value } as any);
        } else {
            // Regular block or column parent
            const index = activeTemplate.blocks.findIndex((field) => field.id === openBlock?.id);

            if (index >= 0) {
                // Special handling for column layout changes
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
            {/* LEFT PANEL */}
            <LeftPanel
                blocks={EMAIL_BLOCKS}
                templates={showTemplatesTab ? templates : []}
                activeTemplateId={activeTemplateId}
                onTemplateSelect={setActiveTemplateId}
                groupName="email"
                showTemplatesTab={showTemplatesTab}
            />

            {/* CENTER CANVAS */}
            <div className="registration-form-main-section email-canvas">
                <ReactSortable
                    list={activeTemplate.blocks}
                    setList={(newList) => updateBlocks(newList.map(normalizeBlock))}
                    group={{ name: 'email', pull: true, put: true }}
                    handle=".drag-handle"
                    animation={150}
                    fallbackOnBody
                    swapThreshold={0.65}
                    className="email-canvas-sortable"
                >
                    {activeTemplate.blocks.map((block, index) => {
                        if (!block) return null;

                        return (
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
                                        key={block.id}
                                        block={block}
                                        onSelect={() => {
                                            setOpenBlock(block);
                                            columnManager.clearSelection();
                                        }}
                                        onChange={(patch) => updateBlock(index, patch)}
                                        onDelete={() => deleteBlock(index)}
                                        isActive={openBlock?.id === block.id}
                                        BasicInput={BasicInput}
                                        TextArea={TextArea}
                                        FileInput={FileInput}
                                        AddressField={AddressField}
                                    />
                                )}
                            </div>
                        );
                    })}
                </ReactSortable>
            </div>

            {/* RIGHT SETTINGS */}
            <div className="registration-edit-form-wrapper">
                {openBlock && (
                    <div className="registration-edit-form">
                        <div className="meta-setting-modal-content">
                            <div className="block-type-header">
                                <div className="block-type-title">
                                    <h3>
                                        {openBlock.type.charAt(0).toUpperCase() + openBlock.type.slice(1)} Settings
                                    </h3>
                                </div>
                            </div>
                            <SettingMetaBox
                                formField={openBlock}
                                opened={{ click: true }}
                                onChange={handleSettingsChange}
                                inputTypeList={EMAIL_BLOCKS.map(block => ({ 
                                    value: block.value, 
                                    label: block.label 
                                }))}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const EmailTemplate: FieldComponent = {
    render: EmailTemplateUI,
    validate: (field, value) => {
        if (field.required && !value?.[field.name]) {
            return `${field.label} is required`;
        }
        return null;
    },
};

export default EmailTemplate;