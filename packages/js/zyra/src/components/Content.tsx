import React, { JSX } from 'react';
import { FieldComponent } from './fieldUtils';
import { generateBlockStyles, BlockStyle } from './CanvasEditor/blockStyle';

// Unified interface that handles both types
export interface TextContentBlockData {
    id: number;
    type: 'richtext' | 'heading' | 'title';
    // For richtext
    html?: string;
    // For heading
    text?: string;
    level?: 1 | 2 | 3;
    style?: BlockStyle;
    checked?: boolean;
    required?: boolean;
    context?: string;
}

// View Component - Renders the actual content
export const TextContentView: React.FC<{
    field: TextContentBlockData;
    onChange: (updates: Partial<TextContentBlockData>) => void;
    editable?: boolean;
}> = ({ field, onChange, editable = true }) => {
    if (!field) {
        return null;
    }

    const styles = generateBlockStyles(field.style, { includeText: true });

    const enhancedStyles = {
        ...styles,
        textAlign: field.style?.textAlign || 'left',
        display: 'block',
        width: '100%',
    };

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
        if (field.type === 'heading' || field.type === 'title') {
            onChange({ text: e.currentTarget.textContent || '' });
        } else {
            onChange({ html: e.currentTarget.innerHTML });
        }
    };

    // Render heading
    if (field.type === 'heading' || field.type === 'title') {
        const Tag = `h${field.level || 2}` as keyof JSX.IntrinsicElements;
        return (
            <Tag
                className="email-heading"
                style={enhancedStyles}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={handleBlur}
            >
                {field.text || 'Heading Text'}
            </Tag>
        );
    }

    if (field.context === 'form') {
        return (
            <label className="terms-checkbox">
                <input
                    type="checkbox"
                    checked={field.checked || false}
                />

                <div
                className="email-text"
                style={enhancedStyles}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => {
                    onChange({
                        html: e.currentTarget.innerHTML,
                    });
                }}
                dangerouslySetInnerHTML={{
                    __html:
                        field.html ||
                        'I agree to the <a href="#">Terms & Conditions</a>',
                }}
            />
            </label>
        );
    }

    // Render richtext
    return (
        <div
            className="email-text"
            style={enhancedStyles}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={handleBlur}
            dangerouslySetInnerHTML={{
                __html: field.html || 'This is a demo text',
            }}
        />
    );
};

// Main Render Component - Matches FieldComponent interface
export const TextContentUI: React.FC<{
    field: TextContentBlockData;
    value?: Partial<TextContentBlockData>;
    onChange: (value: Partial<TextContentBlockData>) => void;
    canAccess?: boolean;
    modules?: string[];
    settings?: Record<string, string | number | boolean | null>;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}> = ({ field, onChange }) => {
    if (!field) {
        return null;
    }

    const handleChange = (updates: Partial<TextContentBlockData>) => {
        onChange(updates);
    };

    return (
        <TextContentView
            field={field}
            onChange={handleChange}
            editable={true}
        />
    );
};

// Default export - For FieldRegistry
const Content: FieldComponent = {
    render: TextContentUI,
};

export default Content;
