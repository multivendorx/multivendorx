
import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import { Block, ColumnsBlock, BlockPatch } from './types';
import { normalizeBlock } from './blockFactory';
import { BlockRenderer } from './BlockRenderer';

interface ColumnRendererProps {
    block: ColumnsBlock;
    parentIndex: number;
    openBlock: Block | null;
    onSelectChild: (childBlock: Block, parentIndex: number, columnIndex: number, childIndex: number) => void;
    onUpdateColumn: (parentIndex: number, columnIndex: number, newList: Block[]) => void;
    onUpdateChild: (parentIndex: number, columnIndex: number, childIndex: number, patch: BlockPatch) => void;
    onDeleteChild: (parentIndex: number, columnIndex: number, childIndex: number) => void;
    proSettingChange?: () => boolean;
    groupName?: string;
    components?: {
        BasicInput?: any;
        MultipleOptions?: any;
        TextArea?: any;
        FileInput?: any;
        AddressField?: any;
    };
}

// Unified Column Renderer - Works for both EmailTemplate and RegistrationForm
export const ColumnRenderer: React.FC<ColumnRendererProps> = ({
    block,
    parentIndex,
    openBlock,
    onSelectChild,
    onUpdateColumn,
    onUpdateChild,
    onDeleteChild,
    proSettingChange,
    groupName = 'blocks',
    components,
}) => {
    const style = {
        backgroundColor: block.style?.backgroundColor,
        padding: block.style?.padding,
        margin: block.style?.margin,
        borderWidth: block.style?.borderWidth,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle,
        borderRadius: block.style?.borderRadius,
    };

    return (
        <div className={`email-columns layout-${block.layout || '2-50'}`} style={style}>
            {(block.columns || []).map((column, colIndex) => (
                <div key={colIndex} className="email-column-wrapper">
                    <div className="column-icon">
                        <i className="adminfont-plus"></i>
                    </div>

                    <ReactSortable
                        list={column}
                        setList={(newList) => {
                            if (proSettingChange && proSettingChange()) return;
                            const normalized = newList.map(normalizeBlock);
                            onUpdateColumn(parentIndex, colIndex, normalized);
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
                                onSelect={() => onSelectChild(childBlock, parentIndex, colIndex, childIndex)}
                                onChange={(patch) => onUpdateChild(parentIndex, colIndex, childIndex, patch)}
                                onDelete={() => onDeleteChild(parentIndex, colIndex, childIndex)}
                                isActive={openBlock?.id === childBlock.id}
                                {...components}
                            />
                        ))}
                    </ReactSortable>
                </div>
            ))}
        </div>
    );
};

export default ColumnRenderer;