import React from 'react';
import { FieldComponent } from './types';
import { generateBlockStyles, BlockStyle } from './block';

export interface DividerBlockData {
  id: number;
  type: 'divider';
  style?: BlockStyle;
}

// View Component
export const DividerView: React.FC<{
  field: DividerBlockData;
  onChange: (updates: Partial<DividerBlockData>) => void;
  editable?: boolean;
}> = ({ field, onChange, editable = true }) => {
  if (!field) return null;

  const styles = generateBlockStyles(field.style, { 
    includeText: false,
    includeDimensions: true 
  });

  return (
    <div className="email-divider-container">
      <hr
        className="email-divider"
        style={{
          ...styles,
          border: 'none',
          backgroundColor: field.style?.backgroundColor || '#cccccc',
          height: field.style?.height || '1px',
        }}
      />
    </div>
  );
};

// Main Render Component
export const DividerUI: React.FC<{
  field: DividerBlockData;
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

  const handleChange = (updates: Partial<DividerBlockData>) => {
    onChange(updates);
  };

  return (
    <DividerView
      field={field}
      onChange={handleChange}
      editable={true}
    />
  );
};

const Divider: FieldComponent = {
  render: DividerUI,
};

export default Divider;