// External Dependencies
import React from 'react';

// Internal Dependencies
import { Block, BlockPatch, BlockType } from '../block/blockTypes';
import { FIELD_REGISTRY } from '../FieldRegistry';

// SIMPLE ID GENERATOR (shared)
let idCounter = Date.now();
const generateId = () => ++idCounter;

// UNIFIED BLOCK CREATION FUNCTION
export const createBlockID = (type: BlockType, options?: any): Block => {
    const id = generateId();
    const { fixedName, placeholder, label, context } = options || {};
    
    const block: any = {
        id,
        type,
        name: fixedName ?? `${type}-${id.toString(36)}`,
        label: label ?? type,
        placeholder,
    };

    // Column
    if (type === 'columns') {
        block.columns = [[], []];
        block.layout = '2-50';
    }
    // Address (registration only)
    else if (type === 'address' && context === 'registration') {
        block.fields = [
            { id: generateId() + 1, key: 'address_1', label: 'Address Line 1', type: 'text', placeholder: 'Address Line 1', required: true },
            { id: generateId() + 2, key: 'address_2', label: 'Address Line 2', type: 'text', placeholder: 'Address Line 2' },
            { id: generateId() + 3, key: 'city', label: 'City', type: 'text', placeholder: 'City', required: true },
            { id: generateId() + 4, key: 'state', label: 'State', type: 'select', options: ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu'] },
            { id: generateId() + 5, key: 'country', label: 'Country', type: 'select', options: ['India', 'USA', 'UK', 'Canada'] },
            { id: generateId() + 6, key: 'postcode', label: 'Postal Code', type: 'text', placeholder: 'Postal Code', required: true },
        ];
    }
    // Selection fields
    else if (['radio', 'checkboxes', 'dropdown', 'multi-select'].includes(type)) {
        block.options = [
            { id: '1', label: 'Manufacture', value: 'manufacture' },
            { id: '2', label: 'Trader', value: 'trader' },
            { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
        ];
    }
    // Content blocks
    else if (type === 'heading') {
        block.text = placeholder || 'Heading Text';
        block.level = 2;
    }
    else if (type === 'richtext') {
        block.html = placeholder || '<p>This is a demo text</p>';
    }
    else if (type === 'button') {
        block.text = placeholder || 'Click me';
        block.url = '#';
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