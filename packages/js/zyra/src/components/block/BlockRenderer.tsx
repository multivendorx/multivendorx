import React from 'react';
import {
    Block,
    BlockPatch,
} from './types';
import {
    TextBlockView,
    HeadingBlockView,
    ButtonBlockView,
    DividerBlockView,
    ImageBlockView,
} from './blockView';

interface BlockRendererProps {
    block: Block;
    onChange: (patch: BlockPatch) => void;
    onSelect?: () => void;
    onDelete?: () => void;
    isActive?: boolean;
    showMeta?: boolean;
    editable?: boolean;
    parentId?: number;
    columnIndex?: number;
    // Pass through any additional components needed
    BasicInput?: any;
    MultipleOptions?: any;
    TextArea?: any;
    FileInput?: any;
    AddressField?: any;
}

// Renders the content of a block based on its type
export const renderBlockContent = (
    block: Block,
    onChange: (patch: BlockPatch) => void,
    editable: boolean = true,
    components?: {
        BasicInput?: any;
        MultipleOptions?: any;
        TextArea?: any;
        FileInput?: any;
        AddressField?: any;
    }
): React.ReactNode => {
    const { BasicInput, MultipleOptions, TextArea, FileInput, AddressField } = components || {};

    switch (block.type) {
        // ==================== Basic Text Inputs ====================
        case 'text':
        case 'email':
        case 'number':
            if (!BasicInput) return null;
            return (
                <>
                    <p>{block.label}</p>
                    <BasicInput
                        type={block.type}
                        placeholder={block.placeholder || block.type}
                        value={''}
                        onChange={() => { }}
                    />
                </>
            );

        // ==================== Textarea ====================
        case 'textarea':
            if (!TextArea) return null;
            return (
                <>
                    <p>{block.label}</p>
                    <TextArea name="content" />
                </>
            );

        // ==================== Rich Text ====================
        case 'richtext':
            return (
                <TextBlockView
                    block={block}
                    onChange={(html) => onChange({ html })}
                    editable={editable}
                />
            );

        // ==================== Heading ====================
        case 'heading':
            return (
                <HeadingBlockView
                    block={block}
                    onChange={(text) => onChange({ text })}
                    editable={editable}
                />
            );

        // ==================== Button ====================
        case 'button':
            return (
                <ButtonBlockView
                    block={block}
                    onChange={(text) => onChange({ text })}
                    editable={editable}
                />
            );

        // ==================== Divider ====================
        case 'divider':
            return <DividerBlockView block={block} />;

        // ==================== Image ====================
        case 'image':
            return (
                <ImageBlockView
                    block={block}
                    onChange={(src) => onChange({ src })}
                    editable={editable}
                />
            );

        // ==================== Columns ====================
        case 'columns':
            return (
                <div className="columns-placeholder">
                    <i className="adminfont-blocks"></i>
                    <p>Column Layout ({block.layout || '2-50'})</p>
                    <small>Drag blocks inside columns in the canvas</small>
                </div>
            );

        // ==================== Selection Blocks ====================
        case 'radio':
        case 'dropdown':
        case 'multiselect':
        case 'checkboxes':
            if (!MultipleOptions) return null;
            return (
                <MultipleOptions
                    formField={block}
                    type={block.type}
                    selected={false}
                />
            );

        // ==================== Date Picker ====================
        case 'datepicker':
            if (!BasicInput) return null;
            return (
                <>
                    <p>{block.label}</p>
                    <BasicInput
                        type="date"
                        placeholder={block.placeholder || block.type}
                        value={''}
                        onChange={() => { }}
                    />
                </>
            );

        // ==================== Time Picker ====================
        case 'TimePicker':
            if (!BasicInput) return null;
            return (
                <>
                    <p>{block.label}</p>
                    <BasicInput
                        type="time"
                        placeholder={block.placeholder || block.type}
                        value={''}
                        onChange={() => { }}
                    />
                </>
            );

        // ==================== Attachment ====================
        case 'attachment':
            if (!FileInput) return null;
            return (
                <>
                    <p>{block.label}</p>
                    <FileInput
                        value={''}
                        inputClass="form-input"
                        name="image"
                        type="hidden"
                        imageWidth={75}
                        imageHeight={75}
                    />
                </>
            );

        // ==================== Section ====================
        case 'section':
            if (!BasicInput) return null;
            return (
                <BasicInput
                    type="text"
                    value={block.label}
                    placeholder={block.placeholder || block.type}
                    onChange={() => { }}
                />
            );

        // ==================== Recaptcha ====================
        case 'recaptcha':
            return (
                <div className={`main-input-wrapper ${!block.sitekey ? 'recaptcha' : ''}`}>
                    {block.sitekey
                        ? 'reCAPTCHA has been successfully added to the form.'
                        : 'reCAPTCHA is not configured.'}
                </div>
            );

        // ==================== Address ====================
        case 'address':
            if (!AddressField) return null;
            return (
                <AddressField
                    formField={block}
                    opendInput={null}
                    setOpendInput={() => { }}
                />
            );

        // ==================== Title ====================
        case 'title':
            return null; // Title is handled separately

        // ==================== Default ====================
        default:
            return <div>Unknown block type: {(block as any).type}</div>;
    }
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
    BasicInput,
    MultipleOptions,
    TextArea,
    FileInput,
    AddressField,
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

            {/* FIELD CONTENT */}
            <section className="form-field-container-wrapper">
                {renderBlockContent(block, onChange, editable, {
                    BasicInput,
                    MultipleOptions,
                    TextArea,
                    FileInput,
                    AddressField,
                })}
            </section>
        </div>
    );
};

export default BlockRenderer;