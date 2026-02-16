// External dependencies
import React, { useState } from 'react';
import { ToggleSettingUI } from './ToggleSetting';

interface StyleControlsProps {
    style?: any;
    onChange: (style: any) => void;
    includeTextStyles?: boolean;
}

const StyleControls: React.FC<StyleControlsProps> = ({
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
                <ToggleSettingUI
                  options={[
                    {
                      key: 'left',
                      value: 'left',
                      label: <i className="adminfont-left-align" />
                    },
                    {
                      key: 'center',
                      value: 'center',
                      label: <i className="adminfont-center-align" />
                    },
                    {
                      key: 'right',
                      value: 'right',
                      label: <i className="adminfont-right-align" />
                    },
                    {
                      key: 'justify',
                      value: 'justify',
                      label: <i className="adminfont-justify-align" />
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

export default StyleControls;