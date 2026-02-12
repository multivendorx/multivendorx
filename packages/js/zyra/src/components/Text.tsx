import React, { useState } from 'react';
import StyleControls from './StyleControl';
import { FieldComponent } from './types';

// Types
export interface TextBlockStyle {
  backgroundColor?: string;
  padding?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: string;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  lineHeight?: number;
  fontWeight?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: number;
  width?: string;
  height?: string;
  textDecoration?: string;
}

export interface TextBlockData {
  id: number;
  type: 'richtext'; // Using 'richtext' type to match blockTypes.ts
  html: string;
  style?: TextBlockStyle;
}

// Style Utilities
const formatSpacing = (
  type: 'padding' | 'margin',
  style?: TextBlockStyle
): string | undefined => {
  if (!style) return undefined;
  
  const top = style[`${type}Top`];
  const right = style[`${type}Right`];
  const bottom = style[`${type}Bottom`];
  const left = style[`${type}Left`];
  
  if (top !== undefined || right !== undefined || bottom !== undefined || left !== undefined) {
    return `${top || 0}px ${right || 0}px ${bottom || 0}px ${left || 0}px`;
  }
  
  return style[type];
};

const generateTextStyles = (style?: TextBlockStyle): React.CSSProperties => {
  if (!style) return {};
  
  return {
    backgroundColor: style.backgroundColor,
    padding: formatSpacing('padding', style),
    margin: formatSpacing('margin', style),
    textAlign: style.textAlign,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.color,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    borderRadius: style.borderRadius,
    width: style.width,
    height: style.height,
    textDecoration: style.textDecoration,
  };
};

// View Component
export const TextView: React.FC<{
  field: TextBlockData;
  onChange: (html: string) => void;
  editable?: boolean;
}> = ({ field, onChange, editable = true }) => {
  if (!field) return null;

  const styles = generateTextStyles(field.style);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div
      className="email-text"
      style={styles}
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={handleBlur}
      dangerouslySetInnerHTML={{ __html: field.html }}
    />
  );
};

// Settings Component - Used by SettingMetaBox
export const TextBlockSettings: React.FC<{
  formField: TextBlockData;
  onChange: (key: string, value: any) => void;
}> = ({ formField, onChange }) => {
  // Local state for expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    text: false,
    background: false,
    spacing: false,
    border: false,
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleStyleChange = (style: TextBlockStyle) => {
    onChange('style', style);
  };

  const handleHtmlChange = (html: string) => {
    onChange('html', html);
  };

  return (
    <>
      {/* Content Settings - Simple text input for HTML content */}
      <div className="setting-group">
        <div 
          className="setting-group-header" 
          onClick={() => toggleGroup('text')}
        >
          <h4>Text Content</h4>
          <i className={`adminfont-${expandedGroups.text ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
        </div>
        {expandedGroups.text && (
          <div className="setting-group-content">
            <div className="field-wrapper">
              <label>HTML Content</label>
              <textarea
                value={formField.html || ''}
                onChange={(e) => handleHtmlChange(e.target.value)}
                className="basic-input"
                placeholder="Enter HTML content"
                rows={6}
                style={{ fontFamily: 'monospace', width: '100%' }}
              />
              <p className="settings-metabox-description">
                You can use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Style Controls */}
      <div onClick={(e) => e.stopPropagation()}>
        <StyleControls 
          style={formField.style || {}} 
          onChange={handleStyleChange} 
          includeTextStyles={true} 
        />
      </div>
    </>
  );
};

// Main Render Component - Matches FieldComponent interface
export const TextBlockUI: React.FC<{
  field: TextBlockData;
  value?: string;
  onChange: (value: any) => void;
  canAccess?: boolean;
  appLocalizer?: any;
  modules?: string[];
  settings?: Record<string, any>;
  onOptionsChange?: (options: any[]) => void;
  onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}> = ({ field, onChange }) => {
  if (!field) return null;

  const handleHtmlChange = (html: string) => {
    onChange({ html });
  };

  const handleStyleChange = (style: TextBlockStyle) => {
    onChange({ style });
  };

  return (
    <TextView
      field={field}
      onChange={handleHtmlChange}
      editable={true}
    />
  );
};

// Factory function - Matches createBlock in blockCore.ts
export const createTextBlock = (
  id: number = Date.now(),
  html: string = '<p>Your text here. Click to edit.</p>'
): TextBlockData => ({
  id,
  type: 'richtext',
  html,
  style: {
    fontSize: 16,
    lineHeight: 1.5,
    color: '#000000',
    textAlign: 'left',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 'normal',
    textDecoration: 'none',
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: '#000000',
    borderRadius: 0,
  },
});

// Default export - For FieldRegistry
const TextBlock: FieldComponent = {
  render: TextBlockUI,
};

export default TextBlock;