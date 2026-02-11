/**
 * RegistrationForm.tsx - OPTIMIZED CLEAN VERSION
 * Simplified with custom hooks and extracted logic
 */

import React, { useState, useEffect } from 'react';
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

// Custom hooks
const useFormData = (initialData: any) => {
    const [blocks, setBlocks] = useState<Block[]>(() => {
        const formData = initialData || {};
        const initialBlocks = formData.formfieldlist || [];
        return Array.isArray(initialBlocks) ? initialBlocks : [];
    });

    const [buttonSetting, setButtonSetting] = useState(() => {
        const formData = initialData || {};
        return formData.butttonsetting || {};
    });

    return { blocks, setBlocks, buttonSetting, setButtonSetting };
};

const useAutoSave = (blocks: Block[], buttonSetting: any, onChange: (value: any) => void) => {
    useEffect(() => {
        const saveData = () => {
            const newValue = {
                formfieldlist: blocks,
                butttonsetting: buttonSetting,
            };
            onChange(newValue);
        };

        // Debounce save to prevent too many calls
        const timeoutId = setTimeout(saveData, 300);
        return () => clearTimeout(timeoutId);
    }, [blocks, buttonSetting, onChange]);
};

// Constants
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

// Helper functions
const createNewBlock = (blockType: string, label?: string, isReadOnly: boolean = false, isRequired: boolean = false): Block => {
    const baseBlock = {
        id: `${blockType}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        type: blockType as any,
        label: label || blockType.charAt(0).toUpperCase() + blockType.slice(1),
        name: blockType.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        placeholder: `Enter ${label || blockType}`,
        readOnly: isReadOnly,
        required: isRequired,
        value: '',
    };

    // Type-specific properties
    const typeSpecificProps = {
        columns: { columns: [[], []], layout: '2-50' },
        checkboxes: { options: [{ value: 'option1', label: 'Option 1' }] },
        radio: { options: [{ value: 'option1', label: 'Option 1' }] },
        'multi-select': { options: [{ value: 'option1', label: 'Option 1' }] },
        dropdown: { options: [{ value: 'option1', label: 'Option 1' }] },
    };

    return { ...baseBlock, ...(typeSpecificProps[blockType as keyof typeof typeSpecificProps] || {}) } as Block;
};

// Main component
export const RegistrationFormUI: React.FC<RegistrationFormProps> = ({
    field,
    value,
    onChange,
    proSettingChange = () => false,
    name = field?.key || 'registration-form',
    setting = {},
}) => {
    const { blocks, setBlocks, buttonSetting, setButtonSetting } = useFormData(value || setting[name]);
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    
    useAutoSave(blocks, buttonSetting, onChange);

    // Column manager
    const columnManager = useColumnManager({
        blocks,
        onBlocksUpdate: setBlocks,
        openBlock,
        setOpenBlock,
        proSettingChange,
    });

    // Block operations
    const handleBlockOperation = (operation: () => void) => {
        if (!proSettingChange()) {
            operation();
        }
    };

    const updateBlock = (index: number, patch: BlockPatch) => {
        handleBlockOperation(() => {
            setBlocks(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], ...patch } as Block;
                
                if (openBlock?.id === updated[index].id) {
                    setOpenBlock(updated[index]);
                }
                
                return updated;
            });
        });
    };

    const deleteBlock = (index: number) => {
        handleBlockOperation(() => {
            const deletedBlock = blocks[index];
            setBlocks(prev => prev.filter((_, i) => i !== index));
            
            if (openBlock?.id === deletedBlock.id) {
                setOpenBlock(null);
                columnManager.clearSelection();
            }
        });
    };

    const addBlock = (blockType: string, label?: string) => {
        handleBlockOperation(() => {
            const newBlock = createNewBlock(blockType, label);
            setBlocks(prev => [...prev, newBlock]);
            setOpenBlock(newBlock);
            columnManager.clearSelection();
        });
    };

    const reorderBlocks = (newList: Block[]) => {
        handleBlockOperation(() => {
            setBlocks(newList.map(normalizeBlock));
        });
    };

    // Settings handler
    const handleSettingsChange = (key: string, value: any) => {
        if (proSettingChange()) return;

        if (columnManager.selectedBlockLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedBlockLocation;
            columnManager.handleColumnChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value } as any);
        } else {
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

    // Button setting handler
    const updateButtonSetting = (updates: Partial<ButtonSetting>) => {
        handleBlockOperation(() => {
            setButtonSetting(prev => ({ ...prev, ...updates }));
        });
    };

    return (
        <div className="registration-from-wrapper registration-builder">
            {/* Left Panel */}
            <LeftPanel
                blocks={REGISTRATION_BLOCKS}
                templates={[]}
                activeTemplateId={null}
                onTemplateSelect={() => {}}
                showTemplatesTab={false}
                onBlockSelect={addBlock}
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
                        block && (
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
                                        proSettingChange={proSettingChange}
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
                                        MultipleOptions={MultipleOptions}
                                        TextArea={TextArea}
                                        FileInput={FileInput}
                                        AddressField={AddressField}
                                    />
                                )}
                            </div>
                        )
                    ))}
                </ReactSortable>
            </div>

            {/* Right Settings Panel */}
            {openBlock && (
                <div className="registration-edit-form-wrapper">
                    <div className="registration-edit-form">
                        <SettingsPanel
                            block={openBlock}
                            onChange={handleSettingsChange}
                            blocks={REGISTRATION_BLOCKS}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};



// Extracted Settings Panel Component
const SettingsPanel: React.FC<{
    block: Block;
    onChange: (key: string, value: any) => void;
    blocks: Array<{ value: string; label: string }>;
}> = ({ block, onChange, blocks }) => (
    <div className="meta-setting-modal-content">
        <div className="block-type-header">
            <div className="block-type-title">
                <h3>
                    {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Settings
                </h3>
            </div>
        </div>
        <SettingMetaBox
            formField={block}
            opened={{ click: true }}
            onChange={onChange}
            inputTypeList={blocks.map(b => ({ 
                value: b.value, 
                label: b.label 
            }))}
        />
    </div>
);

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

// Type definitions (kept at bottom for clarity)
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

interface ButtonSetting {
    button_text?: string;
    button_style?: string;
    button_color?: string;
    button_background?: string;
}