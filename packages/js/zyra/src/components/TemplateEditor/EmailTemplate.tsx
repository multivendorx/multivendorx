/**
 * EmailTemplate.tsx - OPTIMIZED VERSION
 * Uses unified ColumnRenderer - ZERO duplicate code
 */

import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import '../../styles/web/Emailtemplate.scss';

import {
    Block,
    BlockPatch,
    EMAIL_BLOCKS,
    createBlock,
    normalizeBlock,
    BlockRenderer,
    ColumnRenderer,
} from '../block';

import SettingMetaBox from '../SettingMetaBox';

export interface EmailTemplate {
    id: string;
    name: string;
    previewText?: string;
    blocks: Block[];
}

interface EmailTemplateProps {
    /** Array of email templates to display in the templates tab */
    templates?: EmailTemplate[];
    /** ID of the initially active template (optional) */
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

const EmailTemplate: React.FC<EmailTemplateProps> = ({
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
        }
    };

    // Column handlers
    const handleColumnUpdate = (parentIndex: number, columnIndex: number, newList: Block[]) => {
        const updated = [...activeTemplate.blocks];
        const parentBlock = updated[parentIndex];
        if (parentBlock.type === 'columns') {
            const updatedColumns = [...parentBlock.columns];
            updatedColumns[columnIndex] = newList;
            parentBlock.columns = updatedColumns;
            updated[parentIndex] = parentBlock;
            updateBlocks(updated);
        }
    };

    const handleColumnChildUpdate = (parentIndex: number, columnIndex: number, childIndex: number, patch: BlockPatch) => {
        const updated = [...activeTemplate.blocks];
        const parentBlock = updated[parentIndex];
        if (parentBlock.type === 'columns') {
            const updatedColumns = [...parentBlock.columns];
            updatedColumns[columnIndex][childIndex] = {
                ...updatedColumns[columnIndex][childIndex],
                ...patch,
            } as Block;
            parentBlock.columns = updatedColumns;
            updated[parentIndex] = parentBlock;
            updateBlocks(updated);
            if (openBlock?.id === updatedColumns[columnIndex][childIndex].id) {
                setOpenBlock(updatedColumns[columnIndex][childIndex]);
            }
        }
    };

    const handleColumnChildDelete = (parentIndex: number, columnIndex: number, childIndex: number) => {
        const updated = [...activeTemplate.blocks];
        const parentBlock = updated[parentIndex];
        if (parentBlock.type === 'columns') {
            const updatedColumns = [...parentBlock.columns];
            const deletedBlock = updatedColumns[columnIndex][childIndex];
            updatedColumns[columnIndex].splice(childIndex, 1);
            parentBlock.columns = updatedColumns;
            updated[parentIndex] = parentBlock;
            updateBlocks(updated);
            if (openBlock?.id === deletedBlock.id) {
                setOpenBlock(null);
            }
        }
    };

    const handleColumnChildSelect = (childBlock: Block) => {
        setOpenBlock(childBlock);
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
                    {activeTemplate.blocks.map((block, index) => (
                        <div className="field-wrapper" key={block.id}>
                            {block.type === 'columns' ? (
                                <div className={`form-field ${openBlock?.id === block.id ? 'active' : ''}`} onClick={() => setOpenBlock(block)}>
                                    <section className="meta-menu">
                                        <span className="drag-handle admin-badge blue">
                                            <i className="adminfont-drag"></i>
                                        </span>
                                        <span onClick={(e) => { e.stopPropagation(); deleteBlock(index); }} className="admin-badge red">
                                            <i className="admin-font adminfont-delete"></i>
                                        </span>
                                    </section>
                                    <section className="form-field-container-wrapper">
                                        <ColumnRenderer
                                            block={block}
                                            parentIndex={index}
                                            openBlock={openBlock}
                                            onSelectChild={handleColumnChildSelect}
                                            onUpdateColumn={handleColumnUpdate}
                                            onUpdateChild={handleColumnChildUpdate}
                                            onDeleteChild={handleColumnChildDelete}
                                            groupName="email"
                                        />
                                    </section>
                                </div>
                            ) : (
                                <BlockRenderer
                                    block={block}
                                    onSelect={() => setOpenBlock(block)}
                                    onChange={(patch) => updateBlock(index, patch)}
                                    onDelete={() => deleteBlock(index)}
                                    isActive={openBlock?.id === block.id}
                                />
                            )}
                        </div>
                    ))}
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
                                onChange={(key, value) => {
                                    const index = activeTemplate.blocks.findIndex((b) => b.id === openBlock.id);
                                    if (index >= 0) {
                                        updateBlock(index, { [key]: value } as any);
                                    } else {
                                        // It's a column child - find and update it
                                        activeTemplate.blocks.forEach((b, pIdx) => {
                                            if (b.type === 'columns') {
                                                b.columns.forEach((col, cIdx) => {
                                                    const chIdx = col.findIndex((ch) => ch.id === openBlock.id);
                                                    if (chIdx >= 0) {
                                                        handleColumnChildUpdate(pIdx, cIdx, chIdx, { [key]: value } as any);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }}
                                inputTypeList={EMAIL_BLOCKS.map(b => ({ value: b.value, label: b.label }))}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailTemplate;