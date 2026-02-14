// External Dependencies
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import { Block, BlockPatch, BlockRenderer, ColumnRenderer, useColumnManager, createBlock } from './block';
import SettingMetaBox from './SettingMetaBox';

interface CanvasEditorProps {
    blocks: Block[];
    onChange: (blocks: Block[]) => void;
    groupName: string;
    proSettingChange?: () => boolean;
    context?: string;
    blockGroups?: Array<{ blocks: Array<{ value: string; label: string }> }>;
    inputTypeList?: Array<{ value: string; label: string }>;
    canvasClassName?: string;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
    blocks: externalBlocks,
    onChange,
    groupName,
    proSettingChange = () => false,
    context = 'default',
    blockGroups,
    inputTypeList,
    canvasClassName = '',
}) => {
    // Track if changes have been made
    const settingHasChanged = useRef(false);
    
    // Local state
    const [blocks, setBlocks] = useState<Block[]>(externalBlocks);
    const [openBlock, setOpenBlock] = useState<Block | null>(null);

    // Update local blocks when external blocks change
    useEffect(() => {
        setBlocks(externalBlocks);
    }, [externalBlocks]);

    // Column manager
    const columnManager = useColumnManager({
        blocks,
        onBlocksUpdate: (updatedBlocks) => {
            setBlocks(updatedBlocks);
            markChanged();
        },
        openBlock,
        setOpenBlock,
    });

    // Trigger onChange when blocks change (if changes were made)
    useEffect(() => {
        if (settingHasChanged.current) {
            onChange(blocks);
            settingHasChanged.current = false;
        }
    }, [blocks, onChange]);

    // Helper to mark that changes have been made
    const markChanged = useCallback(() => {
        settingHasChanged.current = true;
    }, []);

    // Update a single block
    const updateBlock = useCallback((index: number, patch: BlockPatch) => {
        if (proSettingChange()) return;
        
        setBlocks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...patch } as Block;
            if (openBlock?.id === updated[index].id) {
                setOpenBlock(updated[index]);
            }
            markChanged();
            return updated;
        });
    }, [proSettingChange, openBlock?.id, markChanged]);

    // Delete a block
    const deleteBlock = useCallback((indexToDelete: number, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        
        if (proSettingChange()) return;
        
        const deletedBlock = blocks[indexToDelete];
        
        setBlocks(prev => {
            const filtered = prev.filter((_, index) => index !== indexToDelete);
            markChanged();
            return filtered;
        });
        
        // Clear selection if the deleted block was open
        if (openBlock?.id === deletedBlock?.id) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    }, [proSettingChange, blocks, openBlock?.id, columnManager, markChanged]);

    // Handle drops from left panel
    const handleSetList = useCallback((newList: any[]) => {
        if (proSettingChange()) return;
        
        const processedList = newList.map(item => 
            createBlock(item, context)
        );
        
        setBlocks(processedList);
        markChanged();
    }, [proSettingChange, context, markChanged]);

    // Handle settings changes from SettingMetaBox
    const handleSettingsChange = useCallback((key: string, value: any) => {
        if (proSettingChange()) return;
        
        if (columnManager.selectedLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedLocation;
            columnManager.handleChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value });
            markChanged();
        } else {
            const index = blocks.findIndex(b => b.id === openBlock?.id);
            if (index >= 0) {
                if (key === 'layout' && blocks[index].type === 'columns') {
                    columnManager.handleLayoutChange(index, value);
                    markChanged();
                } else {
                    updateBlock(index, { [key]: value });
                }
            }
        }
    }, [proSettingChange, columnManager, blocks, openBlock?.id, updateBlock, markChanged]);

    // Get input type list for settings
    const getInputTypeList = () => {
        if (inputTypeList) return inputTypeList;
        if (blockGroups && blockGroups[0]?.blocks) {
            return blockGroups[0].blocks.map(b => ({ value: b.value, label: b.label }));
        }
        return [];
    };

    return (
        <>
            {/* Canvas Area */}
            <div className={canvasClassName || 'registration-form-main-section'}>
                <ReactSortable
                    list={blocks}
                    setList={handleSetList}
                    group={{ name: groupName, pull: true, put: true }}
                    handle=".drag-handle"
                    animation={150}
                    className={`${groupName}-canvas-sortable`}
                >
                    {blocks.map((block, index) => (
                        <div className="field-wrapper" key={block.id}>
                            {block.type === 'columns' ? (
                                <ColumnRenderer
                                    block={block}
                                    parentIndex={index}
                                    blocks={blocks}
                                    isActive={openBlock?.id === block.id}
                                    groupName={groupName}
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
                                    }}
                                    onDelete={(e) => deleteBlock(index, e)}
                                    isActive={openBlock?.id === block.id}
                                />
                            )}
                        </div>
                    ))}
                </ReactSortable>
            </div>

            {/* Settings Panel - Separate sibling element */}
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
                                formField={openBlock}
                                opened={{ click: true }}
                                onChange={handleSettingsChange}
                                inputTypeList={getInputTypeList()}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CanvasEditor;