// External Dependencies
import React from 'react';

// Internal Dependencies
import { Block, BlockPatch, BlockType, ColumnsBlock } from './blockTypes';
import { FIELD_REGISTRY } from '../FieldRegistry';

// ID generator

let idCounter = Date.now();
const generateId = (): number => ++idCounter;
export const createBlockID = (type: BlockType, options?: any): Block => {
    const id = generateId();
    const { fixedName, placeholder, label, context, options: presetOptions } = options || {};

    const block: Block = {
        id,
        type,
        name:        fixedName ?? `${type}-${id.toString(36)}`,
        label:       label ?? type,
        placeholder,
        context,
        options:     presetOptions,
    };

    if (type === 'columns') {
        (block as ColumnsBlock).layout  = '2-50';
        (block as ColumnsBlock).columns = [[], []];
    }

    return block;
};

export const createBlock = (item: any, context?: string): Block => {
    if (item?.id && item?.type) {
        if (item.type === 'columns' && !Array.isArray(item.columns)) {
            return { ...item, layout: item.layout ?? '2-50', columns: [[], []] };
        }
        return item as Block;
    }
    if (item?.value) {
        return createBlockID(item.value as BlockType, {
            fixedName:   item.fixedName,
            placeholder: item.placeholder,
            label:       item.label,
            options:     item.options,
            context,
        });
    }
    return createBlockID('text', { label: 'Text', context });
};


// Render block content

export const renderBlockContent = (
    block: Block,
    onChange: (patch: BlockPatch) => void
): React.ReactNode => {
    if (!block?.type) return <div>Invalid block</div>;
    const Component = FIELD_REGISTRY[block.type]?.render;
    if (!Component) return <div>Unknown type: {block.type}</div>;
    return (
        <Component
            field={{ ...block, name: block.name || `${block.type}-${block.id}` }}
            onChange={onChange}
        />
    );
};

// BlockRenderer component
interface BlockRendererProps {
    block: Block;
    onChange: (patch: BlockPatch) => void;
    onSelect?: () => void;
    onDelete?: (e?: React.MouseEvent) => void;
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
    <div
        className={`form-field ${isActive ? 'active' : ''} ${isColumnChild ? 'column-child' : ''}`}
        onClick={onSelect}
    >
        {showMeta && (
            <section className="meta-menu">
                <span className="drag-handle admin-badge blue">
                    <i className="adminfont-drag" />
                </span>
                {onDelete && (
                    <span
                        className="admin-badge red"
                        onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                    >
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