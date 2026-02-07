import React from 'react';
import {
    TextBlock,
    TextAreaBlock,
    RichTextBlock,
    HeadingBlock,
    ImageBlock,
    ButtonBlock,
    DividerBlock,
    BlockStyle,
} from './types';

// Helper Functions

// Convert block style to CSS style object
const convertBlockStyleToCSS = (style?: BlockStyle): React.CSSProperties => {
    if (!style) return {};

    return {
        backgroundColor: style.backgroundColor,
        padding: style.padding ||
            (style.paddingTop || style.paddingRight || style.paddingBottom || style.paddingLeft
                ? `${style.paddingTop || 0}px ${style.paddingRight || 0}px ${style.paddingBottom || 0}px ${style.paddingLeft || 0}px`
                : undefined),
        margin: style.margin ||
            (style.marginTop || style.marginRight || style.marginBottom || style.marginLeft
                ? `${style.marginTop || 0}px ${style.marginRight || 0}px ${style.marginBottom || 0}px ${style.marginLeft || 0}px`
                : undefined),
        textAlign: style.textAlign as any,
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        fontFamily: style.fontFamily,
        color: style.color,
        lineHeight: style.lineHeight,
        fontWeight: style.fontWeight,
        borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
        borderColor: style.borderColor,
        borderStyle: style.borderStyle as any,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        width: style.width,
        height: style.height,
        textDecoration: style.textDecoration,
    };
};

// Text Block View
interface TextBlockViewProps {
    block: RichTextBlock;
    onChange: (html: string) => void;
    editable?: boolean;
}

export const TextBlockView: React.FC<TextBlockViewProps> = ({
    block,
    onChange,
    editable = true
}) => {
    const style = convertBlockStyleToCSS(block.style);

    return (
        <div
            className="email-text"
            style={style}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => editable && onChange(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: block.html }}
        />
    );
};

// Heading Block View

interface HeadingBlockViewProps {
    block: HeadingBlock;
    onChange: (text: string) => void;
    editable?: boolean;
}

export const HeadingBlockView: React.FC<HeadingBlockViewProps> = ({
    block,
    onChange,
    editable = true
}) => {
    const style = convertBlockStyleToCSS(block.style);
    const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;

    return (
        <Tag
            className="email-heading"
            style={style}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => editable && onChange(e.currentTarget.textContent || '')}
        >
            {block.text}
        </Tag>
    );
};

// Button Block View
interface ButtonBlockViewProps {
    block: ButtonBlock;
    onChange: (text: string) => void;
    editable?: boolean;
}

export const ButtonBlockView: React.FC<ButtonBlockViewProps> = ({
    block,
    onChange,
    editable = true
}) => {
    const buttonStyle: React.CSSProperties = {
        backgroundColor: block.style?.backgroundColor || '#007bff',
        color: block.style?.color || '#ffffff',
        padding: block.style?.padding ||
            (block.style?.paddingTop || block.style?.paddingRight || block.style?.paddingBottom || block.style?.paddingLeft
                ? `${block.style?.paddingTop || 10}px ${block.style?.paddingRight || 20}px ${block.style?.paddingBottom || 10}px ${block.style?.paddingLeft || 20}px`
                : '10px 20px'),
        margin: block.style?.margin ||
            (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
                ? `${block.style?.marginTop || 0}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 0}px ${block.style?.marginLeft || 0}px`
                : undefined),
        borderWidth: block.style?.borderWidth ? `${block.style.borderWidth}px` : undefined,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle as any,
        borderRadius: block.style?.borderRadius ? `${block.style.borderRadius}px` : '5px',
        fontSize: block.style?.fontSize ? `${block.style.fontSize}px` : '16px',
        fontFamily: block.style?.fontFamily || 'Arial',
        fontWeight: block.style?.fontWeight || 'bold',
        textAlign: 'center',
        display: 'inline-block',
        textDecoration: block.style?.textDecoration || 'none',
        cursor: 'pointer',
    };

    const wrapperStyle: React.CSSProperties = {
        textAlign: (block.style?.align || block.style?.textAlign || 'center') as any,
    };

    return (
        <div className="email-button-wrapper" style={wrapperStyle}>
            <a
                href={block.url || '#'}
                className="email-button"
                style={buttonStyle}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => editable && onChange(e.currentTarget.textContent || '')}
            >
                {block.text}
            </a>
        </div>
    );
};

// Divider Block View

interface DividerBlockViewProps {
    block: DividerBlock;
}

export const DividerBlockView: React.FC<DividerBlockViewProps> = ({ block }) => {
    const style: React.CSSProperties = {
        height: block.style?.height || '1px',
        backgroundColor: block.style?.backgroundColor || block.style?.color || '#cccccc',
        margin: block.style?.margin ||
            (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
                ? `${block.style?.marginTop || 20}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 20}px ${block.style?.marginLeft || 0}px`
                : '20px 0'),
        padding: block.style?.padding,
        borderWidth: block.style?.borderWidth ? `${block.style.borderWidth}px` : undefined,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle as any,
        borderRadius: block.style?.borderRadius ? `${block.style.borderRadius}px` : undefined,
        width: block.style?.width || '100%',
    };

    return <hr className="email-divider" style={style} />;
};

// Image Block View

interface ImageBlockViewProps {
    block: ImageBlock;
    onChange: (src: string) => void;
    editable?: boolean;
}

export const ImageBlockView: React.FC<ImageBlockViewProps> = ({
    block,
    onChange,
    editable = true
}) => {
    const wrapperStyle: React.CSSProperties = {
        backgroundColor: block.style?.backgroundColor,
        padding: block.style?.padding ||
            (block.style?.paddingTop || block.style?.paddingRight || block.style?.paddingBottom || block.style?.paddingLeft
                ? `${block.style?.paddingTop || 0}px ${block.style?.paddingRight || 0}px ${block.style?.paddingBottom || 0}px ${block.style?.paddingLeft || 0}px`
                : undefined),
        margin: block.style?.margin ||
            (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
                ? `${block.style?.marginTop || 0}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 0}px ${block.style?.marginLeft || 0}px`
                : undefined),
        textAlign: (block.style?.align || 'center') as any,
    };

    const imageStyle: React.CSSProperties = {
        borderWidth: block.style?.borderWidth ? `${block.style.borderWidth}px` : undefined,
        borderColor: block.style?.borderColor,
        borderStyle: block.style?.borderStyle as any,
        borderRadius: block.style?.borderRadius ? `${block.style.borderRadius}px` : undefined,
        width: block.style?.width || 'auto',
        height: block.style?.height || 'auto',
        maxWidth: '100%',
    };

    return (
        <div className="email-image" style={wrapperStyle}>
            {block.src ? (
                <img src={block.src} alt={block.alt || ''} style={imageStyle} />
            ) : (
                editable && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = URL.createObjectURL(file);
                            onChange(url);
                        }}
                    />
                )
            )}
        </div>
    );
};
