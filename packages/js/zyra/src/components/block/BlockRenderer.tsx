import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import {
    Block,
    BlockPatch,
    ColumnsBlock,
} from './types';
import { normalizeBlock } from './blockCore';
// import { BLOCK_REGISTRY, getBlockComponent } from './BlockRegistry';
import { FIELD_REGISTRY } from '../FieldRegistry';

interface BlockRendererProps {
    block: Block;
    onChange: (patch: BlockPatch) => void;
    onSelect?: () => void;
    onDelete?: () => void;
    isActive?: boolean;
    showMeta?: boolean;
    editable?: boolean;
    
    // Column-specific props (optional for regular blocks)
    parentIndex?: number;
    columnIndex?: number;
    isColumnChild?: boolean;
    onUpdateColumn?: (parentIndex: number, columnIndex: number, newList: Block[]) => void;
    onUpdateChild?: (parentIndex: number, columnIndex: number, childIndex: number, patch: BlockPatch) => void;
    onDeleteChild?: (parentIndex: number, columnIndex: number, childIndex: number) => void;
    onSelectChild?: (childBlock: Block, parentIndex: number, columnIndex: number, childIndex: number) => void;
    proSettingChange?: () => boolean;
    groupName?: string;
}

// Renders the content of a block based on its type using the Block Registry
export const renderBlockContent = (
    block: Block,
    onChange: (patch: BlockPatch) => void,
    editable: boolean = true
): React.ReactNode => {
    // Get the component from the registry
    const blockComponent = FIELD_REGISTRY[block.type];
    console.log(block.type)
    
    // If component exists in registry, render it
    // if (blockComponent) {
    //     return blockComponent.render({ block, onChange, editable });
    // }
    const Render = blockComponent.render;
            
        
        return (
            <Render
                field={block}
                onChange={onChange}
            />
        );
    
    // Fallback for unknown block types
    return (
        <div className="unknown-block-type">
            <i className="adminfont-alert-triangle"></i>
            <p>Unknown block type: {block.type}</p>
        </div>
    );
};

// Main Block Renderer Component
export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    onChange,
    onSelect,
    onDelete,
    isActive,
    showMeta = true,
    editable = true,
    
    // Column-specific props
    parentIndex,
    columnIndex,
    isColumnChild = false,
    onUpdateColumn,
    onUpdateChild,
    onDeleteChild,
    onSelectChild,
    proSettingChange,
    groupName = 'blocks',
}) => {
    // Special handling for column blocks
    if (block.type === 'columns') {
        const columnBlock = block as ColumnsBlock;
        
        if (onUpdateColumn && onUpdateChild && onDeleteChild && onSelectChild) {
            // This is a column block being rendered in the canvas
            const style = {
                backgroundColor: columnBlock.style?.backgroundColor,
                padding: columnBlock.style?.padding,
                margin: columnBlock.style?.margin,
                borderWidth: columnBlock.style?.borderWidth,
                borderColor: columnBlock.style?.borderColor,
                borderStyle: columnBlock.style?.borderStyle,
                borderRadius: columnBlock.style?.borderRadius,
            };

            return (
                <div
                    className={`form-field ${isActive ? 'active' : ''}`}
                    onClick={onSelect}
                >
                    {/* META MENU for column block */}
                    {showMeta && (
                        <section className="meta-menu">
                            <span className="drag-handle admin-badge blue">
                                <i className="adminfont-drag"></i>
                            </span>
                            {onDelete && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="admin-badge red"
                                >
                                    <i className="admin-font adminfont-delete"></i>
                                </span>
                            )}
                        </section>
                    )}

                    {/* FIELD CONTENT for column block */}
                    <section className="form-field-container-wrapper">
                        <div className={`email-columns layout-${columnBlock.layout || '2-50'}`} style={style}>
                            {(columnBlock.columns || []).map((column, colIndex) => (
                                <div key={colIndex} className="email-column-wrapper">
                                    <div className="column-icon">
                                        <i className="adminfont-plus"></i>
                                    </div>

                                    <ReactSortable
                                        list={column}
                                        setList={(newList) => {
                                            if (proSettingChange && proSettingChange()) return;
                                            const normalized = newList.map(normalizeBlock);
                                            onUpdateColumn(parentIndex || 0, colIndex, normalized);
                                        }}
                                        group={{ name: groupName, pull: true, put: true }}
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
                                                onSelect={() => onSelectChild(childBlock, parentIndex || 0, colIndex, childIndex)}
                                                onChange={(patch) => onUpdateChild(parentIndex || 0, colIndex, childIndex, patch)}
                                                onDelete={() => onDeleteChild(parentIndex || 0, colIndex, childIndex)}
                                                isActive={isActive && childBlock.id === (isActive as any)?.id}
                                                isColumnChild={true}
                                                parentIndex={parentIndex}
                                                columnIndex={colIndex}
                                            />
                                        ))}
                                    </ReactSortable>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            );
        } else {
            // This is a column block being rendered in content view (not in canvas)
            return (
                <div className="columns-placeholder">
                    <i className="adminfont-blocks"></i>
                    <p>Column Layout ({columnBlock.layout || '2-50'})</p>
                    <small>Drag blocks inside columns in the canvas</small>
                </div>
            );
        }
    }

    // Regular block rendering using registry
    return (
        <div
            className={`form-field ${isActive ? 'active' : ''}`}
            onClick={onSelect}
        >
            {/* META MENU */}
            {showMeta && (
                <section className="meta-menu">
                    <span className="drag-handle admin-badge blue">
                        <i className="adminfont-drag"></i>
                    </span>
                    {onDelete && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="admin-badge red"
                        >
                            <i className="admin-font adminfont-delete"></i>
                        </span>
                    )}
                </section>
            )}

            {/* FIELD CONTENT - Rendered via Registry */}
            <section className="form-field-container-wrapper">
                {renderBlockContent(block, onChange, editable)}
            </section>
        </div>
    );
};

export default BlockRenderer;