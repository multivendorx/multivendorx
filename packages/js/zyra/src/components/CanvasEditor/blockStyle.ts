// External Dependencies
import React from 'react';

// Common Block Style Interface
export interface BlockStyle {
    // Color
    backgroundColor?: string;
    color?: string;
    borderColor?: string;

    // Spacing
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;

    // Border
    borderWidth?: number;
    borderStyle?: string;
    borderRadius?: number;

    // Text
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    fontWeight?: string;
    textDecoration?: string;

    // Alignment (image, button)
    align?: 'left' | 'center' | 'right';

    // Dimensions
    width?: string;
    height?: string | number;

    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
    gap?: number;
}

export const formatSpacing = (
    type: 'padding' | 'margin',
    style: BlockStyle
): string => {
    const top = style[`${type}Top`] ?? 0;
    const right = style[`${type}Right`] ?? 0;
    const bottom = style[`${type}Bottom`] ?? 0;
    const left = style[`${type}Left`] ?? 0;
    return `${top}rem ${right}rem ${bottom}rem ${left}rem`;
};

// Generate CSS properties for color styles
export const generateColorStyles = (
    style?: BlockStyle
): React.CSSProperties => {
    if (!style) {
        return {};
    }
    return {
        backgroundColor: style.backgroundColor,
        color: style.color,
    };
};

// Generate CSS properties for spacing styles
export const generateSpacingStyles = (
    style?: BlockStyle
): React.CSSProperties => {
    if (!style) {
        return {};
    }
    return {
        padding: formatSpacing('padding', style),
        margin: formatSpacing('margin', style),
    };
};

// Generate CSS properties for border styles
export const generateBorderStyles = (
    style?: BlockStyle
): React.CSSProperties => {
    if (!style) {
        return {};
    }
    return {
        borderWidth:
            style.borderWidth !== undefined
                ? `${style.borderWidth}rem`
                : undefined,
        borderColor: style.borderColor,
        borderStyle: style.borderStyle,
        borderRadius:
            style.borderRadius !== undefined
                ? `${style.borderRadius}rem`
                : undefined,
    };
};

// Generate CSS properties for text styles
export const generateTextStyles = (style?: BlockStyle): React.CSSProperties => {
    if (!style) {
        return {};
    }
    return {
        textAlign: style.textAlign,
        fontSize:
            style.fontSize !== undefined ? `${style.fontSize}rem` : undefined,
        fontFamily: style.fontFamily,
        lineHeight: style.lineHeight,
        fontWeight: style.fontWeight,
        textDecoration: style.textDecoration,
    };
};

// Generate CSS properties for dimension styles
export const generateDimensionStyles = (
    style?: BlockStyle
): React.CSSProperties => {
    if (!style) {
        return {};
    }
    return {
        width: style.width,
        height: style.height,
    };
};
// Generate CSS properties for column layout styles
export const generateColumnStyles = (
    style?: BlockStyle
): React.CSSProperties => {
    if (!style) {
        return {};
    }
    return {
        justifyContent: style.justifyContent,
    };
};
// Generate complete block styles Combines all style categories
export const generateBlockStyles = (
    style?: BlockStyle,
    options: {
        includeText?: boolean;
        includeDimensions?: boolean;
    } = {}
): React.CSSProperties => {
    if (!style) {
        return {};
    }
    const { includeText = true, includeDimensions = true } = options;

    return {
        ...generateColorStyles(style),
        ...generateSpacingStyles(style),
        ...generateBorderStyles(style),
        ...(includeText ? generateTextStyles(style) : {}),
        ...(includeDimensions ? generateDimensionStyles(style) : {}),
        ...generateColumnStyles(style),
    };
};

// Default style values for new blocks
export const DEFAULT_BLOCK_STYLES: Partial<BlockStyle> = {
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 16,
    lineHeight: 1.5,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
};

// Style presets for specific block types
export const BLOCK_STYLE_PRESETS = {
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 1.2,
    },
    button: {
        backgroundColor: '#007bff',
        color: '#ffffff',
        fontSize: 1,
        fontWeight: 'bold',
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 10,
        paddingLeft: 20,
        borderRadius: 5,
        align: 'center' as const,
    },
    image: {
        align: 'center' as const,
    },
};
