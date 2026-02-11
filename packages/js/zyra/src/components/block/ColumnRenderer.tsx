/**
 * ColumnBlockManager.tsx
 * Centralized column block management - hook + renderer in one file
 * Eliminates circular imports and provides clean column functionality
 */

import React, { useState, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';
import {
    Block,
    BlockPatch,
    ColumnsBlock,
    normalizeBlock,
    getColumnCount,
} from '../block';
import BlockRenderer from './BlockRenderer';

// TYPES
interface SelectedBlockLocation {
    parentIndex: number;
    columnIndex: number;
    childIndex: number;
}

interface UseColumnManagerProps {
    blocks: Block[];
    onBlocksUpdate: (blocks: Block[]) => void;
    openBlock: Block | null;
    setOpenBlock: (block: Block | null) => void;
}

interface UseColumnManagerReturn {
    selectedBlockLocation: SelectedBlockLocation | null;
    handleColumnUpdate: (parentIndex: number, columnIndex: number, newList: Block[]) => void;
    handleColumnChildUpdate: (parentIndex: number, columnIndex: number, childIndex: number, patch: BlockPatch) => void;
    handleColumnChildDelete: (parentIndex: number, columnIndex: number, childIndex: number) => void;
    handleColumnChildSelect: (childBlock: Block, parentIndex: number, columnIndex: number, childIndex: number) => void;
    handleLayoutChange: (parentIndex: number, newLayout: ColumnsBlock['layout']) => void;
    clearSelection: () => void;
}

export interface ColumnRendererProps {
    block: ColumnsBlock;
    parentIndex: number;
    blocks: Block[];
    isActive: boolean;
    groupName: string;
    openBlock: Block | null;
    setOpenBlock: (block: Block | null) => void;
    onBlocksUpdate: (blocks: Block[]) => void;
    onSelect: () => void;
    onDelete: () => void;
    showMeta?: boolean;
}

// ============================================================================
// HOOK: useColumnManager
// ============================================================================

export const useColumnManager = ({
    blocks,
    onBlocksUpdate,
    openBlock,
    setOpenBlock,
}: UseColumnManagerProps): UseColumnManagerReturn => {
    const [selectedBlockLocation, setSelectedBlockLocation] = useState<SelectedBlockLocation | null>(null);

    /**
     * Helper: Update parent column block
     */
    const updateParentBlock = useCallback(
        (parentIndex: number, newBlock: ColumnsBlock) => {
            const updated = [...blocks];
            updated[parentIndex] = newBlock;
            onBlocksUpdate(updated);
        },
        [blocks, onBlocksUpdate]
    );

    /**
     * Update entire column when blocks are reordered via drag & drop
     */
    const handleColumnUpdate = useCallback(
        (parentIndex: number, columnIndex: number, newList: Block[]) => {
            const parent = blocks[parentIndex] as ColumnsBlock;
            if (parent.type !== 'columns') return;

            const columns = [...parent.columns];
            columns[columnIndex] = newList.map(normalizeBlock);

            updateParentBlock(parentIndex, {
                ...parent,
                columns,
            });
        },
        [blocks, updateParentBlock]
    );

    /**
     * Update a specific child block property (e.g., label, style)
     */
    const handleColumnChildUpdate = useCallback(
        (
            parentIndex: number,
            columnIndex: number,
            childIndex: number,
            patch: BlockPatch
        ) => {
            const parent = blocks[parentIndex] as ColumnsBlock;
            if (parent.type !== 'columns') return;

            const columns = [...parent.columns];
            const column = [...columns[columnIndex]];

            column[childIndex] = {
                ...column[childIndex],
                ...patch,
            } as Block;

            columns[columnIndex] = column;

            updateParentBlock(parentIndex, {
                ...parent,
                columns,
            });

            // Sync openBlock if it's the same block being updated
            if (openBlock?.id === column[childIndex].id) {
                setOpenBlock(column[childIndex]);
            }
        },
        [blocks, openBlock, setOpenBlock, updateParentBlock]
    );

    /**
     * Delete a child block from a column
     */
    const handleColumnChildDelete = useCallback(
        (parentIndex: number, columnIndex: number, childIndex: number) => {
            const parent = blocks[parentIndex] as ColumnsBlock;
            if (parent.type !== 'columns') return;

            const deletedBlock = parent.columns[columnIndex][childIndex];
            const columns = [...parent.columns];

            columns[columnIndex] = columns[columnIndex].filter((_, i) => i !== childIndex);

            updateParentBlock(parentIndex, {
                ...parent,
                columns,
            });

            // Clear selection if the deleted block was selected
            if (openBlock?.id === deletedBlock.id) {
                setOpenBlock(null);
                setSelectedBlockLocation(null);
            }
        },
        [blocks, openBlock, setOpenBlock, updateParentBlock]
    );

    /**
     * Select a child block within a column
     */
    const handleColumnChildSelect = useCallback(
        (
            childBlock: Block,
            parentIndex: number,
            columnIndex: number,
            childIndex: number
        ) => {
            setOpenBlock(childBlock);
            setSelectedBlockLocation({
                parentIndex,
                columnIndex,
                childIndex,
            });
        },
        [setOpenBlock]
    );

    /**
     * Handle column layout changes (1-col, 2-col, 3-col, 4-col)
     * Intelligently redistributes blocks when changing layouts
     */
    const handleLayoutChange = useCallback(
        (parentIndex: number, newLayout: ColumnsBlock['layout']) => {
            const parent = blocks[parentIndex] as ColumnsBlock;
            if (parent.type !== 'columns') return;

            const currentCount = getColumnCount(parent.layout || '2-50');
            const nextCount = getColumnCount(newLayout);

            let columns = [...parent.columns];

            // Adding columns: create empty ones
            if (nextCount > currentCount) {
                for (let i = currentCount; i < nextCount; i++) {
                    columns.push([]);
                }
            }

            // Removing columns: merge extra blocks into last column
            if (nextCount < currentCount) {
                const extraBlocks = columns.slice(nextCount).flat();
                columns = columns.slice(0, nextCount);

                if (extraBlocks.length) {
                    columns[nextCount - 1] = [
                        ...columns[nextCount - 1],
                        ...extraBlocks,
                    ];
                }
            }

            const updatedBlock: ColumnsBlock = {
                ...parent,
                layout: newLayout,
                columns,
            };

            updateParentBlock(parentIndex, updatedBlock);

            // Sync openBlock if it's the column being updated
            if (openBlock?.id === updatedBlock.id) {
                setOpenBlock(updatedBlock);
            }
        },
        [blocks, openBlock, setOpenBlock, updateParentBlock]
    );

    /**
     * Clear selection (used when selecting a non-column block)
     */
    const clearSelection = useCallback(() => {
        setSelectedBlockLocation(null);
    }, []);

    return {
        selectedBlockLocation,
        handleColumnUpdate,
        handleColumnChildUpdate,
        handleColumnChildDelete,
        handleColumnChildSelect,
        handleLayoutChange,
        clearSelection,
    };
};

// ============================================================================
// COMPONENT: ColumnBlockRenderer
// ============================================================================

export const ColumnRenderer: React.FC<ColumnRendererProps> = ({
    block,
    parentIndex,
    blocks,
    isActive,
    groupName,
    openBlock,
    setOpenBlock,
    onBlocksUpdate,
    onSelect,
    onDelete,
    showMeta = true,
}) => {
    // Use the column manager hook
    const {
        selectedBlockLocation,
        handleColumnUpdate,
        handleColumnChildUpdate,
        handleColumnChildDelete,
        handleColumnChildSelect,
    } = useColumnManager({
        blocks,
        onBlocksUpdate,
        openBlock,
        setOpenBlock,
    });

    return (
        <div
            className={`form-field ${isActive ? 'active' : ''}`}
            onClick={onSelect}
        >
            {/* Meta Menu (Drag Handle + Delete Button) */}
            {showMeta && (
                <section className="meta-menu">
                    <span className="drag-handle admin-badge blue">
                        <i className="adminfont-drag" />
                    </span>
                    <span
                        className="admin-badge red"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <i className="adminfont-delete" />
                    </span>
                </section>
            )}

            {/* Column Layout Container */}
            <section className="form-field-container-wrapper">
                <div
                    className={`email-columns layout-${block.layout || '2-50'}`}
                    style={{
                        backgroundColor: block.style?.backgroundColor,
                        padding: block.style?.padding,
                        margin: block.style?.margin,
                        borderWidth: block.style?.borderWidth,
                        borderColor: block.style?.borderColor,
                        borderStyle: block.style?.borderStyle,
                        borderRadius: block.style?.borderRadius,
                    }}
                >
                    {block.columns.map((column, colIndex) => (
                        <div key={colIndex} className="email-column-wrapper">
                            <div className="column-icon">
                                <i className="adminfont-plus" />
                            </div>

                            {/* Sortable Column */}
                            <ReactSortable
                                list={column}
                                setList={(list) =>
                                    handleColumnUpdate(parentIndex, colIndex, list)
                                }
                                group={{ name: groupName, pull: true, put: true }}
                                className="email-column"
                                animation={150}
                                handle=".drag-handle"
                                fallbackOnBody
                                swapThreshold={0.65}
                            >
                                {column.map((child, childIndex) => (
                                    <BlockRenderer
                                        key={child.id}
                                        block={child}
                                        isColumnChild
                                        isActive={
                                            selectedBlockLocation?.parentIndex === parentIndex &&
                                            selectedBlockLocation?.columnIndex === colIndex &&
                                            selectedBlockLocation?.childIndex === childIndex
                                        }
                                        onSelect={() =>
                                            handleColumnChildSelect(
                                                child,
                                                parentIndex,
                                                colIndex,
                                                childIndex
                                            )
                                        }
                                        onChange={(patch) =>
                                            handleColumnChildUpdate(
                                                parentIndex,
                                                colIndex,
                                                childIndex,
                                                patch
                                            )
                                        }
                                        onDelete={() =>
                                            handleColumnChildDelete(
                                                parentIndex,
                                                colIndex,
                                                childIndex
                                            )
                                        }
                                    />
                                ))}
                            </ReactSortable>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ColumnRenderer;