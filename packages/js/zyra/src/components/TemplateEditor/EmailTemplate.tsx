import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';
import '../../styles/web/Emailtemplate.scss';
import ToggleSetting from '../ToggleSetting';

export type EmailBlock =
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | ColumnsBlock
  | HeadingBlock;

type EmailBlockPatch<T extends EmailBlock = EmailBlock> =
  Omit<Partial<T>, 'type' | 'id'>;

interface BaseBlock {
  id: number;
  type: string;
}

// EmailBlockSettings.tsx
interface EmailBlockSettingsProps {
  block: EmailBlock;
  onChange: (patch: EmailBlockPatch) => void;
}

interface BlockStyle {
  backgroundColor?: string;
  padding?: number | string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: number | string;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  textAlign?: 'left' | 'center' | 'right';
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
  align?: 'left' | 'center' | 'right'; // For button alignment
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  html: string;
  style?: BlockStyle;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  text: string;
  level: 1 | 2 | 3;
  style?: BlockStyle;
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  text: string;
  url?: string;
  style?: BlockStyle;
}

export interface ColumnsBlock extends BaseBlock {
  type: 'columns';
  layout: '1' | '2-50' | '2-66' | '3' | '4';
  columns: EmailBlock[][];
  style?: BlockStyle;
}
export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt?: string;
  style?: BlockStyle;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  style?: BlockStyle;
}
export interface EmailTemplate {
  id: string;
  name: string;
  // subject: string;
  previewText?: string;
  blocks: EmailBlock[];
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // -------------------------
  // ORDER PLACED (existing)
  // -------------------------
  {
    id: 'order-placed',
    name: 'Template 1',
    // subject: 'Order Successfully Placed',
    previewText: 'Your order has been received',
    blocks: [
      {
        id: 1,
        type: 'heading',
        text: 'Order Confirmation',
        level: 2,
      },
      {
        id: 2,
        type: 'text',
        html: `
          <p>Dear Customer,</p>
          <p>
            We are pleased to inform you that your order has been placed
            successfully. Our team will begin processing the order shortly.
          </p>
          <p>Thank you for choosing our service.</p>
        `,
      },
      { id: 3, type: 'divider' },
      {
        id: 4,
        type: 'text',
        html: `
          <p><strong>Order Number:</strong> {{order_id}}</p>
          <p><strong>Order Date:</strong> {{order_date}}</p>
        `,
      },
      {
        id: 5,
        type: 'button',
        text: 'View Order Details',
        url: '{{order_url}}',
      },
    ],
  },
  // -------------------------
  // ORDER SHIPPED
  // -------------------------
  {
    id: 'order-shipped',
    name: 'Template 2',
    previewText: 'Your order is on the way',
    blocks: [
      {
        id: 1,
        type: 'heading',
        text: 'Order Shipped',
        level: 2,
      },
      {
        id: 2,
        type: 'text',
        html: `
          <p>Dear Customer,</p>
          <p>
            We are happy to inform you that your order has been shipped
            and is currently in transit.
          </p>
        `,
      },
      {
        id: 3,
        type: 'text',
        html: `
          <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
          <p><strong>Courier:</strong> {{shipping_provider}}</p>
        `,
      },
      {
        id: 4,
        type: 'button',
        text: 'Track Your Order',
        url: '{{tracking_url}}',
      },
    ],
  },
];

