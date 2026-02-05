/**
 * RegistrationForm.tsx - PROPERLY FIXED VERSION
 * Issues fixed:
 * 1. Column child blocks can now be edited in settings panel
 * 2. Column layout changes work properly
 */

import React, { useState, useEffect, useRef } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Import from centralized block system
import {
    Block,
    BlockPatch,
    REGISTRATION_BLOCKS,
    STORE_BLOCKS,
    createBlock,
    normalizeBlock,
    BlockRenderer,
    ColumnsBlock,
} from './block';

// Import existing components
import BasicInput from './BasicInput';
import ButtonCustomizer from './ButtonCustomiser';
import Elements from './Elements';
import SettingMetaBox from './SettingMetaBox';
import MultipleOptions from './MultipleOption';
import AddressField from './AddressField';
import TextArea from './TextArea';
import FileInput from './FileInput';

interface ButtonSetting {
    button_text?: string;
    button_style?: string;
    button_color?: string;
    button_background?: string;
}

interface FormSetting {
    formfieldlist?: Block[];
    butttonsetting?: ButtonSetting;
}

interface CustomFormProps {
    onChange: (data: {
        formfieldlist: Block[];
        butttonsetting: ButtonSetting;
    }) => void;
    name: string;
    proSettingChange: () => boolean;
    formTitlePlaceholder?: string;
    setting: Record<string, FormSetting>;
}

export interface RegistrationTemplate {
    id: string;
    name: string;
    formfieldlist: Block[];
}

