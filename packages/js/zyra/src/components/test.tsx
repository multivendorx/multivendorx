import React from 'react';
import { Block, BlockPatch } from './types';
import {
    TextBlockView,
    HeadingBlockView,
    ButtonBlockView,
    DividerBlockView,
    ImageBlockView,
} from './BlockView';

// Block Component Interface
export interface BlockComponent {
    render: (props: {
        block: Block;
        onChange: (patch: BlockPatch) => void;
        editable?: boolean;
    }) => React.ReactNode;
}

// Simple Text Input Component
const TextInputBlock: BlockComponent = {
    render: ({ block }) => (
        <>
            <p>{block.label}</p>
            <input
                type={(block as any).type}
                placeholder={(block as any).placeholder || (block as any).type}
                className="basic-input"
                readOnly
            />
        </>
    ),
};

// Textarea Component
const TextAreaBlock: BlockComponent = {
    render: ({ block }) => (
        <>
            <p>{block.label}</p>
            <textarea
                placeholder={(block as any).placeholder || 'Enter text...'}
                className="basic-input"
                rows={(block as any).row || 4}
                cols={(block as any).column || 50}
                readOnly
            />
        </>
    ),
};

// Rich Text Component
const RichTextBlock: BlockComponent = {
    render: ({ block, onChange, editable = true }) => (
        <TextBlockView
            block={block as any}
            onChange={(html) => onChange({ html })}
            editable={editable}
        />
    ),
};

// Heading Component
const HeadingBlock: BlockComponent = {
    render: ({ block, onChange, editable = true }) => (
        <HeadingBlockView
            block={block as any}
            onChange={(text) => onChange({ text })}
            editable={editable}
        />
    ),
};

// Button Component
const ButtonBlock: BlockComponent = {
    render: ({ block, onChange, editable = true }) => (
        <ButtonBlockView
            block={block as any}
            onChange={(text) => onChange({ text })}
            editable={editable}
        />
    ),
};

// Divider Component
const DividerBlock: BlockComponent = {
    render: ({ block }) => <DividerBlockView block={block as any} />,
};

// Image Component
const ImageBlock: BlockComponent = {
    render: ({ block, onChange, editable = true }) => (
        <ImageBlockView
            block={block as any}
            onChange={(src) => onChange({ src })}
            editable={editable}
        />
    ),
};

// Selection Component (radio, dropdown, multiselect, checkboxes)
const SelectionBlock: BlockComponent = {
    render: ({ block }) => (
        <>
            <p>{block.label}</p>
            <div className="selection-options">
                {(block as any).options?.map((option: any) => (
                    <div key={option.id} className="option-item">
                        <input
                            type={(block as any).type === 'radio' ? 'radio' : 'checkbox'}
                            id={option.id}
                            name={block.name}
                            disabled
                        />
                        <label htmlFor={option.id}>{option.label}</label>
                    </div>
                ))}
            </div>
        </>
    ),
};

// Date Picker Component
const DatePickerBlock: BlockComponent = {
    render: ({ block }) => (
        <>
            <p>{block.label}</p>
            <input
                type="date"
                placeholder={(block as any).placeholder || 'Select date'}
                className="basic-input"
                readOnly
            />
        </>
    ),
};

// Time Picker Component
const TimePickerBlock: BlockComponent = {
    render: ({ block }) => (
        <>
            <p>{block.label}</p>
            <input
                type="time"
                placeholder={(block as any).placeholder || 'Select time'}
                className="basic-input"
                readOnly
            />
        </>
    ),
};

// Attachment Component
const AttachmentBlock: BlockComponent = {
    render: ({ block }) => (
        <>
            <p>{block.label}</p>
            <div className="attachment-input">
                <input type="file" className="basic-input" disabled />
                {(block as any).filesize && (
                    <small>Max file size: {(block as any).filesize}MB</small>
                )}
            </div>
        </>
    ),
};

// Section Component
const SectionBlock: BlockComponent = {
    render: ({ block }) => (
        <div className="section-header">
            <input
                type="text"
                value={block.label}
                placeholder={(block as any).placeholder || 'Section heading'}
                className="basic-input"
                readOnly
            />
        </div>
    ),
};

// Recaptcha Component
const RecaptchaBlock: BlockComponent = {
    render: ({ block }) => (
        <div className={`main-input-wrapper ${!(block as any).sitekey ? 'recaptcha' : ''}`}>
            {(block as any).sitekey
                ? 'reCAPTCHA has been successfully added to the form.'
                : 'reCAPTCHA is not configured.'}
        </div>
    ),
};

// Address Component
const AddressBlock: BlockComponent = {
    render: ({ block }) => (
        <>
            <p>{block.label}</p>
            <div className="address-fields">
                {(block as any).fields?.map((field: any) => (
                    <div key={field.id} className="address-field">
                        <label>{field.label}</label>
                        {field.type === 'select' ? (
                            <select className="basic-input" disabled>
                                {field.options?.map((opt: string) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                placeholder={field.placeholder}
                                className="basic-input"
                                readOnly
                            />
                        )}
                    </div>
                ))}
            </div>
        </>
    ),
};

// Title Component - returns null as it's handled separately
const TitleBlock: BlockComponent = {
    render: () => null,
};

// BLOCK REGISTRY - Maps block types to their components
export const BLOCK_REGISTRY: Record<string, BlockComponent> = {
    // Text inputs
    text: TextInputBlock,
    email: TextInputBlock,
    number: TextInputBlock,
    
    // Textarea
    textarea: TextAreaBlock,
    
    // Rich content
    richtext: RichTextBlock,
    heading: HeadingBlock,
    button: ButtonBlock,
    divider: DividerBlock,
    image: ImageBlock,
    
    // Selection fields
    radio: SelectionBlock,
    dropdown: SelectionBlock,
    multiselect: SelectionBlock,
    checkboxes: SelectionBlock,
    
    // Date & Time
    datepicker: DatePickerBlock,
    TimePicker: TimePickerBlock,
    
    // Advanced fields
    attachment: AttachmentBlock,
    section: SectionBlock,
    recaptcha: RecaptchaBlock,
    address: AddressBlock,
    
    // Special
    title: TitleBlock,
    
    // Columns is handled separately in BlockRenderer
};

// Helper function to get block component
export const getBlockComponent = (blockType: string): BlockComponent | undefined => {
    return BLOCK_REGISTRY[blockType];
};