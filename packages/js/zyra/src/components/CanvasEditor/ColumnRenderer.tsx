// External Dependencies
import React, { useState, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import { Block, BlockPatch, ColumnsBlock, getColumnCount } from './blockTypes';
import BlockRenderer from './BlockRenderer';


// Types
export interface SelectedBlockLocation {
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

export interface ColumnRendererProps {
    block: ColumnsBlock;
    parentIndex: number;
    isActive: boolean;
    groupName: string;
    openBlock: Block | null;
    setOpenBlock: (block: Block | null) => void;
    onColumnSetList: (parentIdx: number, colIdx: number, list: any[]) => void;
    onChildMutate: (updated: ColumnsBlock) => void;
    onSelect: () => void;
    onDelete: () => void;
    showMeta?: boolean;
}

export const safeColumns = (block: ColumnsBlock): Block[][] => {
    if (Array.isArray(block.columns) && block.columns.length > 0) {
        return block.columns.map(col => (Array.isArray(col) ? [...col] : []));
    }
    return [[], []];
};

export const useColumnManager = ({
    blocks,
    onBlocksUpdate,
    openBlock,
    setOpenBlock,
}: UseColumnManagerProps) => {
    const [selectedLocation, setSelectedLocation] =
        useState<SelectedBlockLocation | null>(null);

    const replaceParent = useCallback(
        (index: number, updated: ColumnsBlock) => {
            const next = [...blocks];
            next[index] = updated;
            onBlocksUpdate(next);
        },
        [blocks, onBlocksUpdate]
    );

    /** Apply a patch to a child block via the settings panel */
    const handleChildUpdate = useCallback(
        (parentIdx: number, colIdx: number, childIdx: number, patch: BlockPatch) => {
            const parent = blocks[parentIdx] as ColumnsBlock;
            if (parent?.type !== 'columns') return;
            const columns = safeColumns(parent).map((col, ci) =>
                ci !== colIdx
                    ? col
                    : col.map((child, ri) =>
                          ri === childIdx ? ({ ...child, ...patch } as Block) : child
                      )
            );
            replaceParent(parentIdx, { ...parent, columns });
            const updated = columns[colIdx][childIdx];
            if (openBlock?.id === updated?.id) setOpenBlock(updated);
        },
        [blocks, openBlock?.id, replaceParent, setOpenBlock]
    );

    /** Adjust the column count when the user picks a new layout */
    const handleLayoutChange = useCallback(
        (parentIdx: number, newLayout: ColumnsBlock['layout']) => {
            const parent = blocks[parentIdx] as ColumnsBlock;
            if (parent?.type !== 'columns') return;
            const currentCount = getColumnCount(parent.layout || '2-50');
            const nextCount    = getColumnCount(newLayout);
            let columns        = safeColumns(parent);
            if (nextCount > currentCount) {
                for (let i = currentCount; i < nextCount; i++) columns.push([]);
            } else if (nextCount < currentCount) {
                const overflow = columns.slice(nextCount).flat();
                columns = [...columns.slice(0, nextCount)];
                columns[nextCount - 1] = [...columns[nextCount - 1], ...overflow];
            }
            const updated = { ...parent, layout: newLayout, columns };
            replaceParent(parentIdx, updated);
            if (openBlock?.id === parent.id) setOpenBlock(updated);
        },
        [blocks, openBlock?.id, replaceParent, setOpenBlock]
    );

    const clearSelection = useCallback(() => setSelectedLocation(null), []);

    return { selectedLocation, handleChildUpdate, handleLayoutChange, clearSelection };
};

// ColumnRenderer
export const ColumnRenderer: React.FC<ColumnRendererProps> = ({
    block,
    parentIndex,
    isActive,
    groupName,
    openBlock,
    setOpenBlock,
    onColumnSetList,
    onChildMutate,
    onSelect,
    onDelete,
    showMeta = true,
}) => {
    const [selectedLocation, setSelectedLocation] =
        useState<SelectedBlockLocation | null>(null);

    /** Mutate the columns matrix and notify the parent with the new block */
    const mutate = useCallback(
        (fn: (cols: Block[][]) => Block[][]) => {
            onChildMutate({ ...block, columns: fn(safeColumns(block)) });
        },
        [block, onChildMutate]
    );

    const handleChildUpdate = useCallback(
        (colIdx: number, childIdx: number, patch: BlockPatch) => {
            let updatedChild: Block | undefined;
            mutate(cols =>
                cols.map((col, ci) => {
                    if (ci !== colIdx) return col;
                    return col.map((child, ri) => {
                        if (ri !== childIdx) return child;
                        updatedChild = { ...child, ...patch } as Block;
                        return updatedChild;
                    });
                })
            );
            if (updatedChild && openBlock?.id === updatedChild.id)
                setOpenBlock(updatedChild);
        },
        [mutate, openBlock?.id, setOpenBlock]
    );

    const handleChildDelete = useCallback(
        (colIdx: number, childIdx: number) => {
            const deleted = safeColumns(block)[colIdx]?.[childIdx];
            mutate(cols =>
                cols.map((col, ci) =>
                    ci === colIdx ? col.filter((_, ri) => ri !== childIdx) : col
                )
            );
            if (deleted && openBlock?.id === deleted.id) {
                setOpenBlock(null);
                setSelectedLocation(null);
            }
        },
        [block, mutate, openBlock?.id, setOpenBlock]
    );

    const handleChildSelect = useCallback(
        (child: Block, colIdx: number, childIdx: number) => {
            setOpenBlock(child);
            setSelectedLocation({ parentIndex, columnIndex: colIdx, childIndex: childIdx });
        },
        [parentIndex, setOpenBlock]
    );


    const columns = safeColumns(block);
    const layout  = block.layout || '2-50';

    return (
        <div className={`form-field ${isActive ? 'active' : ''}`} onClick={onSelect}>
            {showMeta && (
                <section className="meta-menu">
                    <span className="drag-handle admin-badge blue">
                        <i className="adminfont-drag" />
                    </span>
                    <span
                        className="admin-badge red"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                        <i className="adminfont-delete" />
                    </span>
                </section>
            )}

            <section className="form-field-container-wrapper">
                <div className={`email-columns layout-${layout}`}>
                    {columns.map((column, colIdx) => (
                        <div key={colIdx} className="email-column-wrapper">
                            <ReactSortable
                                list={column}
                                setList={(list) => onColumnSetList(parentIndex, colIdx, list)}
                                group={{ name: groupName, pull: true, put: true }}
                                className="email-column"
                                animation={150}
                                handle=".drag-handle"
                                emptyInsertThreshold={20}
                            >
                                {column.length === 0 ? (
                                    <div className="column-drop-zone">
                                        <i className="adminfont-plus" />
                                    </div>
                                ) : (
                                    column.map((child, childIdx) => (
                                        <BlockRenderer
                                            key={child.id}
                                            block={child}
                                            isColumnChild
                                            isActive={
                                                selectedLocation?.parentIndex === parentIndex &&
                                                selectedLocation?.columnIndex === colIdx &&
                                                selectedLocation?.childIndex  === childIdx
                                            }
                                            onSelect={() => handleChildSelect(child, colIdx, childIdx)}
                                            onChange={(patch) => handleChildUpdate(colIdx, childIdx, patch)}
                                            onDelete={() => handleChildDelete(colIdx, childIdx)}
                                        />
                                    ))
                                )}
                            </ReactSortable>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ColumnRenderer;