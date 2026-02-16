// External Dependencies
import React from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import {
    Block,
    BlockPatch,
    ColumnsBlock,
    getColumnCount,
} from './blockTypes';
import BlockRenderer, { createBlock } from './BlockRenderer';

// Types
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

// Hook
export const useColumnManager = ({
    blocks,
    onBlocksUpdate,
    openBlock,
    setOpenBlock,
}: UseColumnManagerProps) => {
    const [selectedLocation, setSelectedLocation] = React.useState<SelectedBlockLocation | null>(null);

    const updateParent = (index: number, newBlock: ColumnsBlock) => {
        const updated = [...blocks];
        updated[index] = newBlock;
        onBlocksUpdate(updated);
    };

    const handleColumnUpdate = (parentIdx: number, colIdx: number, newList: any[]) => {
        const parent = blocks[parentIdx] as ColumnsBlock;
        if (parent?.type !== 'columns') return;

        // Ensure parent.columns exists and is an array
        const currentColumns = Array.isArray(parent.columns) ? parent.columns : [[], []];

        // Convert any raw items to valid blocks
        const validBlocks = newList.map(item => createBlock(item));

        const columns = [...currentColumns];
        columns[colIdx] = validBlocks;
        updateParent(parentIdx, { ...parent, columns });
    };

    const handleChildUpdate = (parentIdx: number, colIdx: number, childIdx: number, patch: BlockPatch) => {
        const parent = blocks[parentIdx] as ColumnsBlock;
        if (parent?.type !== 'columns') return;

        const columns = [...parent.columns];
        const column = [...columns[colIdx]];
        column[childIdx] = { ...column[childIdx], ...patch } as Block;
        columns[colIdx] = column;

        updateParent(parentIdx, { ...parent, columns });

        if (openBlock?.id === column[childIdx].id) setOpenBlock(column[childIdx]);
    };

    const handleChildDelete = (parentIdx: number, colIdx: number, childIdx: number) => {
        const parent = blocks[parentIdx] as ColumnsBlock;
        if (parent?.type !== 'columns') return;

        const deleted = parent.columns[colIdx]?.[childIdx];
        const columns = [...parent.columns];
        columns[colIdx] = columns[colIdx].filter((_, i) => i !== childIdx);

        updateParent(parentIdx, { ...parent, columns });

        if (openBlock?.id === deleted?.id) {
            setOpenBlock(null);
            setSelectedLocation(null);
        }
    };

    const handleChildSelect = (child: Block, parentIdx: number, colIdx: number, childIdx: number) => {
        setOpenBlock(child);
        setSelectedLocation({ parentIndex: parentIdx, columnIndex: colIdx, childIndex: childIdx });
    };

    const handleLayoutChange = (parentIdx: number, newLayout: ColumnsBlock['layout']) => {
        const parent = blocks[parentIdx] as ColumnsBlock;
        if (parent?.type !== 'columns') return;

        const current = getColumnCount(parent.layout || '2-50');
        const next = getColumnCount(newLayout);
        let columns = [...parent.columns];

        if (next > current) {
            for (let i = current; i < next; i++) columns.push([]);
        } else if (next < current) {
            const extra = columns.slice(next).flat();
            columns = columns.slice(0, next);
            if (extra.length) columns[next - 1] = [...columns[next - 1], ...extra];
        }

        updateParent(parentIdx, { ...parent, layout: newLayout, columns });
        if (openBlock?.id === parent.id) setOpenBlock({ ...parent, layout: newLayout, columns });
    };

    const clearSelection = () => setSelectedLocation(null);

    return {
        selectedLocation,
        handleColumnUpdate,
        handleChildUpdate,
        handleChildDelete,
        handleChildSelect,
        handleLayoutChange,
        clearSelection,
    };
};

// Component
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
    const {
        selectedLocation,
        handleColumnUpdate,
        handleChildUpdate,
        handleChildDelete,
        handleChildSelect,
    } = useColumnManager({ blocks, onBlocksUpdate, openBlock, setOpenBlock });

    const columns = Array.isArray(block.columns) ? block.columns : [[], []];
    const layout = block.layout || '2-50';

    return (
        <div className={`form-field ${isActive ? 'active' : ''}`} onClick={onSelect}>
            {showMeta && (
                <section className="meta-menu">
                    <span className="drag-handle admin-badge blue">
                        <i className="adminfont-drag" />
                    </span>
                    <span className="admin-badge red" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
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
                                setList={(list) => handleColumnUpdate(parentIndex, colIdx, list)}
                                group={{ name: groupName, pull: true, put: true }}
                                className="email-column"
                                animation={150}
                                handle=".drag-handle"
                                emptyInsertThreshold={20}
                            >
                                {column.length === 0 ? (
                                    <div className="column-drop-zone">
                                        <i className="adminfont-plus" />
                                        <span>Drop blocks here</span>
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
                                                selectedLocation?.childIndex === childIdx
                                            }
                                            onSelect={() => handleChildSelect(child, parentIndex, colIdx, childIdx)}
                                            onChange={(patch) => handleChildUpdate(parentIndex, colIdx, childIdx, patch)}
                                            onDelete={() => handleChildDelete(parentIndex, colIdx, childIdx)}
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