// style 
const StyleControls = ({
  style = {},
  onChange,
  includeTextStyles = true,
}: {
  style?: any;
  onChange: (style: any) => void;
  includeTextStyles?: boolean;
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    background: true,
    spacing: false,
    border: false,
    text: false,
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <>
      {/* Text Styles - Conditionally included */}
      {includeTextStyles && (
        <div className="setting-group">
          <div className="setting-group-header" onClick={() => toggleGroup('text')}>
            <h4>
              Text
            </h4>
            <i className={` adminfont-${expandedGroups.text ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
          </div>
          {expandedGroups.text && (
            <div className="setting-group-content">

              {/* text align */}
              <div className="field-wrapper">
                <label>Text Align</label>
                <ToggleSetting
                  options={[
                    {
                      key: 'left',
                      value: 'left',
                      icon: 'adminfont-left-align'
                    },
                    {
                      key: 'center',
                      value: 'center',
                      icon: 'adminfont-center-align'
                    },
                    {
                      key: 'right',
                      value: 'right',
                      icon: 'adminfont-right-align'
                    },
                    {
                      key: 'justify',
                      value: 'justify',
                      icon: 'adminfont-justify-align'
                    },
                  ]}
                  value={style.textAlign || 'left'}
                  onChange={(value) =>
                    onChange({ ...style, textAlign: value as 'left' | 'center' | 'right' | 'justify' })
                  }
                />
              </div>

              {/* font-size */}
              <div className="field-group">
                <div className="field-wrapper">
                  <label>Font Size (px)</label>
                  <input
                    type="number"
                    min={8}
                    max={72}
                    value={style.fontSize || 16}
                    className="basic-input"
                    onChange={(e) =>
                      onChange({ ...style, fontSize: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="field-wrapper">
                  <label>Line Height</label>
                  <input
                    type="number"
                    min={1}
                    max={3}
                    step={0.1}
                    value={style.lineHeight || 1.5}
                    className="basic-input"
                    onChange={(e) =>
                      onChange({ ...style, lineHeight: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/*  font weighe and  family*/}
              <div className="field-group">
                <div className="field-wrapper">
                  <label>Font Weight</label>
                  <select
                    value={style.fontWeight || 'normal'}
                    className="basic-input"
                    onChange={(e) =>
                      onChange({ ...style, fontWeight: e.target.value })
                    }
                  >
                    <option value="300">Light (300)</option>
                    <option value="normal">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="bold">Bold (700)</option>
                  </select>
                </div>
                {/* <div className="field-wrapper">
                  <label>Font Family</label>
                  <input
                    type="text"
                    value={style.fontFamily || 'Arial'}
                    className="basic-input"
                    onChange={(e) =>
                      onChange({ ...style, fontFamily: e.target.value })
                    }
                  />
                </div> */}
                <div className="field-wrapper">
                  <label>Text Decoration</label>
                  <select
                    value={style.textDecoration || 'none'}
                    className="basic-input"
                    onChange={(e) =>
                      onChange({ ...style, textDecoration: e.target.value })
                    }
                  >
                    <option value="none">None</option>
                    <option value="underline">Underline</option>
                    <option value="overline">Overline</option>
                    <option value="line-through">Line Through</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Background Group */}
      <div className="setting-group">
        <div className="setting-group-header" onClick={() => toggleGroup('background')}>
          <h4>
            Color
          </h4>
          <i className={` adminfont-${expandedGroups.background ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
        </div>

        {expandedGroups.background && (
          <div className="setting-group-content">
            <div className="field-group">
              <div className="field-wrapper">
                <label>Background Color</label>
                <input
                  type="color"
                  className="basic-input"
                  value={style.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    onChange({ ...style, backgroundColor: e.target.value })
                  }
                />
              </div>

              <div className="field-wrapper">
                <label>Text Color</label>
                <input
                  type="color"
                  value={style.color || '#000000'}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, color: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Padding & Margin Group */}
      <div className="setting-group">
        <div className="setting-group-header" onClick={() => toggleGroup('spacing')}>
          <h4>
            Spacing
          </h4>
          <i className={` adminfont-${expandedGroups.spacing ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
        </div>
        {expandedGroups.spacing && (
          <div className="setting-group-content">
            <div className="spacing-grid">
              {/* Padding */}
              <div className="spacing-section">
                <h5>Padding</h5>
                <div className="spacing-controls">
                  <div className="spacing-input">
                    <input
                      type="number"
                      min={0}
                      value={style.paddingTop ?? 0}
                      className="basic-input"
                      onChange={(e) =>
                        onChange({ ...style, paddingTop: Number(e.target.value) })
                      }
                    />
                    <label>Top</label>
                  </div>
                  <div className="spacing-input">
                    <input
                      type="number"
                      min={0}
                      value={style.paddingRight ?? 0}
                      className="basic-input"
                      onChange={(e) =>
                        onChange({ ...style, paddingRight: Number(e.target.value) })
                      }
                    />
                    <label>Right</label>
                  </div>
                  <div className="spacing-input">
                    <input
                      type="number"
                      min={0}
                      value={style.paddingBottom ?? 0}
                      className="basic-input"
                      onChange={(e) =>
                        onChange({ ...style, paddingBottom: Number(e.target.value) })
                      }
                    />
                    <label>Bottom</label>
                  </div>
                  <div className="spacing-input">
                    <input
                      type="number"
                      min={0}
                      value={style.paddingLeft ?? 0}
                      className="basic-input"
                      onChange={(e) =>
                        onChange({ ...style, paddingLeft: Number(e.target.value) })
                      }
                    />
                    <label>Left</label>
                  </div>
                </div>
              </div>

              {/* Margin */}
              <div className="spacing-section">
                <h5>Margin</h5>
                <div className="spacing-controls">
                  <div className="spacing-input">
                    <input
                      type="number"
                      min={0}
                      value={style.marginTop ?? 0}
                      className="basic-input"
                      onChange={(e) =>
                        onChange({ ...style, marginTop: Number(e.target.value) })
                      }
                    />
                    <label>Top</label>
                  </div>
                  <div className="spacing-input">
                    <input
                      type="number"
                      min={0}
                      value={style.marginRight ?? 0}
                      className="basic-input"
                      onChange={(e) =>
                        onChange({ ...style, marginRight: Number(e.target.value) })
                      }
                    />
                    <label>Right</label>
                  </div>
                  <div className="spacing-input">

                    <input
                      type="number"
                      min={0}
                      value={style.marginBottom ?? 0}
                      className="basic-input"
                      onChange={(e) =>
                        onChange({ ...style, marginBottom: Number(e.target.value) })
                      }
                    />
                    <label>Bottom</label>
                  </div>
                  <div className="spacing-input">
                    <input
                      type="number"
                      min={0}
                      value={style.marginLeft ?? 0}
                      className="basic-input"
                      onChange={(e) =>
                        onChange({ ...style, marginLeft: Number(e.target.value) })
                      }
                    />
                    <label>Left</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Border Group */}
      <div className="setting-group">
        <div className="setting-group-header" onClick={() => toggleGroup('border')}>
          <h4>
            Border
          </h4>
          <i className={` adminfont-${expandedGroups.border ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
        </div>
        {expandedGroups.border && (
          <div className="setting-group-content">
            <div className="field-group">
              <div className="field-wrapper">
                <label>Border Width (px)</label>
                <input
                  type="number"
                  min={0}
                  value={style.borderWidth ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, borderWidth: Number(e.target.value) })
                  }
                />
              </div>
              <div className="field-wrapper">
                <label>Border Radius (px)</label>
                <input
                  type="number"
                  min={0}
                  value={style.borderRadius ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, borderRadius: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="field-group">
              <div className="field-wrapper">
                <label>Border Style</label>
                <select
                  value={style.borderStyle || 'solid'}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, borderStyle: e.target.value })
                  }
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="field-wrapper">
                <label>Border Color</label>
                <input
                  type="color"
                  value={style.borderColor || '#000000'}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, borderColor: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// padding setttings
const PaddingMarginControls = ({
  style = {},
  onChange,
}: {
  style?: any;
  onChange: (style: any) => void;
}) => (
  <>
    <div className="field-wrapper">
      <label>Padding Top (px)</label>
      <input
        type="number"
        min={0}
        value={style.paddingTop ?? 0}
        className="basic-input"
        onChange={(e) =>
          onChange({ ...style, paddingTop: Number(e.target.value) })
        }
      />
    </div>
    <div className="field-wrapper">
      <label>Padding Right (px)</label>
      <input
        type="number"
        min={0}
        value={style.paddingRight ?? 0}
        className="basic-input"
        onChange={(e) =>
          onChange({ ...style, paddingRight: Number(e.target.value) })
        }
      />
    </div>
    <div className="field-wrapper">
      <label>Padding Bottom (px)</label>
      <input
        type="number"
        min={0}
        value={style.paddingBottom ?? 0}
        className="basic-input"
        onChange={(e) =>
          onChange({ ...style, paddingBottom: Number(e.target.value) })
        }
      />
    </div>
    <div className="field-wrapper">
      <label>Padding Left (px)</label>
      <input
        type="number"
        min={0}
        value={style.paddingLeft ?? 0}
        className="basic-input"
        onChange={(e) =>
          onChange({ ...style, paddingLeft: Number(e.target.value) })
        }
      />
    </div>

    <div className="field-wrapper">
      <label>Margin Top (px)</label>
      <input
        type="number"
        min={0}
        value={style.marginTop ?? 0}
        className="basic-input"
        onChange={(e) =>
          onChange({ ...style, marginTop: Number(e.target.value) })
        }
      />
    </div>
    <div className="field-wrapper">
      <label>Margin Right (px)</label>
      <input
        type="number"
        min={0}
        value={style.marginRight ?? 0}
        className="basic-input"
        onChange={(e) =>
          onChange({ ...style, marginRight: Number(e.target.value) })
        }
      />
    </div>
    <div className="field-wrapper">
      <label>Margin Bottom (px)</label>
      <input
        type="number"
        min={0}
        value={style.marginBottom ?? 0}
        className="basic-input"
        onChange={(e) =>
          onChange({ ...style, marginBottom: Number(e.target.value) })
        }
      />
    </div>
    <div className="field-wrapper">
      <label>Margin Left (px)</label>
      <input
        type="number"
        min={0}
        value={style.marginLeft ?? 0}
        className="basic-input"
        onChange={(e) =>
          onChange({ ...style, marginLeft: Number(e.target.value) })
        }
      />
    </div>
  </>
);


const EmailBlockSettings: React.FC<EmailBlockSettingsProps> = ({
  block,
  onChange,
}) => {
  const [expandedContentGroup, setExpandedContentGroup] = useState(true);
  const [expandedLayoutGroup, setExpandedLayoutGroup] = useState(false);

  switch (block.type) {
    case 'text':
      return (
        <StyleControls
          style={block.style}
          onChange={(style) => onChange({ style })}
          includeTextStyles={true}
        />
      );

    case 'heading':
      return (
        <>
          <div className="setting-group">
            <div className="setting-group-header" onClick={() => setExpandedContentGroup(!expandedContentGroup)}>
              <h4>

                Heading Content
              </h4>
              <i className={` adminfont-${expandedContentGroup ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
            </div>
            {expandedContentGroup && (
              <div className="setting-group-content">
                <div className="field-wrapper">
                  <label>Heading Text</label>
                  <input
                    value={block.text}
                    onChange={(e) => onChange({ text: e.target.value })}
                    className="basic-input"
                  />
                </div>
                <div className="field-wrapper">
                  <label>Heading Level</label>
                  <ToggleSetting
                    options={[
                      {
                        key: 'h1',
                        value: 1,
                        label: 'H1',
                      },
                      {
                        key: 'h2',
                        value: 2,
                        label: 'H2',
                      },
                      {
                        key: 'h3',
                        value: 3,
                        label: 'H3',
                      },
                    ]}
                    value={block.level}
                    onChange={(value) =>
                      onChange({ level: value as 1 | 2 | 3 })
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <StyleControls
            style={block.style}
            onChange={(style) => onChange({ style })}
            includeTextStyles={true}
          />
        </>
      );

    case 'image':
      return (
        <>
          <div className="setting-group">
            <div className="setting-group-header" onClick={() => setExpandedContentGroup(!expandedContentGroup)}>
              <h4>

                Image
              </h4>
              <i className={` adminfont-${expandedContentGroup ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
            </div>
            {expandedContentGroup && (
              <div className="setting-group-content">
                <div className="field-wrapper">
                  <label>Image URL</label>
                  <input
                    value={block.src}
                    onChange={(e) => onChange({ src: e.target.value })}
                    className="basic-input"
                  />
                </div>
                <div className="field-wrapper">
                  <label>Alt Text</label>
                  <input
                    value={block.alt || ''}
                    onChange={(e) => onChange({ alt: e.target.value })}
                    className="basic-input"
                  />
                </div>
              </div>
            )}
          </div>
          <StyleControls
            style={block.style}
            onChange={(style) => onChange({ style })}
            includeTextStyles={false}
          />
        </>
      );

    case 'button':
      return (
        <>
          <div className="setting-group">
            <div className="setting-group-header" onClick={() => setExpandedContentGroup(!expandedContentGroup)}>
              <h4>

                Button Content
              </h4>
              <i className={` adminfont-${expandedContentGroup ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
            </div>
            {expandedContentGroup && (
              <div className="setting-group-content">
                <div className="field-wrapper">
                  <label>Button Text</label>
                  <input
                    value={block.text}
                    onChange={(e) => onChange({ text: e.target.value })}
                    className="basic-input"
                  />
                </div>
                <div className="field-wrapper">
                  <label>Button URL</label>
                  <input
                    value={block.url || ''}
                    onChange={(e) => onChange({ url: e.target.value })}
                    className="basic-input"
                  />
                </div>
              </div>
            )}
          </div>
          <StyleControls
            style={block.style}
            onChange={(style) => onChange({ style })}
            includeTextStyles={true}
          />
        </>
      );

    case 'divider':
      return (
        <StyleControls
          style={block.style}
          onChange={(style) => onChange({ style })}
          includeTextStyles={false}
        />
      );

    case 'columns':
      return (
        <>
          <div className="setting-group">
            <div className="setting-group-header" onClick={() => setExpandedLayoutGroup(!expandedLayoutGroup)}>
              <h4>
                Layout
              </h4>
              <i className={` adminfont-${expandedLayoutGroup ? 'pagination-right-arrow' : 'keyboard-arrow-down'}`} />
            </div>
            {expandedLayoutGroup && (
              <div className="setting-group-content">
                <div className="field-wrapper">
                  <label>Column Layout</label>
                  <select
                    value={block.layout}
                    onChange={(e) => {
                      const newLayout = e.target.value as ColumnsBlock['layout'];
                      const count = getColumnCount(newLayout);

                      const newColumns = Array.from({ length: count }, (_, i) =>
                        block.columns[i] || []
                      );

                      onChange({
                        layout: newLayout,
                        columns: newColumns,
                      });
                    }}
                  >
                    <option value="1">1 Column</option>
                    <option value="2-50">50 / 50</option>
                    <option value="2-66">66 / 34</option>
                    <option value="3">3 Columns</option>
                    <option value="4">4 Columns</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <StyleControls
            style={block.style}
            onChange={(style) => onChange({ style })}
            includeTextStyles={false}
          />
        </>
      );

    default:
      return <div>No settings available for this block type.</div>;
  }
};

const EMAIL_BLOCKS = [
  { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading' },
  { id: 'text', icon: 'adminfont-t-letter-bold', value: 'text', label: 'Text' },
  { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image' },
  { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button' },
  { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider' },
  { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns' },
];

const createBlock = (type: string): EmailBlock => {
  const id = Date.now();

  switch (type) {
    case 'text':
      return { id, type: 'text', html: 'Your text here' };

    case 'heading':
      return { id, type: 'heading', text: 'Heading', level: 2 };

    case 'image':
      return { id, type: 'image', src: '' };

    case 'button':
      return { id, type: 'button', text: 'Click Here' };

    case 'divider':
      return { id, type: 'divider' };

    case 'columns':
      return {
        id,
        type: 'columns',
        layout: '2-50',
        columns: [[], []],
      };

    default:
      throw new Error('Unknown block');
  }
};

const TextBlockView: React.FC<{
  block: TextBlock;
  onChange: (html: string) => void;
}> = ({ block, onChange }) => {
  const style = {
    backgroundColor: block.style?.backgroundColor,
    padding: block.style?.padding ||
      (block.style?.paddingTop || block.style?.paddingRight || block.style?.paddingBottom || block.style?.paddingLeft
        ? `${block.style?.paddingTop || 0}px ${block.style?.paddingRight || 0}px ${block.style?.paddingBottom || 0}px ${block.style?.paddingLeft || 0}px`
        : undefined),
    margin: block.style?.margin ||
      (block.style?.marginTop || block.style?.marginRight || block.style?.marginBottom || block.style?.marginLeft
        ? `${block.style?.marginTop || 0}px ${block.style?.marginRight || 0}px ${block.style?.marginBottom || 0}px ${block.style?.marginLeft || 0}px`
        : undefined),
    textAlign: block.style?.textAlign,
    fontSize: block.style?.fontSize,
    fontFamily: block.style?.fontFamily,
    color: block.style?.color,
    lineHeight: block.style?.lineHeight,
    fontWeight: block.style?.fontWeight,
    borderWidth: block.style?.borderWidth,
    borderColor: block.style?.borderColor,
    borderStyle: block.style?.borderStyle,
    borderRadius: block.style?.borderRadius,
    width: block.style?.width,
    height: block.style?.height,
    textDecoration: block.style?.textDecoration,
  };

  return (
    <div
      className="email-text"
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
};


const HeadingBlockView: React.FC<{
  block: HeadingBlock;
  onChange: (text: string) => void;
}> = ({ block, onChange }) => {
  const style = {
    backgroundColor: block.style?.backgroundColor,
    padding: block.style?.padding,
    margin: block.style?.margin,
    textAlign: block.style?.textAlign,
    fontSize: block.style?.fontSize,
    fontFamily: block.style?.fontFamily,
    color: block.style?.color,
    lineHeight: block.style?.lineHeight,
    fontWeight: block.style?.fontWeight,
    borderWidth: block.style?.borderWidth,
    borderColor: block.style?.borderColor,
    borderStyle: block.style?.borderStyle,
    borderRadius: block.style?.borderRadius,
    width: block.style?.width,
    height: block.style?.height,
    textDecoration: block.style?.textDecoration,
  };

  const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className="email-heading"
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent || '')}
    >
      {block.text}
    </Tag>
  );
};

const ButtonBlockView: React.FC<{
  block: ButtonBlock;
  onChange: (text: string) => void;
}> = ({ block, onChange }) => {
  const buttonStyle = {
    backgroundColor: block.style?.backgroundColor || '#007bff',
    color: block.style?.color || '#ffffff',
    padding: block.style?.padding || '10px 20px',
    margin: block.style?.margin,
    borderWidth: block.style?.borderWidth,
    borderColor: block.style?.borderColor,
    borderStyle: block.style?.borderStyle,
    borderRadius: block.style?.borderRadius || '5px',
    fontSize: block.style?.fontSize || '16px',
    fontFamily: block.style?.fontFamily || 'Arial',
    fontWeight: block.style?.fontWeight || 'bold',
    textAlign: 'center' as const,
    display: 'inline-block',
    textDecoration: block.style?.textDecoration || 'none',
    cursor: 'pointer',
  };

  const wrapperStyle = {
    textAlign: block.style?.align || block.style?.textAlign || 'center',
  };

  return (
    <div className="email-button-wrapper" style={wrapperStyle}>
      <a
        href={block.url || '#'}
        className="email-button"
        style={buttonStyle}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange(e.currentTarget.textContent || '')}
      >
        {block.text}
      </a>
    </div>
  );
};

// divider view
const DividerBlockView: React.FC<{
  block: DividerBlock;
}> = ({ block }) => {
  const style = {
    height: block.style?.height || '1px',
    backgroundColor: block.style?.backgroundColor || block.style?.color || '#cccccc',
    margin: block.style?.margin || block.style?.padding || '20px 0',
    padding: block.style?.padding,
    borderWidth: block.style?.borderWidth,
    borderColor: block.style?.borderColor,
    borderStyle: block.style?.borderStyle,
    borderRadius: block.style?.borderRadius,
    width: block.style?.width || '100%',
  };
  return <hr className="email-divider" style={style} />;
};

// image block view
const ImageBlockView: React.FC<{
  block: ImageBlock;
  onChange: (src: string) => void;
}> = ({ block, onChange }) => {
  const style = {
    backgroundColor: block.style?.backgroundColor,
    padding: block.style?.padding,
    margin: block.style?.margin,
    borderWidth: block.style?.borderWidth,
    borderColor: block.style?.borderColor,
    borderStyle: block.style?.borderStyle,
    borderRadius: block.style?.borderRadius,
    width: block.style?.width,
    height: block.style?.height,
    textAlign: block.style?.align || 'center',
  };

  return (
    <div className="email-image" style={style}>
      {block.src ? (
        <img src={block.src} alt={block.alt || ''} style={{ maxWidth: '100%', height: 'auto' }} />
      ) : (
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
      )}
    </div>
  );
};

const normalizeBlock = (item: any): EmailBlock => {
  // Already a real block (reorder case)
  if (item.type) return item;

  // Dropped from sidebar
  return createBlock(item.value);
};

const getColumnCount = (layout: ColumnsBlock['layout']) => {
  switch (layout) {
    case '1': return 1;
    case '2-50':
    case '2-66': return 2;
    case '3': return 3;
    case '4': return 4;
    default: return 2;
  }
};

const BlockRenderer: React.FC<{
  block: EmailBlock;
  onChange: (patch: Partial<EmailBlock>) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  isActive?: boolean;
}> = ({ block, onChange, onSelect, onDelete, isActive }) => {
  return (
    <div className={`form-field ${isActive ? 'active' : ''}`} onClick={onSelect}>
      <div className="meta-menu">
        <div className="drag-handle admin-badge blue">
          <i className="adminfont-drag"></i>
        </div>
        {onDelete && (
          <div
            className="admin-badge red"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <i className="admin-font adminfont-delete"></i>
          </div>
        )}
      </div>
      <div className="form-field-container-wrapper">
        {block.type === 'heading' && (
          <HeadingBlockView
            block={block}
            onChange={(text) => onChange({ text })}
          />
        )}
        {block.type === 'text' && (
          <TextBlockView
            block={block}
            onChange={(html) => onChange({ html })}
          />
        )}

        {block.type === 'image' && (
          <ImageBlockView
            block={block}
            onChange={(src) => onChange({ src })}
          />
        )}

        {block.type === 'button' && (
          <ButtonBlockView
            block={block}
            onChange={(text) => onChange({ text })}
          />
        )}

        {block.type === 'divider' && (
          <DividerBlockView
            block={block}
          />
        )}

        {block.type === 'columns' && (
          <ColumnsBlockView
            block={block}
            onChange={(columns) => onChange({ columns })}
            onSelectBlock={onSelect!}
          />
        )}
      </div>
    </div>
  );
};

const ColumnsBlockView: React.FC<{
  block: ColumnsBlock;
  onChange: (columns: EmailBlock[][]) => void;
  onSelectBlock: (block: EmailBlock) => void;
}> = ({ block, onChange, onSelectBlock }) => {
  const style = {
    backgroundColor: block.style?.backgroundColor,
    padding: block.style?.padding,
    margin: block.style?.margin,
    borderWidth: block.style?.borderWidth,
    borderColor: block.style?.borderColor,
    borderStyle: block.style?.borderStyle,
    borderRadius: block.style?.borderRadius,
  };

  return (
    <div
      className={`email-columns layout-${block.layout}`}
      style={style}
    >
      {block.columns.map((col, colIndex) => (
        <div key={colIndex} className="email-column-wrapper">
          <div className="column-icon">
            <i className="adminfont-plus"></i>
          </div>

          <ReactSortable
            list={col}
            setList={(newList) => {
              const updated = [...block.columns];
              updated[colIndex] = newList.map(normalizeBlock);
              onChange(updated);
            }}
            group={{ name: 'email', pull: true, put: true }}
            className="email-column"
            animation={150}
            handle=".drag-handle"
            fallbackOnBody
            swapThreshold={0.65}
          >
            {col.map((child, childIndex) => (
              <BlockRenderer
                block={child}
                onSelect={() => onSelectBlock(child)}
                onChange={(patch) => {
                  const updated = [...block.columns];
                  updated[colIndex][childIndex] = {
                    ...updated[colIndex][childIndex],
                    ...patch,
                  };
                  onChange(updated);
                }}
                onDelete={() => {
                  const updated = [...block.columns];
                  updated[colIndex].splice(childIndex, 1);
                  onChange(updated);
                }}
              />
            ))}
          </ReactSortable>
        </div>
      ))}
    </div>
  );
};

// Main Page Builder Component
const EmailTemplate: React.FC = () => {
  const [templates, setTemplates] =
    useState<EmailTemplate[]>(EMAIL_TEMPLATES);

  const [activeTemplateId, setActiveTemplateId] =
    useState<string>(EMAIL_TEMPLATES[0].id);

  const [openBlock, setOpenBlock] = useState<EmailBlock | null>(null);

  const activeTemplate = templates.find(
    (t) => t.id === activeTemplateId
  )!;

  const updateBlocks = (blocks: EmailBlock[]) => {
    setTemplates((prev) =>
      prev.map((tpl) =>
        tpl.id === activeTemplateId
          ? { ...tpl, blocks }
          : tpl
      )
    );
  };

  const [activeTab, setActiveTab] = useState('blocks');

  const updateBlock = (index: number, patch: Partial<EmailBlock>) => {
    const updated = [...activeTemplate.blocks];
    updated[index] = { ...updated[index], ...patch } as EmailBlock;
    updateBlocks(updated);
  };
  const tabs = [
    {
      id: 'blocks',
      label: 'Blocks',
      content: (
        <>
          <aside className="elements-section">
            <ReactSortable
              list={EMAIL_BLOCKS}
              setList={() => { }}
              sort={false}
              group={{ name: 'email', pull: 'clone', put: false }}
              className="section-container open"
            >
              {EMAIL_BLOCKS.map((item) => (
                <div key={item.value} className="elements-items">
                  <i className={item.icon} />
                  <p className="list-title">{item.label}</p>
                </div>
              ))}
            </ReactSortable>
          </aside>
        </>
      ),
    },
    {
      id: 'templates',
      label: 'templates',
      content: (
        <>
          <aside className="template-list">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`template-item ${tpl.id === activeTemplateId ? 'active' : ''
                  }`}
                onClick={() => setActiveTemplateId(tpl.id)}
              >
                {tpl.name}
                <div className="template-image-wrapper">
                  <div className="template-image">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </>
      ),
    },
  ];
  return (
    <div className="registration-from-wrapper email-builder">

      {/* LEFT PANEL */}
      <div className="elements-wrapper">
        <div className="tab-titles">
          <div className={`title ${activeTab === 'blocks' ? 'active' : ''}`} onClick={() => setActiveTab('blocks')}>Blocks</div>
          <div className={`title ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>Templates</div>
        </div>

        <div className="tab-contend">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && (
                <div key={tab.id} className="tab-panel">
                  {tab.content}
                </div>
              )
          )}
        </div>

        {/* {activeTab === 'blocks' && (
          <ReactSortable
            list={EMAIL_BLOCKS}
            setList={() => { }}
            sort={false}
            group={{ name: 'email', pull: 'clone', put: false }}
            className="email-block-sidebar"
          >
            {EMAIL_BLOCKS.map((item) => (
              <div key={item.value} className="email-block-item">
                <i className={item.icon} />
                <span>{item.label}</span>
              </div>
            ))}
          </ReactSortable>
        )}


        {activeTab === 'templates' && (
          <aside className="template-list">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`template-item ${tpl.id === activeTemplateId ? 'active' : ''
                  }`}
                onClick={() => setActiveTemplateId(tpl.id)}
              >
                {tpl.name}
              </div>
            ))}
          </aside>
        )} */}
      </div>

      {/* CENTER CANVAS */}
      <div className="registration-form-main-section email-canvas">
        {/* <input
          className="email-subject"
          value={activeTemplate.subject}
          placeholder="Email Subject"
          onChange={(e) =>
            setTemplates((prev) =>
              prev.map((tpl) =>
                tpl.id === activeTemplateId
                  ? { ...tpl, subject: e.target.value }
                  : tpl
              )
            )
          }
        /> */}

        <ReactSortable
          list={activeTemplate.blocks}
          setList={(newList) => {
            const normalized = newList.map(normalizeBlock);
            updateBlocks(normalized);
          }}
          group={{
            name: 'email',
            pull: true,
            put: true,
          }}
          handle=".drag-handle"
          animation={150}
          fallbackOnBody
          swapThreshold={0.65}
          className="email-canvas-sortable"
        >
          {activeTemplate.blocks.map((block, index) => (
            <div className="field-wrapper" key={block.id}>
              <BlockRenderer
                key={block.id}
                block={block}
                onSelect={() => setOpenBlock(block)}
                onChange={(patch) => updateBlock(index, patch)}
                onDelete={() => {
                  const updatedBlocks = [...activeTemplate.blocks];
                  updatedBlocks.splice(index, 1);
                  updateBlocks(updatedBlocks);
                  if (openBlock?.id === block.id) {
                    setOpenBlock(null);
                  }
                }}
                isActive={openBlock?.id === block.id}
              />
            </div>
          ))}
        </ReactSortable>
      </div>

      {/* RIGHT SETTINGS */}
      <div className="registration-edit-form-wrapper">
        {openBlock && (
          <div className="registration-edit-form">
            <div className='meta-setting-modal-content'>
              {/* Block Type Header */}
              <div className="block-type-header">
                <div className="block-type-title">
                  <h3>
                    {openBlock.type.charAt(0).toUpperCase() + openBlock.type.slice(1)} Settings
                  </h3>
                </div>
                {/* <button
                  className="close-settings-btn"
                  onClick={() => setOpenBlock(null)}
                  title="Close settings"
                >
                  <i className="adminfont-close"></i>
                </button> */}
              </div>

              <EmailBlockSettings
                block={openBlock}
                onChange={(patch) => {
                  const index = activeTemplate.blocks.findIndex(
                    (b) => b.id === openBlock.id
                  );
                  if (index >= 0) {
                    updateBlock(index, patch);
                    setOpenBlock({
                      ...openBlock,
                      ...patch,
                    });
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplate;
