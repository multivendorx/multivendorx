/**
 * RegistrationForm.tsx - FIXED VERSION with proper auto-save
 */

import React, { useState, useEffect, useRef } from 'react';
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
import TextArea from './TextArea';
import FileInput from './FileInput';
import AddressField from './AddressField';
import { FieldComponent } from './types';
import '../styles/web/RegistrationForm.scss';

// Types
interface RegistrationFormProps {
    field: any;
    value: any;
    onChange: (value: any) => void;
    canAccess: boolean;
    appLocalizer: any;
    setting?: Record<string, any>;
    name?: string;
    proSettingChange?: () => boolean;
}

interface FormData {
    formfieldlist?: Block[];
}

// Custom hook to track changes
const useFormState = (initialData: FormData) => {
    const [blocks, setBlocks] = useState<Block[]>(() => 
        Array.isArray(initialData.formfieldlist) ? initialData.formfieldlist : []
    );
    
    const [buttonSetting, setButtonSetting] = useState<ButtonSetting>(
        initialData.butttonsetting || {}
    );

    return { blocks, setBlocks, buttonSetting, setButtonSetting };
};

const STORE_BLOCKS = [
    { id: 'store-name', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Store Name', },
    { id: 'store-description', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Store Desc', },
    { id: 'store-phone', icon: 'adminfont-form-phone icon-form-textbox', value: 'text', label: 'Store Phone', },
    { id: 'store-paypal', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Store Paypal Email', },
    { id: 'store-address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Store Address', },
];
const REGISTRATION_BLOCKS = [
    { id: 'text', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Textbox', category: 'basic' },
    { id: 'email', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Email', category: 'basic' },
    { id: 'textarea', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Textarea', category: 'basic' },
    { id: 'datepicker', icon: 'adminfont-calendar icon-form-store-description', value: 'datepicker', label: 'Date Picker', category: 'basic' },
    { id: 'timepicker', icon: 'adminfont-alarm icon-form-address', value: 'TimePicker', label: 'Time Picker', category: 'basic' },
    { id: 'richtext', icon: 'adminfont-text icon-form-textarea', value: 'richtext', label: 'Rich Text Block', category: 'advanced' },
    { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading', category: 'advanced' },
    { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image', category: 'advanced' },
    { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button', category: 'advanced' },
    { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider', category: 'advanced' },
    { id: 'checkboxes', icon: 'adminfont-checkbox icon-form-checkboxes', value: 'checkboxes', label: 'Checkboxes', category: 'basic' },
    { id: 'multi-select', icon: 'adminfont-multi-select icon-form-multi-select', value: 'multi-select', label: 'Multi Select', },
    { id: 'radio', icon: 'adminfont-radio icon-form-radio', value: 'radio', label: 'Radio', category: 'basic' },
    { id: 'dropdown', icon: 'adminfont-dropdown-checklist icon-form-dropdown', value: 'dropdown', label: 'Dropdown', category: 'basic' },
    { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns', category: 'layout' },
    { id: 'section', icon: 'adminfont-form-section icon-form-section', value: 'section', label: 'Section', category: 'layout' },
    { id: 'recaptcha', icon: 'adminfont-captcha-automatic-code icon-form-recaptcha', value: 'recaptcha', label: 'reCaptcha v3', category: 'advanced' },
    { id: 'attachment', icon: 'adminfont-submission-message icon-form-attachment', value: 'attachment', label: 'Attachment', category: 'advanced' },
    { id: 'address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Address', category: 'advanced' },
];

// Main Component
export const RegistrationFormUI: React.FC<RegistrationFormProps> = ({
    field,
    value,
    onChange,
    proSettingChange = () => false,
    name = field?.key || 'registration-form',
    setting = {},
}) => {
    // Parse initial data
    const initialData: FormData = value || setting[name] || {};
    
    // State with change tracking
    const { blocks, setBlocks, buttonSetting, setButtonSetting } = useFormState(initialData);
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    
    // Track changes for auto-save
    const blocksRef = useRef(blocks);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    // Update refs when state changes
    useEffect(() => {
        blocksRef.current = blocks;
    }, [blocks]);

    // Auto-save effect
    useEffect(() => {
        // Clear any pending save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Schedule save
        saveTimeoutRef.current = setTimeout(() => {
            const formData: FormData = {
                formfieldlist: blocksRef.current,
            };
            onChange(formData);
        }, 300);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [blocks, onChange]);

    // Block operations - all trigger auto-save via state changes
    const updateBlock = (index: number, patch: BlockPatch) => {
        if (proSettingChange()) return;

        setBlocks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...patch } as Block;
            
            if (openBlock?.id === updated[index].id) {
                setOpenBlock(updated[index]);
            }
            
            return updated;
        });
    };

    const deleteBlock = (index: number) => {
        if (proSettingChange()) return;

        const deletedBlock = blocks[index];
        setBlocks(prev => prev.filter((_, i) => i !== index));
        
        if (openBlock?.id === deletedBlock.id) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    };


    const reorderBlocks = (newList: Block[]) => {
        if (proSettingChange()) return;
        setBlocks(newList.map(normalizeBlock));
    };

    // Column manager hook
    const columnManager = useColumnManager({
        blocks,
        onBlocksUpdate: setBlocks,
        openBlock,
        setOpenBlock,
    });

    // Settings handler
    const handleSettingsChange = (key: string, value: any) => {
        if (proSettingChange()) return;

        // Handle column child updates
        if (columnManager.selectedBlockLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedBlockLocation;
            columnManager.handleColumnChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value } as any);
        } else {
            // Handle regular block or column parent updates
            const index = blocks.findIndex(field => field.id === openBlock?.id);
            if (index >= 0) {
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
            {/* Left Panel */}
            <LeftPanel
                blocks={[
                    ...REGISTRATION_BLOCKS,
                    ...STORE_BLOCKS.map(block => ({
                        ...block,
                        group: 'store-blocks'
                    }))
                ]}
            />

            {/* Center Canvas */}
            <div className="registration-form-main-section registration-canvas">
                <ReactSortable
                    list={blocks}
                    setList={reorderBlocks}
                    group={{ name: 'registration', pull: true, put: true }}
                    handle=".drag-handle"
                    animation={150}
                    fallbackOnBody
                    swapThreshold={0.65}
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
                                    onBlocksUpdate={setBlocks} // Pass setBlocks directly
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
                                    BasicInput={BasicInput}
                                    TextArea={TextArea}
                                    FileInput={FileInput}
                                    AddressField={AddressField}
                                />
                            )}
                        </div>
                    ))}
                </ReactSortable>
            </div>

            {/* Right Settings Panel */}
            {openBlock && (
                <div className="registration-edit-form-wrapper">
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
                </div>
            )}
        </div>
    );
};

const RegistrationForm: FieldComponent = {
    render: RegistrationFormUI,
    validate: (field, value) => {
        if (field.required && !value?.formfieldlist) {
            return `${field.label} is required`;
        }
        return null;
    },
};

export default RegistrationForm;