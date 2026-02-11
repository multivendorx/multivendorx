/**
 * BlockRenderer.tsx - CLEAN VERSION
 * Column handling removed - now handled by ColumnBlockManager
 */

import React from 'react';
import { Block, BlockPatch } from '../block/blockTypes';
import { FIELD_REGISTRY } from '../FieldRegistry';

interface BlockRendererProps {
    block: Block;
    onChange: (patch: BlockPatch) => void;
    onSelect?: () => void;
    onDelete?: () => void;
    isActive?: boolean;
    showMeta?: boolean;
    editable?: boolean;
    
    // Column child props (when block is inside a column)
    isColumnChild?: boolean;
    parentIndex?: number;
    columnIndex?: number;
}

/**
 * Renders the content of a block based on its type using the Field Registry
 */
export const renderBlockContent = (
    block: Block,
    onChange: (patch: BlockPatch) => void,
    editable: boolean = true
): React.ReactNode => {
    const blockComponent = FIELD_REGISTRY[block.type];
    
    if (!blockComponent) {
        return <div>Unknown block type: {block.type}</div>;
    }
    
    const Render = blockComponent.render;
    
    return (
        <Render
            field={block}
            onChange={onChange}
        />
    );
};

/**
 * Main Block Renderer Component
 * Renders regular blocks with meta menu (drag handle + delete)
 */
export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    onChange,
    onSelect,
    onDelete,
    isActive,
    showMeta = true,
    editable = true,
    // isColumnChild = false,
}) => {
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