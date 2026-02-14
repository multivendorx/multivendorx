// External Dependencies
import React, { useState, useEffect, useRef } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import {
    Block,
    BlockPatch,
    BlockType,
    BlockRenderer,
    ColumnRenderer,
    useColumnManager,
    LeftPanel,
    createBlock
} from './block';

import SettingMetaBox from './SettingMetaBox';
import { FieldComponent } from './types';
import '../styles/web/RegistrationForm.scss';

// BLOCK GROUPS - WITH PLACEHOLDERS
const BLOCK_GROUPS = [
    {
        id: 'registration',
        label: 'Registration Fields',
        icon: 'adminfont-user',
        blocks: [
            { id: 'text', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Textbox', placeholder: 'Enter your text here' },
            { id: 'email', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Email', placeholder: 'Enter your email here' },
            { id: 'textarea', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Textarea', placeholder: 'Enter your message here' },
            { id: 'datepicker', icon: 'adminfont-calendar icon-form-store-description', value: 'datepicker', label: 'Date Picker', placeholder: 'Select a date' },
            { id: 'timepicker', icon: 'adminfont-alarm icon-form-address', value: 'TimePicker', label: 'Time Picker', placeholder: 'Select a time' },
            { id: 'checkboxes', icon: 'adminfont-checkbox icon-form-checkboxes', value: 'checkboxes', label: 'Checkboxes' },
            { id: 'multi-select', icon: 'adminfont-multi-select icon-form-multi-select', value: 'multi-select', label: 'Multi Select' },
            { id: 'radio', icon: 'adminfont-radio icon-form-radio', value: 'radio', label: 'Radio' },
            { id: 'dropdown', icon: 'adminfont-dropdown-checklist icon-form-dropdown', value: 'dropdown', label: 'Dropdown' },
            { id: 'address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Address' },
            { id: 'attachment', icon: 'adminfont-submission-message icon-form-attachment', value: 'attachment', label: 'Attachment' },
            { id: 'richtext', icon: 'adminfont-text icon-form-textarea', value: 'richtext', label: 'Rich Text Block' },
            { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading' },
            { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image' },
            { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button', placeholder: 'Click me' },
            { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider' },
            { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns' },
            { id: 'section', icon: 'adminfont-form-section icon-form-section', value: 'section', label: 'Section' },
            { id: 'recaptcha', icon: 'adminfont-captcha-automatic-code icon-form-recaptcha', value: 'recaptcha', label: 'reCaptcha v3' },
        ]
    },
    {
        id: 'store',
        label: 'Store Fields',
        icon: 'adminfont-store',
        blocks: [
            { id: 'store-name', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Store Name', fixedName: 'name', placeholder: 'Enter your store name' },
            { id: 'store-description', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Store Desc', fixedName: 'description', placeholder: 'Enter your store description' },
            { id: 'store-phone', icon: 'adminfont-form-phone icon-form-textbox', value: 'text', label: 'Store Phone', fixedName: 'phone', placeholder: 'Enter your store phone' },
            { id: 'store-paypal', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Store Paypal Email', fixedName: 'paypal_email', placeholder: 'Enter your PayPal email' },
            { id: 'store-address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Store Address', fixedName: 'address' },
        ]
    }
];

// MAIN COMPONENT
export const RegistrationFormUI: React.FC<any> = ({
    value,
    onChange,
    proSettingChange = () => false,
    field,
    setting = {},
    name = field?.key || 'registration-form',
}) => {
    // Track if changes have been made
    const settingHasChanged = useRef(false);
    
    // State
    const [blocks, setBlocks] = useState<Block[]>(() => 
        Array.isArray(value?.formfieldlist) ? value.formfieldlist : 
        Array.isArray(setting[name]?.formfieldlist) ? setting[name].formfieldlist : []
    );
    
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    const visibleGroups = field?.visibleGroups || ['registration'];

    // Trigger onChange when blocks change (if changes were made)
    useEffect(() => {
        if (settingHasChanged.current) {
            onChange({ formfieldlist: blocks });
            settingHasChanged.current = false;
        }
    }, [blocks, onChange]);

    // Column manager
    const columnManager = useColumnManager({
        blocks,
        onBlocksUpdate: setBlocks,
        openBlock,
        setOpenBlock,
    });

    // Helper to mark that changes have been made
    const markChanged = () => {
        settingHasChanged.current = true;
    };

    // Block operations
    const updateBlock = (index: number, patch: BlockPatch) => {
        if (proSettingChange()) return;
        setBlocks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...patch } as Block;
            if (openBlock?.id === updated[index].id) setOpenBlock(updated[index]);
            markChanged();
            return updated;
        });
    };

    const deleteBlock = (index: number) => {
        if (proSettingChange()) return;
        const deletedBlock = blocks[index];
        setBlocks(prev => {
            const filtered = prev.filter((_, i) => i !== index);
            markChanged();
            return filtered;
        });
        if (openBlock?.id === deletedBlock.id) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    };

    // Handle drops with placeholder
    const handleSetList = (newList: any[]) => {
        if (proSettingChange()) return;
        
        const processedList = newList.map(item => 
            createBlock(item, 'registration')
        );
        
        setBlocks(processedList);
        markChanged();
    };

    // Settings handler
    const handleSettingsChange = (key: string, value: any) => {
        if (proSettingChange()) return;
        
        if (columnManager.selectedBlockLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedBlockLocation;
            columnManager.handleColumnChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value });
            markChanged(); // Mark changed after column child update
        } else {
            const index = blocks.findIndex(b => b.id === openBlock?.id);
            if (index >= 0) {
                if (key === 'layout' && blocks[index].type === 'columns') {
                    columnManager.handleLayoutChange(index, value);
                    markChanged(); // Mark changed after layout change
                } else {
                    updateBlock(index, { [key]: value }); // updateBlock already calls markChanged
                }
            }
        }
    };

    return (
        <div className="registration-from-wrapper registration-builder">
            <LeftPanel
                blockGroups={BLOCK_GROUPS}
                visibleGroups={visibleGroups}
                groupName="registration"
            />

            <div className="registration-form-main-section registration-canvas">
                <ReactSortable
                    list={blocks}
                    setList={handleSetList}
                    group={{ name: 'registration', pull: true, put: true }}
                    handle=".drag-handle"
                    animation={150}
                    className="registration-canvas-sortable"
                >
                    {blocks.map((block, index) => (
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
                                    onBlocksUpdate={(updatedBlocks) => {
                                        setBlocks(updatedBlocks);
                                        markChanged();
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
                                        // updateBlock already calls markChanged
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
                    <SettingMetaBox
                        formField={openBlock}
                        opened={{ click: true }}
                        onChange={handleSettingsChange}
                        inputTypeList={BLOCK_GROUPS[0].blocks.map(b => ({ value: b.value, label: b.label }))}
                    />
                </div>
            )}
        </div>
    );
};

const RegistrationForm: FieldComponent = {
    render: RegistrationFormUI,
};

export default RegistrationForm;