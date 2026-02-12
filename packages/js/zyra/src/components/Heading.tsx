import React, { useState } from 'react';
import ToggleSetting from './ToggleSetting';
import { FieldComponent } from './types';

// Types
export interface HeadingBlockStyle {
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

export interface HeadingBlockData {
  id: number;
  type: 'heading';
  text: string;
  level: 1 | 2 | 3;
  style?: HeadingBlockStyle;
}

// Style Utilities
const formatSpacing = (
  type: 'padding' | 'margin',
  style?: HeadingBlockStyle
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

const generateHeadingStyles = (style?: HeadingBlockStyle): React.CSSProperties => {
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
export const HeadingBlockView: React.FC<{
  field: HeadingBlockData;
  onChange: (text: string) => void;
  editable?: boolean;
}> = ({ field, onChange, editable = true }) => {
  // Guard clause
  if (!field) return null;

  const styles = generateHeadingStyles(field.style);
  const Tag = `h${field.level}` as keyof JSX.IntrinsicElements;

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    onChange(e.currentTarget.textContent || '');
  };

  return (
    <Tag
      className="email-heading"
      style={styles}
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={handleBlur}
    >
      {field.text}
    </Tag>
  );
};

// Settings Component - This is used by SettingMetaBox
export const HeadingBlockSettings: React.FC<{
  formField: HeadingBlockData;
  onChange: (key: string, value: any) => void;
  expandedGroups: Record<string, boolean>;
  toggleGroup: (group: string) => void;
}> = ({ formField, onChange, expandedGroups, toggleGroup }) => {
  return (
    <>
      {/* Content Settings */}
      <div className="setting-group">
        <div 
          className="setting-group-header" 
          onClick={() => toggleGroup('heading')}
        >
          <h4>Heading Content</h4>
          <i className={`adminfont-${expandedGroups.heading ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
        </div>
        {expandedGroups.heading && (
          <div className="setting-group-content">
            <div className="field-wrapper">
              <label>Heading Text</label>
              <input
                type="text"
                value={formField.text || ''}
                onChange={(e) => onChange('text', e.target.value)}
                className="basic-input"
                placeholder="Enter heading text"
              />
            </div>
            <div className="field-wrapper">
              <label>Heading Level</label>
              <ToggleSetting
                options={[
                  { key: 'h1', value: 1, label: 'H1' },
                  { key: 'h2', value: 2, label: 'H2' },
                  { key: 'h3', value: 3, label: 'H3' },
                ]}
                value={formField.level || 2}
                onChange={(value) => onChange('level', value)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Main Render Component - Matches FieldComponent interface
export const HeadingBlockUI: React.FC<{
  field: HeadingBlockData;
  value?: string;
  onChange: (value: any) => void;
  canAccess?: boolean;
  appLocalizer?: any;
  modules?: string[];
  settings?: Record<string, any>;
  onOptionsChange?: (options: any[]) => void;
  onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}> = ({ field, onChange }) => {
  // Guard clause
  if (!field) return null;

  const handleTextChange = (text: string) => {
    onChange({ text });
  };

  return (
    <HeadingBlockView
      field={field}
      onChange={handleTextChange}
      editable={true}
    />
  );
};

// Factory function - Matches createBlock in blockCore.ts
export const createHeadingBlock = (
  id: number = Date.now(),
  text: string = 'Heading',
  level: 1 | 2 | 3 = 2
): HeadingBlockData => ({
  id,
  type: 'heading',
  text,
  level,
  style: {
    fontSize: level === 1 ? 32 : level === 2 ? 24 : 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left',
    lineHeight: level === 1 ? 1.2 : 1.3,
    fontFamily: 'Arial, Helvetica, sans-serif',
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

// Default export - Matches FieldComponent interface
const HeadingBlock: FieldComponent = {
  render: HeadingBlockUI,
};

export default HeadingBlock;