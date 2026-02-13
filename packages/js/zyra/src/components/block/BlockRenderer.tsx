import React from 'react';
import { Block, BlockPatch } from '../block/blockTypes';
import { FIELD_REGISTRY } from '../FieldRegistry';

// RENDER BLOCK CONTENT
export const renderBlockContent = (
    block: Block,
    onChange: (patch: BlockPatch) => void
): React.ReactNode => {
    if (!block?.type) return <div>Invalid block</div>;
    
    // Just add name if missing - nothing else
    const blockWithName = {
        ...block,
        name: block.name || `${block.type}-${block.id}`
    };
    
    const Component = FIELD_REGISTRY[block.type]?.render;
    if (!Component) return <div>Unknown type: {block.type}</div>;
    
    return <Component field={blockWithName} onChange={onChange} />;
};

// BLOCK RENDERER COMPONENT
interface BlockRendererProps {
    block: Block;
    onChange: (patch: BlockPatch) => void;
    onSelect?: () => void;
    onDelete?: () => void;
    isActive?: boolean;
    showMeta?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    onChange,
    onSelect,
    onDelete,
    isActive,
    showMeta = true,
}) => (
    <div className={`form-field ${isActive ? 'active' : ''}`} onClick={onSelect}>
        {showMeta && (
            <section className="meta-menu">
                <span className="drag-handle admin-badge blue">
                    <i className="adminfont-drag" />
                </span>
                {onDelete && (
                    <span onClick={(e) => { e.stopPropagation(); onDelete(); }} className="admin-badge red">
                        <i className="adminfont-delete" />
                    </span>
                )}
            </section>
        )}
        <section className="form-field-container-wrapper">
            {renderBlockContent(block, onChange)}
        </section>
    </div>
);

export default BlockRenderer;