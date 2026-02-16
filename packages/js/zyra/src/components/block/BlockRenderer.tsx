// External Dependencies
import React from 'react';

// Internal Dependencies
import { Block, BlockPatch, BlockType } from './blockTypes';
import { FIELD_REGISTRY } from '../FieldRegistry';

// SIMPLE ID GENERATOR (shared)
let idCounter = Date.now();
const generateId = () => ++idCounter;

// UNIFIED BLOCK CREATION FUNCTION
export const createBlockID = (type: BlockType, options?: any): Block => {
    const id = generateId();
    const { fixedName, placeholder, label, context, options: presetOptions } = options || {};
    
    const block: any = {
        id,
        type,
        name: fixedName ?? `${type}-${id.toString(36)}`,
        label: label ?? type,
        placeholder,
        context,
        options: presetOptions,
    };

        if (type === 'columns') {
        block.columns = [[], []]; // Default 2 columns
        block.layout = '2-50';
    }

    return block as Block;
};

// Helper for drag-drop items
export const createBlock = (item: any, context?: string): Block => {
    // If it's already a valid Block with id and type, return as-is
    if (item?.id && item?.type) return item;
    
    // If it has a 'value' property, it's a BlockConfig from LeftPanel
    if (item?.value) {
        return createBlockID(item.value, {
            fixedName: item.fixedName,
            placeholder: item.placeholder,
            label: item.label,
            options: item.options,
            context: context
        });
    }
    
    // Default fallback to text block
    return createBlockID('text', { label: 'Text', context });
};

// RENDER BLOCK CONTENT
export const renderBlockContent = (
    block: Block,
    onChange: (patch: BlockPatch) => void
): React.ReactNode => {
    if (!block?.type) return <div>Invalid block</div>;
    
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
    isColumnChild?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    onChange,
    onSelect,
    onDelete,
    isActive,
    showMeta = true,
    isColumnChild,
}) => (
    <div className={`form-field ${isActive ? 'active' : ''} ${isColumnChild ? 'column-child' : ''}`} onClick={onSelect}>
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