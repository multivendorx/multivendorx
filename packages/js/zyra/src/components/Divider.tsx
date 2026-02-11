import React from 'react';
import { FieldComponent } from './types';

export interface DividerBlockStyle {
  backgroundColor?: string;
  padding?: number | string;
  margin?: number | string;
  height?: string;
  width?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: number;
  opacity?: number;
}

export interface DividerBlockProps {
  style?: DividerBlockStyle;
  className?: string;
}

const DEFAULT_STYLES: DividerBlockStyle = {
  height: '1px',
  backgroundColor: '#cccccc',
  margin: '20px 0',
  width: '100%',
  opacity: 1,
};

export const DividerBlock: React.FC<DividerBlockProps> = ({
  style = {},
  className = '',
}) => {
  // Merge default styles with provided styles
  const mergedStyle = {
    ...DEFAULT_STYLES,
    ...style,
  };

  // Build the style object
  const dividerStyle: React.CSSProperties = {
    backgroundColor: mergedStyle.backgroundColor,
    margin: mergedStyle.margin,
    padding: mergedStyle.padding,
    width: mergedStyle.width,
    height: mergedStyle.height,
    opacity: mergedStyle.opacity,
    borderWidth: mergedStyle.borderWidth,
    borderColor: mergedStyle.borderColor,
    borderStyle: mergedStyle.borderStyle,
    borderRadius: mergedStyle.borderRadius,
  };

  // Clean up undefined values
  Object.keys(dividerStyle).forEach(key => {
    if (dividerStyle[key as keyof React.CSSProperties] === undefined) {
      delete dividerStyle[key as keyof React.CSSProperties];
    }
  });

  return (
    <hr
      className={`divider-block ${className}`}
      style={dividerStyle}
    />
  );
};

export const useDividerBlock = () => {
  const createDividerBlock = (
    customStyles?: DividerBlockStyle,
  ) => ({
    id: Date.now(),
    type: 'divider' as const,
    style: {
      ...customStyles,
    },
  });

  return { createDividerBlock };
};

const Divider: FieldComponent = {
    render: DividerBlock,
}

export default Divider;