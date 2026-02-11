/**
 * RegistrationForm.tsx - CLEAN VERSION
 * Uses ColumnBlockManager for all column operations
 * No template functionality - only single form editing
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
    LeftPanel
} from './block';

import SettingMetaBox from './SettingMetaBox';
import BasicInput from './BasicInput';
import MultipleOptions from './MultipleOption';
import TextArea from './TextArea';
import FileInput from './FileInput';
import AddressField from './AddressField';
import { FieldComponent } from './types';

export interface RegistrationTemplate {
    id: string;
    name: string;
    previewText?: string;
    blocks: Block[];
}

interface RegistrationFormProps {
    // No template props - only single form editing
}

const REGISTRATION_BLOCKS = [
    { id: 'text', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Textbox' },
    { id: 'email', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Email' },
    { id: 'textarea', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Textarea' },
    { id: 'datepicker', icon: 'adminfont-calendar icon-form-store-description', value: 'datepicker', label: 'Date Picker' },
    { id: 'timepicker', icon: 'adminfont-alarm icon-form-address', value: 'TimePicker', label: 'Time Picker' },
    { id: 'richtext', icon: 'adminfont-text icon-form-textarea', value: 'richtext', label: 'Rich Text Block' },
    { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading' },
    { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image' },
    { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button' },
    { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider' },
    { id: 'checkboxes', icon: 'adminfont-checkbox icon-form-checkbox', value: 'checkboxes', label: 'Checkboxes' },
    { id: 'multi-select', icon: 'adminfont-multi-select icon-form-multi-select', value: 'multi-select', label: 'Multi Select' },
    { id: 'radio', icon: 'adminfont-radio icon-form-radio', value: 'radio', label: 'Radio' },
    { id: 'dropdown', icon: 'adminfont-dropdown-checklist icon-form-dropdown', value: 'dropdown', label: 'Dropdown' },
    { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns' },
    { id: 'section', icon: 'adminfont-form-section icon-form-section', value: 'section', label: 'Section' },
    { id: 'recaptcha', icon: 'adminfont-captcha-automatic-code icon-form-recaptcha', value: 'recaptcha', label: 'reCaptcha v3' },
    { id: 'attachment', icon: 'adminfont-submission-message icon-form-attachment', value: 'attachment', label: 'Attachment' },
    { id: 'address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Address' },
];

// Single form with one starting block
const DEFAULT_FORM_BLOCKS: Block[] = [];

export const RegistrationFormUI: React.FC<RegistrationFormProps> = () => {
    // Only manage a single form's blocks
    const [blocks, setBlocks] = useState<Block[]>(DEFAULT_FORM_BLOCKS);
    const [openBlock, setOpenBlock] = useState<Block | null>(null);

    // Block operations
    const updateBlock = (index: number, patch: BlockPatch) => {
        const updated = [...blocks];
        updated[index] = { ...updated[index], ...patch } as Block;
        setBlocks(updated);
        
        if (openBlock?.id === updated[index].id) {
            setOpenBlock(updated[index]);
        }
    };

    const deleteBlock = (index: number) => {
        const deletedBlock = blocks[index];
        const updated = [...blocks];
        updated.splice(index, 1);
        setBlocks(updated);
        
        if (openBlock?.id === deletedBlock.id) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    };

    // Column manager hook
    const columnManager = useColumnManager({
        blocks,
        onBlocksUpdate: setBlocks,
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
            const index = blocks.findIndex((field) => field.id === openBlock?.id);

            if (index >= 0) {
                // Special handling for column layout changes
                if (key === 'layout' && blocks[index].type === 'columns') {
                    columnManager.handleLayoutChange(index, value);
                } else {
                    updateBlock(index, { [key]: value } as any);
                }
            }
        }
    };

    return (
        <div className="registration-from-wrapper registration-builder">
            {/* LEFT PANEL - Only show blocks, no templates */}
            <LeftPanel
                blocks={REGISTRATION_BLOCKS}
                templates={[]} // Empty array to hide templates tab
                activeTemplateId={null}
                onTemplateSelect={() => {}} // No-op
                showTemplatesTab={false}
            />

            {/* CENTER CANVAS */}
            <div className="registration-form-main-section registration-canvas">
                <ReactSortable
                    list={blocks}
                    setList={(newList) => setBlocks(newList.map(normalizeBlock))}
                    group={{ name: 'registration', pull: true, put: true }}
                    handle=".drag-handle"
                    animation={150}
                    fallbackOnBody
                    swapThreshold={0.65}
                    className="registration-canvas-sortable"
                >
                    {blocks.map((block, index) => {
                        if (!block) return null;

                        return (
                            <div className="field-wrapper" key={block.id}>
                                {block.type === 'columns' ? (
                                    <ColumnRenderer
                                        block={block}
                                        parentIndex={index}
                                        blocks={blocks}
                                        isActive={openBlock?.id === block.id}
                                        groupName="registration"
                                        openBlock={openBlock}
                                        setOpenBlock={setOpenBlock}
                                        onBlocksUpdate={setBlocks}
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
                                    <h3>
                                        {openBlock.type.charAt(0).toUpperCase() + openBlock.type.slice(1)} Settings
                                    </h3>
                                </div>
                            </div>
                            <SettingMetaBox
                                formField={openBlock}
                                opened={{ click: true }}
                                onChange={handleSettingsChange}
                                inputTypeList={REGISTRATION_BLOCKS.map(block => ({ 
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

const RegistrationForm: FieldComponent = {
    render: RegistrationFormUI,
    validate: (field, value) => {
        if (field.required && !value?.[field.name]) {
            return `${field.label} is required`;
        }
        return null;
    },
};

export default RegistrationForm;