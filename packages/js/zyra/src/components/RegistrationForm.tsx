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
    getColumnCount,
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

    // Block Management

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

    // Column Block Handlers

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
            
            // Create new parent block with updated columns
            const newParentBlock: ColumnsBlock = {
                ...parentBlock,
                columns: updatedColumns,
            };
            updated[parentIndex] = newParentBlock;
            updateBlocks(updated);

            // Update opendInput if it's the same block
            if (opendInput?.id === updatedColumn[childIndex].id) {
                setOpendInput(updatedColumn[childIndex]);
            }
        }
    };

    const deleteColumnChild = (
        parentIndex: number,
        columnIndex: number,
        childIndex: number
    ) => {
        if (proSettingChange()) {
            return;
        }

        const updated = [...formFieldList];
        const parentBlock = updated[parentIndex];

        if (parentBlock.type === 'columns') {
            const updatedColumns = [...parentBlock.columns];
            const deletedBlock = updatedColumns[columnIndex][childIndex];
            
            // Remove the child from the column
            updatedColumns[columnIndex] = updatedColumns[columnIndex].filter((_, index) => index !== childIndex);
            
            // Create new parent block with updated columns
            const newParentBlock: ColumnsBlock = {
                ...parentBlock,
                columns: updatedColumns,
            };
            updated[parentIndex] = newParentBlock;
            updateBlocks(updated);

            // Clear selection if deleted block was selected
            if (opendInput?.id === deletedBlock.id) {
                setOpendInput(null);
                setSelectedBlockLocation(null);
            }
        }
    };

    const updateColumnLayout = (parentIndex: number, columnIndex: number, newList: Block[]) => {
        if (proSettingChange()) {
            return;
        }

        const updated = [...formFieldList];
        const parentBlock = updated[parentIndex];

        if (parentBlock.type === 'columns') {
            const updatedColumns = [...parentBlock.columns];
            updatedColumns[columnIndex] = newList.map(normalizeBlock);
            
            // Create new parent block with updated columns
            const newParentBlock: ColumnsBlock = {
                ...parentBlock,
                columns: updatedColumns,
            };
            updated[parentIndex] = newParentBlock;
            updateBlocks(updated);
        }
    };

    const handleColumnChildSelect = (
        childBlock: Block,
        parentIndex: number,
        columnIndex: number,
        childIndex: number
    ) => {
        setOpendInput(childBlock);
        setSelectedBlockLocation({
            parentIndex,
            columnIndex,
            childIndex,
        });
    };

    // Template Selection

    const handleTemplateSelect = (template: RegistrationTemplate) => {
        if (proSettingChange()) return;

        const clonedFields: Block[] = structuredClone(template.formfieldlist);
        updateBlocks(clonedFields);
        setOpendInput(null);
        setSelectedBlockLocation(null);
    };

    // Settings Panel Change Handler

    const handleSettingsChange = (key: string, value: any) => {
        if (proSettingChange()) {
            return;
        }

        // Check if this is a column child block
        if (selectedBlockLocation) {
            const { parentIndex, columnIndex, childIndex } = selectedBlockLocation;
            updateColumnBlock(parentIndex, columnIndex, childIndex, { [key]: value } as any);
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

                    // Create updated column block
                    const updatedBlock: ColumnsBlock = {
                        ...parentBlock,
                        layout: newLayout,
                        columns: newColumns,
                    };
                    
                    updated[index] = updatedBlock;
                    updateBlocks(updated);

                    // Update opendInput with new layout
                    setOpendInput(updatedBlock);
                } else {
                    // Regular update for non-column blocks or non-layout changes
                    updateBlock(index, { [key]: value } as any);
                }
            }
        }
    };

    // Dynamic Count Calculation

    const getBlockCount = (blocks: typeof REGISTRATION_BLOCKS | typeof STORE_BLOCKS) => {
        return blocks.length;
    };

    // Tabs Configuration

    const tabs = [
        {
            id: 'blocks',
            label: 'Blocks',
            content: (
                <>
                    <Elements 
                        label="General" 
                        selectOptions={REGISTRATION_BLOCKS}
                        onClick={(value) => {
                            if (proSettingChange()) return;
                            const newField = createBlock(value as any);
                            updateBlocks([...formFieldList, newField]);
                            setOpendInput(null);
                            setSelectedBlockLocation(null);
                        }}
                    >
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

                    <Elements 
                        label="Let's get your store ready!" 
                        selectOptions={STORE_BLOCKS}
                        onClick={(value) => {
                            if (proSettingChange()) return;
                            const storeBlock = STORE_BLOCKS.find(block => block.value === value);
                            if (storeBlock) {
                                const newField = createBlock(
                                    storeBlock.value as any,
                                    storeBlock.name,
                                    true,
                                    true
                                );
                                updateBlocks([...formFieldList, newField]);
                                setOpendInput(null);
                                setSelectedBlockLocation(null);
                            }
                        }}
                    >
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
                                        className={`form-field ${opendInput?.id === formField.id ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpendInput(formField);
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
                                                block={formField as ColumnsBlock}
                                                parentIndex={index}
                                                onSelect={() => {
                                                    setOpendInput(formField);
                                                    setSelectedBlockLocation(null);
                                                }}
                                                onChange={() => { }}
                                                onDelete={() => deleteBlock(index)}
                                                isActive={opendInput?.id === formField.id}
                                                showMeta={false}
                                                onUpdateColumn={updateColumnLayout}
                                                onUpdateChild={updateColumnBlock}
                                                onDeleteChild={deleteColumnChild}
                                                onSelectChild={handleColumnChildSelect}
                                                proSettingChange={() => proSettingChange()}
                                                groupName="registration"
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
                            inputTypeList={REGISTRATION_BLOCKS.map(block => ({
                                value: block.value,
                                label: block.label,
                            }))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomForm;