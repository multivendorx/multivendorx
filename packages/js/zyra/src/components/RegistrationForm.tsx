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

import ButtonCustomizer from './ButtonCustomiser';
import Elements from './Elements';
import SettingMetaBox from './SettingMetaBox';
import { FieldComponent } from './types';

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
    canAccess: boolean;
    formTitlePlaceholder?: string;
    setting: Record<string, FormSetting>;
}

export interface RegistrationTemplate {
    id: string;
    name: string;
    formfieldlist: Block[];
}

const CustomFormUI: React.FC<CustomFormProps> = ({
    field,
    value,
    onChange,
    canAccess,
    appLocalizer,
}) => {
    const settingHasChanged = useRef(false);

    // Extract form data from the value
    const formData = value?.[field.key] || {};
    
    const [formFieldList, setFormFieldList] = useState<Block[]>(() => {
        const inputList = formData.formfieldlist || [];
        if (!Array.isArray(inputList) || inputList.length <= 0) {
            return [createBlock('title')];
        }
        return inputList;
    });

    const [buttonSetting, setButtonSetting] = useState<ButtonSetting>(
        formData.butttonsetting || {}
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
        if (settingHasChanged.current && canAccess) {
            const newValue = {
                ...value,
                [field.key]: {
                    formfieldlist: formFieldList,
                    butttonsetting: buttonSetting,
                }
            };
            onChange(newValue);
            settingHasChanged.current = false;
        }
    }, [formFieldList, buttonSetting, onChange, field.key, value, canAccess]);

    // Block Management
    const updateBlocks = (blocks: Block[]) => {
        if (!canAccess) return;
        setFormFieldList(blocks);
        settingHasChanged.current = true;
    };

    const updateBlock = (index: number, patch: BlockPatch) => {
        if (!canAccess) return;
        const updated = [...formFieldList];
        updated[index] = { ...updated[index], ...patch } as Block;
        updateBlocks(updated);

        // Update opendInput if it's the same block
        if (opendInput?.id === updated[index].id) {
            setOpendInput(updated[index]);
        }
    };

    const deleteBlock = (index: number) => {
        if (!canAccess) return;

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
        if (!canAccess) return;
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
            
            const newParentBlock: ColumnsBlock = {
                ...parentBlock,
                columns: updatedColumns,
            };
            updated[parentIndex] = newParentBlock;
            updateBlocks(updated);

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
        if (!canAccess) return;

        const updated = [...formFieldList];
        const parentBlock = updated[parentIndex];

        if (parentBlock.type === 'columns') {
            const updatedColumns = [...parentBlock.columns];
            const deletedBlock = updatedColumns[columnIndex][childIndex];
            
            updatedColumns[columnIndex] = updatedColumns[columnIndex].filter((_, index) => index !== childIndex);
            
            const newParentBlock: ColumnsBlock = {
                ...parentBlock,
                columns: updatedColumns,
            };
            updated[parentIndex] = newParentBlock;
            updateBlocks(updated);

            if (opendInput?.id === deletedBlock.id) {
                setOpendInput(null);
                setSelectedBlockLocation(null);
            }
        }
    };

    const updateColumnLayout = (parentIndex: number, columnIndex: number, newList: Block[]) => {
        if (!canAccess) return;

        const updated = [...formFieldList];
        const parentBlock = updated[parentIndex];

        if (parentBlock.type === 'columns') {
            const updatedColumns = [...parentBlock.columns];
            updatedColumns[columnIndex] = newList.map(normalizeBlock);
            
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
        if (!canAccess) return;
        setOpendInput(childBlock);
        setSelectedBlockLocation({
            parentIndex,
            columnIndex,
            childIndex,
        });
    };

    // Settings Panel Change Handler
    const handleSettingsChange = (key: string, value: any) => {
        if (!canAccess) return;

        if (selectedBlockLocation) {
            const { parentIndex, columnIndex, childIndex } = selectedBlockLocation;
            updateColumnBlock(parentIndex, columnIndex, childIndex, { [key]: value } as any);
        } else {
            const index = formFieldList.findIndex(
                (field) => field.id === opendInput?.id
            );

            if (index >= 0) {
                if (key === 'layout' && formFieldList[index].type === 'columns') {
                    const updated = [...formFieldList];
                    const parentBlock = updated[index] as ColumnsBlock;

                    const currentColumns = parentBlock.columns || [];
                    const currentLayout = parentBlock.layout || '2-50';
                    const newLayout = value as typeof parentBlock.layout;

                    const currentColCount = getColumnCount(currentLayout);
                    const newColCount = getColumnCount(newLayout);

                    let newColumns: Block[][] = [];

                    if (newColCount > currentColCount) {
                        newColumns = [...currentColumns];
                        for (let i = currentColCount; i < newColCount; i++) {
                            newColumns.push([]);
                        }
                    } else if (newColCount < currentColCount) {
                        newColumns = currentColumns.slice(0, newColCount);
                        const extraBlocks = currentColumns.slice(newColCount).flat();
                        if (extraBlocks.length > 0) {
                            newColumns[newColCount - 1] = [
                                ...newColumns[newColCount - 1],
                                ...extraBlocks,
                            ];
                        }
                    } else {
                        newColumns = currentColumns;
                    }

                    const updatedBlock: ColumnsBlock = {
                        ...parentBlock,
                        layout: newLayout,
                        columns: newColumns,
                    };
                    
                    updated[index] = updatedBlock;
                    updateBlocks(updated);
                    setOpendInput(updatedBlock);
                } else {
                    updateBlock(index, { [key]: value } as any);
                }
            }
        }
    };

    // Handle adding a new block
    const handleAddBlock = (blockConfig: any) => {
        if (!canAccess) return;
        
        const newField = createBlock(
            blockConfig.value,
            blockConfig.name,
            blockConfig.category === 'store',
            blockConfig.category === 'store'
        );
        updateBlocks([...formFieldList, newField]);
        setOpendInput(null);
        setSelectedBlockLocation(null);
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
                            const blockConfig = REGISTRATION_BLOCKS.find(b => b.value === value);
                            if (blockConfig) {
                                handleAddBlock(blockConfig);
                            }
                        }}
                    >
                        <ReactSortable
                            list={REGISTRATION_BLOCKS}
                            setList={() => {}}
                            sort={false}
                            group={{ name: 'registration', pull: 'clone', put: false }}
                            clone={(item) => ({ ...item, id: Date.now().toString() })}
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
                            const storeBlock = STORE_BLOCKS.find(block => block.value === value);
                            if (storeBlock) {
                                handleAddBlock(storeBlock);
                            }
                        }}
                    >
                        <ReactSortable
                            list={STORE_BLOCKS}
                            setList={() => {}}
                            sort={false}
                            group={{ name: 'registration', pull: 'clone', put: false }}
                            clone={(item) => ({ ...item, id: Date.now().toString() })}
                        >
                            {STORE_BLOCKS.map((item) => (
                                <div
                                    key={item.value}
                                    className="elements-items"
                                    onClick={() => handleAddBlock(item)}
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

    if (!canAccess) {
        return (
            <div className="registration-from-wrapper">
                <div className="locked-form-builder">
                    <i className="adminfont-lock"></i>
                    <p>This feature requires premium access</p>
                </div>
            </div>
        );
    }

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
                        if (!canAccess) return;
                        updateBlocks(newList);
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
                                            if (!canAccess) return;
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
                                                    if (!canAccess) return;
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
                                                    if (!canAccess) return;
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
                                                groupName="registration"
                                            />
                                        </section>
                                    </div>
                                ) : (
                                    <BlockRenderer
                                        key={formField.id}
                                        block={formField}
                                        onSelect={() => {
                                            if (!canAccess) return;
                                            setOpendInput(formField);
                                            setSelectedBlockLocation(null);
                                        }}
                                        onChange={(patch) => updateBlock(index, patch)}
                                        onDelete={() => deleteBlock(index)}
                                        isActive={opendInput?.id === formField.id}
                                        
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
                        if (!canAccess) return;
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

const RegistrationForm: FieldComponent = {
    render: CustomFormUI,
    validate: (field, value) => {
        if (field.required && !value?.[field.name]) {
            return `${field.label} is required`;
        }
        return null;
    },
};

export default RegistrationForm;