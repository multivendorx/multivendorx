import React from 'react';
import { FieldComponent } from './types';
import { generateBlockStyles, BlockStyle } from './CanvasEditor/blockStyle';

// Unified interface that handles both types
export interface TextContentBlockData {
  id: number;
  type: 'richtext' | 'heading';
  // For richtext
  html?: string;
  // For heading
  text?: string;
  level?: 1 | 2 | 3;
  style?: BlockStyle;
}

// View Component - Renders the actual content
export const TextContentView: React.FC<{
  field: TextContentBlockData;
  onChange: (updates: Partial<TextContentBlockData>) => void;
  editable?: boolean;
}> = ({ field, onChange, editable = true }) => {
  if (!field) return null;

  const styles = generateBlockStyles(field.style, { includeText: true });

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (field.type === 'heading') {
      onChange({ text: e.currentTarget.textContent || '' });
    } else {
      onChange({ html: e.currentTarget.innerHTML });
    }
  };

  // Render heading
  if (field.type === 'heading') {
    const Tag = `h${field.level || 2}` as keyof JSX.IntrinsicElements;
    return (
      <Tag
        className="email-heading"
        style={styles}
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={handleBlur}
      >
        {field.text || 'Heading Text'}
      </Tag>
    );
  }

  // Render richtext
  return (
    <div
      className="email-text"
      style={styles}
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={handleBlur}
      dangerouslySetInnerHTML={{ __html: field.html || 'This is a demo text' }}
    />
  );
};

// Main Render Component - Matches FieldComponent interface
export const TextContentUI: React.FC<{
  field: TextContentBlockData;
  value?: any;
  onChange: (value: any) => void;
  canAccess?: boolean;
  appLocalizer?: any;
  modules?: string[];
  settings?: Record<string, any>;
  onOptionsChange?: (options: any[]) => void;
  onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}> = ({ field, onChange }) => {
  if (!field) return null;

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