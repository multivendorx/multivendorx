/**
 * EmailTemplate.tsx - FIXED VERSION with proper JSX syntax
 */

import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

import {
    Block,
    BlockPatch,
    ColumnsBlock,
    EMAIL_BLOCKS,
    createBlock,
    normalizeBlock,
    BlockRenderer,
    getColumnCount,
} from '../block';

import SettingMetaBox from '../SettingMetaBox';


import BasicInput from '../BasicInput';
import MultipleOptions from '../MultipleOption';
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

// Default fallback templates when none are provided via props
const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'order-placed',
        name: 'Template 1',
        previewText: 'Your order has been received',
        blocks: [
            createBlock('heading'),
            createBlock('richtext'),
            createBlock('divider'),
            createBlock('richtext'),
            createBlock('button'),
        ],
    },
    {
        id: 'order-shipped',
        name: 'Template 2',
        previewText: 'Your order is on the way',
        blocks: [
            createBlock('heading'),
            createBlock('richtext'),
            createBlock('richtext'),
            createBlock('button'),
        ],
    },
];

export const EmailTemplateUI: React.FC<EmailTemplateProps> = ({
    templates: propTemplates,
    defaultTemplateId,
}) => {
    // Use provided templates or fall back to defaults
    const [templates, setTemplates] = useState<EmailTemplate[]>(
        propTemplates || DEFAULT_EMAIL_TEMPLATES
    );
    
    // Determine initial active template ID
    const initialTemplateId = defaultTemplateId || 
        (propTemplates?.[0]?.id || DEFAULT_EMAIL_TEMPLATES[0].id);
    
    const [activeTemplateId, setActiveTemplateId] = useState<string>(initialTemplateId);
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    
    // Track where the selected block is located (for column child blocks)
    const [selectedBlockLocation, setSelectedBlockLocation] = useState<{
        parentIndex: number;
        columnIndex: number;
        childIndex: number;
    } | null>(null);
    
    // Only show templates tab when templates are provided via props
    const showTemplatesTab = propTemplates !== undefined;
    const [activeTab, setActiveTab] = useState(showTemplatesTab ? 'blocks' : 'blocks');

    const activeTemplate = templates.find((t) => t.id === activeTemplateId);
    
    // Fallback in case active template is not found
    if (!activeTemplate) {
        return <div className="email-template-error">No active template found</div>;
    }

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
        const updated = [...activeTemplate.blocks];
        updated.splice(index, 1);
        updateBlocks(updated);
        if (openBlock?.id === activeTemplate.blocks[index].id) {
            setOpenBlock(null);
            setSelectedBlockLocation(null);
        }
    };

    // Column handlers
    const handleColumnUpdate = (parentIndex: number, columnIndex: number, newList: Block[]) => {
        const updated = [...activeTemplate.blocks];
        const parentBlock = updated[parentIndex];
        
        if (parentBlock.type === 'columns') {
            const updatedColumns = [...(parentBlock as ColumnsBlock).columns];
            updatedColumns[columnIndex] = newList.map(normalizeBlock);
            
            // Create new parent block with updated columns
            const newParentBlock: ColumnsBlock = {
                ...(parentBlock as ColumnsBlock),
                columns: updatedColumns,
            };
            updated[parentIndex] = newParentBlock;
            updateBlocks(updated);
        }
    };

    const handleColumnChildUpdate = (
        parentIndex: number, 
        columnIndex: number, 
        childIndex: number, 
        patch: BlockPatch
    ) => {
        const updated = [...activeTemplate.blocks];
        const parentBlock = updated[parentIndex];

        if (parentBlock.type === 'columns') {
            const updatedColumns = [...(parentBlock as ColumnsBlock).columns];
            const updatedColumn = [...updatedColumns[columnIndex]];
            
            // Apply the patch to the specific child
            updatedColumn[childIndex] = {
                ...updatedColumn[childIndex],
                ...patch,
            } as Block;
            
            updatedColumns[columnIndex] = updatedColumn;
            
            // Create new parent block with updated columns
            const newParentBlock: ColumnsBlock = {
                ...(parentBlock as ColumnsBlock),
                columns: updatedColumns,
            };
            
            updated[parentIndex] = newParentBlock;
            updateBlocks(updated);

            // Update openBlock if it's the same block
            if (openBlock?.id === updatedColumn[childIndex].id) {
                setOpenBlock(updatedColumn[childIndex]);
            }
        }
    };

    const handleColumnChildDelete = (
        parentIndex: number, 
        columnIndex: number, 
        childIndex: number
    ) => {
        const updated = [...activeTemplate.blocks];
        const parentBlock = updated[parentIndex];

        if (parentBlock.type === 'columns') {
            const updatedColumns = [...(parentBlock as ColumnsBlock).columns];
            const deletedBlock = updatedColumns[columnIndex][childIndex];
            
            // Remove the child from the column
            updatedColumns[columnIndex] = updatedColumns[columnIndex].filter((_, idx) => idx !== childIndex);
            
            // Create new parent block with updated columns
            const newParentBlock: ColumnsBlock = {
                ...(parentBlock as ColumnsBlock),
                columns: updatedColumns,
            };
            
            updated[parentIndex] = newParentBlock;
            updateBlocks(updated);

            // Clear selection if deleted block was selected
            if (openBlock?.id === deletedBlock.id) {
                setOpenBlock(null);
                setSelectedBlockLocation(null);
            }
        }
    };

    // Fixed: Add all required parameters
    const handleColumnChildSelect = (
        childBlock: Block,
        parentIndex: number,
        columnIndex: number,
        childIndex: number
    ) => {
        setOpenBlock(childBlock);
        setSelectedBlockLocation({
            parentIndex,
            columnIndex,
            childIndex,
        });
    };

    // Fixed: Settings change handler for both regular and column child blocks
    const handleSettingsChange = (key: string, value: any) => {
        // Check if this is a column child block
        if (selectedBlockLocation) {
            const { parentIndex, columnIndex, childIndex } = selectedBlockLocation;
            handleColumnChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value } as any);
        } else {
            // Regular block update (not in a column)
            const index = activeTemplate.blocks.findIndex(
                (field) => field.id === openBlock?.id
            );

            if (index >= 0) {
                // Special handling for layout changes on column blocks
                if (key === 'layout' && activeTemplate.blocks[index].type === 'columns') {
                    const updated = [...activeTemplate.blocks];
                    const parentBlock = updated[index] as ColumnsBlock;

                    const currentColumns = parentBlock.columns || [];
                    const currentLayout = parentBlock.layout || '2-50';
                    const newLayout = value as typeof parentBlock.layout;

                    // Get current and new column counts
                    const currentColCount = getColumnCount(currentLayout);
                    const newColCount = getColumnCount(newLayout);

                    let newColumns: Block[][] = [];

                    if (newColCount > currentColCount) {
                        // Adding columns - preserve existing, add empty ones
                        newColumns = [...currentColumns];
                        for (let i = currentColCount; i < newColCount; i++) {
                            newColumns.push([]);
                        }
                    } else if (newColCount < currentColCount) {
                        // Removing columns - merge extra columns into the last one
                        newColumns = currentColumns.slice(0, newColCount);
                        const extraBlocks = currentColumns.slice(newColCount).flat();
                        if (extraBlocks.length > 0) {
                            newColumns[newColCount - 1] = [
                                ...newColumns[newColCount - 1],
                                ...extraBlocks,
                            ];
                        }
                    } else {
                        // Same number of columns
                        newColumns = currentColumns;
                    }

                    // Create updated column block
                    const updatedBlock: ColumnsBlock = {
                        ...parentBlock,
                        layout: newLayout,
                        columns: newColumns,
                    };
                    
                    updated[index] = updatedBlock;
                    updateBlocks(updated);

                    // Update openBlock with new layout
                    setOpenBlock(updatedBlock);
                } else {
                    // Regular update for non-column blocks or non-layout changes
                    updateBlock(index, { [key]: value } as any);
                }
            }
        }
    };

    return (
        <div className="registration-from-wrapper email-builder">
            {/* LEFT PANEL */}
            <div className="elements-wrapper">
                <div className="tab-titles">
                    <div 
                        className={`title ${activeTab === 'blocks' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('blocks')}
                    >
                        Blocks
                    </div>
                    
                    {/* Conditionally render Templates tab */}
                    {showTemplatesTab && (
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
                                list={EMAIL_BLOCKS}
                                setList={() => { }}
                                sort={false}
                                group={{ name: 'email', pull: 'clone', put: false }}
                                className="section-container open"
                            >
                                {EMAIL_BLOCKS.map((item) => (
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
                                    onClick={() => setActiveTemplateId(tpl.id)}
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

            {/* CENTER CANVAS - Fixed JSX syntax */}
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
                        // Skip rendering if block is undefined
                        if (!block) return null;

                        return (
                            <div className="field-wrapper" key={block.id}>
                                {block.type === 'columns' ? (
                                    <div 
                                        className={`form-field ${openBlock?.id === block.id ? 'active' : ''}`} 
                                        onClick={() => {
                                            setOpenBlock(block);
                                            setSelectedBlockLocation(null);
                                        }}
                                    >
                                        <section className="meta-menu">
                                            <span className="drag-handle admin-badge blue">
                                                <i className="adminfont-drag"></i>
                                            </span>
                                            <span 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    deleteBlock(index); 
                                                }} 
                                                className="admin-badge red"
                                            >
                                                <i className="admin-font adminfont-delete"></i>
                                            </span>
                                        </section>
                                        <section className="form-field-container-wrapper">
                                            <BlockRenderer
                                                block={block as ColumnsBlock}
                                                parentIndex={index}
                                                onSelect={() => {
                                                    setOpenBlock(block);
                                                    setSelectedBlockLocation(null);
                                                }}
                                                onChange={() => { }}
                                                onDelete={() => deleteBlock(index)}
                                                isActive={openBlock?.id === block.id}
                                                showMeta={false}
                                                onUpdateColumn={handleColumnUpdate}
                                                onUpdateChild={handleColumnChildUpdate}
                                                onDeleteChild={handleColumnChildDelete}
                                                onSelectChild={handleColumnChildSelect}
                                                proSettingChange={() => false}
                                                groupName="email"
                                                BasicInput={BasicInput}
                                                MultipleOptions={MultipleOptions}
                                                TextArea={TextArea}
                                                FileInput={FileInput}
                                                AddressField={AddressField}
                                            />
                                        </section>
                                    </div>
                                ) : (
                                    <BlockRenderer
                                        key={block.id}
                                        block={block}
                                        onSelect={() => {
                                            setOpenBlock(block);
                                            setSelectedBlockLocation(null);
                                        }}
                                        onChange={(patch) => updateBlock(index, patch)}
                                        onDelete={() => deleteBlock(index)}
                                        isActive={openBlock?.id === block.id}
                                        BasicInput={BasicInput}
                                        MultipleOptions={MultipleOptions}
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
                                    <h3>{openBlock.type.charAt(0).toUpperCase() + openBlock.type.slice(1)} Settings</h3>
                                </div>
                            </div>
                            <SettingMetaBox
                                formField={openBlock}
                                opened={{ click: true }}
                                onChange={handleSettingsChange}
                                inputTypeList={EMAIL_BLOCKS.map(block => ({ value: block.value, label: block.label }))}
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