const CustomForm: React.FC<CustomFormProps> = ({
    onChange,
    name,
    proSettingChange,
    setting,
    formTitlePlaceholder,
}) => {
    const formSetting = setting[name] || {};
    const settingHasChanged = useRef(false);

    const [formFieldList, setFormFieldList] = useState<Block[]>(() => {
        const inputList = formSetting.formfieldlist || [];
        if (!Array.isArray(inputList) || inputList.length <= 0) {
            return [createBlock('title')];
        }
        return inputList;
    });

    const [buttonSetting, setButtonSetting] = useState<ButtonSetting>(
        formSetting.butttonsetting || {}
    );
    const [opendInput, setOpendInput] = useState<Block | null>(null);
    const [activeTab, setActiveTab] = useState<'blocks'>('blocks');

    // Track where the selected block is located (for column child blocks)
    const [selectedBlockLocation, setSelectedBlockLocation] = useState<{
        parentIndex: number;
        columnIndex: number;
        childIndex: number;
    } | null>(null);

    // Trigger onChange when form data changes
    useEffect(() => {
        if (settingHasChanged.current) {
            onChange({
                formfieldlist: formFieldList,
                butttonsetting: buttonSetting,
            });
            settingHasChanged.current = false;
        }
    }, [formFieldList, buttonSetting, onChange]);

    // ==================== Block Management ====================

    const updateBlocks = (blocks: Block[]) => {
        setFormFieldList(blocks);
        settingHasChanged.current = true;
    };

    const updateBlock = (index: number, patch: BlockPatch) => {
        const updated = [...formFieldList];
        updated[index] = { ...updated[index], ...patch } as Block;
        updateBlocks(updated);

        // Update opendInput if it's the same block
        if (opendInput?.id === updated[index].id) {
            setOpendInput(updated[index]);
        }
    };

    const deleteBlock = (index: number) => {
        if (proSettingChange()) {
            return;
        }

        const updatedBlocks = [...formFieldList];
        updatedBlocks.splice(index, 1);
        updateBlocks(updatedBlocks);

        if (opendInput?.id === formFieldList[index].id) {
            setOpendInput(null);
            setSelectedBlockLocation(null);
        }
    };

    // ==================== Column Block Handlers ====================

    const updateColumnBlock = (
        parentIndex: number,
        columnIndex: number,
        childIndex: number,
        patch: BlockPatch
    ) => {
        const updated = [...formFieldList];
        const parentBlock = updated[parentIndex];

        if (parentBlock.type === 'columns') {
            const updatedColumns = [...parentBlock.columns];
            const updatedColumn = [...updatedColumns[columnIndex]];
            updatedColumn[childIndex] = {
                ...updatedColumn[childIndex],
                ...patch,
            } as Block;
            updatedColumns[columnIndex] = updatedColumn;
            parentBlock.columns = updatedColumns;
            updated[parentIndex] = parentBlock;
            updateBlocks(updated);

            // Update opendInput if it's the same block
            if (opendInput?.id === updatedColumn[childIndex].id) {
                setOpendInput(updatedColumn[childIndex]);
            }
        }
    };

    const renderColumnBlock = (block: Block, parentIndex: number) => {
        if (block.type !== 'columns') return null;

        const style = {
            backgroundColor: block.style?.backgroundColor,
            padding: block.style?.padding,
            margin: block.style?.margin,
            borderWidth: block.style?.borderWidth,
            borderColor: block.style?.borderColor,
            borderStyle: block.style?.borderStyle,
            borderRadius: block.style?.borderRadius,
        };

        return (
            <div className={`email-columns layout-${block.layout || '2-50'}`} style={style}>
                {(block.columns || []).map((column, colIndex) => (
                    <div key={colIndex} className="email-column-wrapper">
                        <div className="column-icon">
                            <i className="adminfont-plus"></i>
                        </div>

                        <ReactSortable
                            list={column}
                            setList={(newList) => {
                                if (proSettingChange()) {
                                    return;
                                }
                                const updated = [...formFieldList];
                                const parentBlock = { ...updated[parentIndex] } as any;
                                const updatedColumns = [...(parentBlock.columns || [])];
                                updatedColumns[colIndex] = newList.map(normalizeBlock);
                                parentBlock.columns = updatedColumns;
                                updated[parentIndex] = parentBlock;
                                updateBlocks(updated);
                            }}
                            group={{ name: 'registration', pull: true, put: true }}
                            className="email-column"
                            animation={150}
                            handle=".drag-handle"
                            fallbackOnBody
                            swapThreshold={0.65}
                        >
                            {column.map((childBlock, childIndex) => (
                                <BlockRenderer
                                    key={childBlock.id}
                                    block={childBlock}
                                    onSelect={() => {
                                        setOpendInput(childBlock);
                                        // Store location so settings panel knows this is a column child
                                        setSelectedBlockLocation({
                                            parentIndex,
                                            columnIndex: colIndex,
                                            childIndex,
                                        });
                                    }}
                                    onChange={(patch) =>
                                        updateColumnBlock(parentIndex, colIndex, childIndex, patch)
                                    }
                                    onDelete={() => {
                                        if (proSettingChange()) {
                                            return;
                                        }
                                        const updated = [...formFieldList];
                                        const parentBlock = { ...updated[parentIndex] } as any;
                                        const updatedColumns = [...(parentBlock.columns || [])];
                                        updatedColumns[colIndex].splice(childIndex, 1);
                                        parentBlock.columns = updatedColumns;
                                        updated[parentIndex] = parentBlock;
                                        updateBlocks(updated);
                                        if (opendInput?.id === childBlock.id) {
                                            setOpendInput(null);
                                            setSelectedBlockLocation(null);
                                        }
                                    }}
                                    isActive={opendInput?.id === childBlock.id}
                                    BasicInput={BasicInput}
                                    MultipleOptions={MultipleOptions}
                                    TextArea={TextArea}
                                    FileInput={FileInput}
                                    AddressField={AddressField}
                                />
                            ))}
                        </ReactSortable>
                    </div>
                ))}
            </div>
        );
    };

    // ==================== Template Selection ====================

    const handleTemplateSelect = (template: RegistrationTemplate) => {
        if (proSettingChange()) return;

        const clonedFields: Block[] = structuredClone(template.formfieldlist);
        updateBlocks(clonedFields);
        setOpendInput(null);
        setSelectedBlockLocation(null);
    };

    // ==================== Settings Panel Change Handler ====================

    const handleSettingsChange = (key: string, value: any) => {
        if (proSettingChange()) {
            return;
        }

        // Check if this is a column child block
        if (selectedBlockLocation) {
            const { parentIndex, columnIndex, childIndex } = selectedBlockLocation;

            // Special handling for layout changes on column blocks
            if (key === 'layout') {
                // This is the parent column block itself
                updateBlock(parentIndex, { [key]: value } as any);

                // Update columns array structure based on new layout
                const updated = [...formFieldList];
                const parentBlock = updated[parentIndex] as ColumnsBlock;

                if (parentBlock.type === 'columns') {
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
                        const extraBlocks = currentColumns
                            .slice(newColCount)
                            .flat();
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

                    parentBlock.layout = newLayout;
                    parentBlock.columns = newColumns;
                    updated[parentIndex] = parentBlock;
                    updateBlocks(updated);

                    // Update opendInput with new layout
                    if (opendInput?.id === parentBlock.id) {
                        setOpendInput(parentBlock);
                    }
                }
            } else {
                // Regular column child block update
                updateColumnBlock(parentIndex, columnIndex, childIndex, { [key]: value } as any);
            }
        } else {
            // Regular block update (not in a column)
            const index = formFieldList.findIndex(
                (field) => field.id === opendInput?.id
            );

            if (index >= 0) {
                // Special handling for layout changes on column blocks
                if (key === 'layout' && formFieldList[index].type === 'columns') {
                    const updated = [...formFieldList];
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
                        const extraBlocks = currentColumns
                            .slice(newColCount)
                            .flat();
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

                    parentBlock.layout = newLayout;
                    parentBlock.columns = newColumns;
                    updated[index] = parentBlock;
                    updateBlocks(updated);

                    // Update opendInput with new layout
                    setOpendInput(parentBlock);
                } else {
                    // Regular update
                    updateBlock(index, { [key]: value } as any);
                }
            }
        }
    };

    // Helper function to get column count based on layout
    const getColumnCount = (layout: '1' | '2-50' | '2-66' | '3' | '4'): number => {
        switch (layout) {
            case '1': return 1;
            case '2-50':
            case '2-66': return 2;
            case '3': return 3;
            case '4': return 4;
            default: return 2;
        }
    };

    // ==================== Tabs Configuration ====================

    const tabs = [
  {
    id: 'blocks',
    label: 'Blocks',
    content: (
      <>
        <Elements label="General">
          <ReactSortable
            list={REGISTRATION_BLOCKS}
            setList={() => {}}
            sort={false}
            group={{ name: 'registration', pull: 'clone', put: false }}
          >
            {REGISTRATION_BLOCKS.map((item) => (
              <div key={item.value} className="elements-items">
                <i className={item.icon} />
                <p className="list-title">{item.label}</p>
              </div>
            ))}
          </ReactSortable>
        </Elements>

        <Elements label="Let’s get your store ready!">
          <ReactSortable
            list={STORE_BLOCKS}
            setList={() => {}}
            sort={false}
            group={{ name: 'registration', pull: 'clone', put: false }}
          >
            {STORE_BLOCKS.map((item) => (
              <div
                key={item.value}
                className="elements-items"
                onClick={() => {
                  if (proSettingChange()) return;
                  const newField = createBlock(
                    item.value as any,
                    item.name,
                    true,
                    true
                  );
                  updateBlocks([...formFieldList, newField]);
                  setOpendInput(null);
                  setSelectedBlockLocation(null);
                }}
              >
                <i className={item.icon} />
                <p className="list-title">{item.label}</p>
              </div>
            ))}
          </ReactSortable>
        </Elements>
      </>
    ),
  },
];


    return (
        <div className="registration-from-wrapper">
            {/* LEFT PANEL - Block Selection */}
            <div className="elements-wrapper">
                <div className="tab-titles">
                    <div
                        className={`title ${activeTab === 'blocks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blocks')}
                    >
                        Blocks
                    </div>
                </div>
                <div className="tab-contend">
                    {tabs.map(
                        (tab) =>
                            activeTab === tab.id && (
                                <div key={tab.id} className="tab-panel">
                                    {tab.content}
                                </div>
                            )
                    )}
                </div>
            </div>

            {/* CENTER CANVAS - Form Builder */}
            <div className="registration-form-main-section">
                <ReactSortable
                    list={formFieldList}
                    setList={(newList) => {
                        if (proSettingChange()) {
                            return;
                        }
                        const normalized = newList.map(normalizeBlock);
                        updateBlocks(normalized);
                    }}
                    group={{
                        name: 'registration',
                        pull: true,
                        put: true,
                    }}
                    handle=".drag-handle"
                    animation={150}
                    fallbackOnBody
                    swapThreshold={0.65}
                    className="registration-canvas-sortable"
                >
                    {formFieldList.map((formField, index) => {
                        // Skip title field (index 0)
                        if (index === 0) {
                            return <div key={formField.id} style={{ display: 'none' }}></div>;
                        }

                        return (
                            <div className="field-wrapper" key={formField.id}>
                                {formField.type === 'columns' ? (
                                    <div
                                        className={`form-field ${opendInput?.id === formField.id ? 'active' : ''
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpendInput(formField);
                                            setSelectedBlockLocation(null); // This is a parent column block
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
                                            {renderColumnBlock(formField, index)}
                                        </section>
                                    </div>
                                ) : (
                                    <BlockRenderer
                                        key={formField.id}
                                        block={formField}
                                        onSelect={() => {
                                            setOpendInput(formField);
                                            setSelectedBlockLocation(null); // Regular block, not in column
                                        }}
                                        onChange={(patch) => updateBlock(index, patch)}
                                        onDelete={() => deleteBlock(index)}
                                        isActive={opendInput?.id === formField.id}
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

                {/* Submit Button Customizer */}
                <ButtonCustomizer
                    text={buttonSetting.button_text || 'Submit'}
                    setting={buttonSetting}
                    onChange={(key, value, isRestoreDefaults = false) => {
                        if (proSettingChange()) {
                            return;
                        }
                        settingHasChanged.current = true;
                        const previousSetting = buttonSetting || {};
                        if (isRestoreDefaults) {
                            setButtonSetting(value as ButtonSetting);
                        } else {
                            setButtonSetting({
                                ...previousSetting,
                                [key]: value,
                            });
                        }
                    }}
                />
            </div>

            {/* RIGHT SETTINGS PANEL */}
            <div className="registration-edit-form-wrapper">
                {opendInput && (
                    <div className="registration-edit-form">
                        <SettingMetaBox
                            formField={opendInput}
                            opened={{ click: true }}
                            onChange={handleSettingsChange}
                            inputTypeList={REGISTRATION_BLOCKS.map(b => ({
                                value: b.value,
                                label: b.label,
                            }))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomForm;