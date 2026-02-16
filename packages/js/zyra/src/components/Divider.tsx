// External Dependencies
import React from 'react';

// Internal Dependencies
import { FieldComponent } from './types';
import { generateBlockStyles, BlockStyle } from './CanvasEditor/blockStyle';

export interface DividerBlockData {
  id: number;
  type: 'divider';
  style?: BlockStyle;
}

// Default divider styles to ensure visibility
const DEFAULT_DIVIDER_STYLES: Partial<BlockStyle> = {
  backgroundColor: '#000000ff',
  height: 1,
  marginTop: 10,
  marginBottom: 10,
  width: '100%',
};

// View Component - Pure rendering logic
export const DividerView: React.FC<{
  block: DividerBlockData;
}> = ({ block }) => {
  if (!block) return null;

  // Merge default divider styles with block styles
  const mergedStyles = {
    ...DEFAULT_DIVIDER_STYLES,
    ...block.style,
  };

  const styles = generateBlockStyles(mergedStyles, { 
    includeText: false,
    includeDimensions: true 
  });

  return (
    <div className="email-divider-container" style={{ width: '100%' }}>
      <hr
        className="email-divider"
        style={{
          ...styles,
          border: 'none',
          backgroundColor: mergedStyles.backgroundColor,
          height: typeof mergedStyles.height === 'number' 
            ? `${mergedStyles.height}px` 
            : mergedStyles.height || '1px',
          margin: 0, // Reset margin as it's handled by generateBlockStyles
        }}
      />
    </div>
  );
};

// Main Render Component - Follows FieldComponent pattern
export const DividerUI: React.FC<{
  field: DividerBlockData;  // The block data from BlockRenderer
  value?: any;              // Not used but kept for compatibility
  onChange: (value: any) => void;
  canAccess?: boolean;
  appLocalizer?: any;
  modules?: string[];
  settings?: Record<string, any>;
  onOptionsChange?: (options: any[]) => void;
  onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}> = ({ field }) => {
  // Early return if no field data
  if (!field || field.type !== 'divider') {
    return null;
  }

  return <DividerView block={field} />;
};

const Divider: FieldComponent = {
  render: DividerUI,
  validate: (field, value) => {
    return null;
  },
};

export default Divider;