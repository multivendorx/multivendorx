import React, { useState, useEffect, useRef } from 'react';
import { ReactSortable } from 'react-sortablejs';
import {
    Block, BlockPatch, BlockType, BlockRenderer, ColumnRenderer,
    useColumnManager, LeftPanel
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

let idCounter = Date.now();
const generateId = () => ++idCounter;

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

const createBlock = (type: BlockType, fixedName?: string, placeholder?: string, label?: string): Block => {
    const id = generateId();
    const block: any = { id, type, name: fixedName ?? `${type}-${id.toString(36)}`, label: label ?? type.charAt(0).toUpperCase() + type.slice(1) };
    if (placeholder) block.placeholder = placeholder;
    
    if (type === 'columns') { block.columns = [[], []]; block.layout = '2-50'; }
    else if (type === 'heading') { block.text = placeholder || 'Heading Text'; block.level = 2; }
    else if (type === 'richtext') block.html = placeholder || '<p>This is a demo text</p>';
    else if (type === 'button') { block.text = placeholder || 'Click me'; block.url = '#'; }
    
    return block as Block;
};

const findBlockConfig = (blockId: string) => 
    EMAIL_BLOCK_GROUPS[0].blocks.find(b => b.id === blockId);

export const EmailTemplateUI: React.FC<EmailTemplateProps> = ({
    field, value, onChange, proSettingChange = () => false,
    name = field?.key || 'email-template', setting = {},
}) => {
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
    const saveTimeoutRef = useRef<NodeJS.Timeout>();
    const activeTemplate = templates.find(t => t.id === activeTemplateId);

    useEffect(() => {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => onChange({ templates, activeTemplateId }), 300);
        return () => clearTimeout(saveTimeoutRef.current);
    }, [templates, activeTemplateId, onChange]);

    const columnManager = useColumnManager({
        blocks: activeTemplate?.blocks || [],
        onBlocksUpdate: (blocks) => setTemplates(prev => 
            prev.map(t => t.id === activeTemplateId ? { ...t, blocks } : t)
        ),
        openBlock, setOpenBlock,
    });

    const updateBlocks = (blocks: Block[]) => setTemplates(prev => 
        prev.map(t => t.id === activeTemplateId ? { ...t, blocks } : t)
    );

    const updateBlock = (index: number, patch: BlockPatch) => {
        if (proSettingChange() || !activeTemplate) return;
        const updated = [...activeTemplate.blocks];
        updated[index] = { ...updated[index], ...patch } as Block;
        updateBlocks(updated);
        if (openBlock?.id === updated[index].id) setOpenBlock(updated[index]);
    };

    const deleteBlock = (index: number) => {
        if (proSettingChange() || !activeTemplate) return;
        updateBlocks(activeTemplate.blocks.filter((_, i) => i !== index));
        if (openBlock?.id === activeTemplate.blocks[index].id) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    };

    const handleSetList = (newList: any[]) => {
        if (proSettingChange()) return;
        updateBlocks(newList.map(item => 
            item.id && item.type ? item : createBlock(
                item.value, findBlockConfig(item.id)?.fixedName,
                findBlockConfig(item.id)?.placeholder, findBlockConfig(item.id)?.label
            )
        ));
    };

    const handleSettingsChange = (key: string, value: any) => {
        if (proSettingChange() || !activeTemplate) return;
        
        if (columnManager.selectedLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedLocation;
            columnManager.handleChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value });
            return;
        }

        const index = activeTemplate.blocks.findIndex(b => b.id === openBlock?.id);
        if (index >= 0) {
            if (key === 'layout' && activeTemplate.blocks[index].type === 'columns') {
                columnManager.handleLayoutChange(index, value);
            } else {
                updateBlock(index, { [key]: value });
            }
        }
    };

    if (!activeTemplate) return <div className="email-template-error"><p>No active template found</p></div>;

    return (
        <div className="registration-from-wrapper email-builder">
            <LeftPanel
                blockGroups={EMAIL_BLOCK_GROUPS}
                templates={templates}
                activeTemplateId={activeTemplateId}
                onTemplateSelect={(id) => { setActiveTemplateId(id); setOpenBlock(null); columnManager.clearSelection(); }}
                groupName="email" showTemplatesTab visibleGroups={['email']} collapsible
            />

            <div className="registration-form-main-section email-canvas">
                <ReactSortable
                    list={activeTemplate.blocks} setList={handleSetList}
                    group={{ name: 'email', pull: true, put: true }} handle=".drag-handle"
                    animation={150} fallbackOnBody swapThreshold={0.65} className="email-canvas-sortable"
                >
                    {activeTemplate.blocks.map((block, index) => (
                        <div className="field-wrapper" key={block.id}>
                            {block.type === 'columns' ? (
                                <ColumnRenderer
                                    block={block} parentIndex={index} blocks={activeTemplate.blocks}
                                    isActive={openBlock?.id === block.id} groupName="email"
                                    openBlock={openBlock} setOpenBlock={setOpenBlock}
                                    onBlocksUpdate={updateBlocks}
                                    onSelect={() => { setOpenBlock(block); columnManager.clearSelection(); }}
                                    onDelete={() => deleteBlock(index)}
                                />
                            ) : (
                                <BlockRenderer
                                    block={block} onSelect={() => { setOpenBlock(block); columnManager.clearSelection(); }}
                                    onChange={(patch) => updateBlock(index, patch)}
                                    onDelete={() => deleteBlock(index)} isActive={openBlock?.id === block.id}
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
                                formField={openBlock} opened={{ click: true }} onChange={handleSettingsChange}
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