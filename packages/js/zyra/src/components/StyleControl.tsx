// External dependencies
import React from 'react';
import { ChoiceToggleUI } from './ChoiceToggle';
import Card from './UI/Card';
import FormGroupWrapper from './UI/FormGroupWrapper';
import FormGroup from './UI/FormGroup';
import { BlockStyle } from './CanvasEditor/blockStyle';
import { BasicInputUI } from './BasicInput';

interface StyleControlsProps {
    style?: BlockStyle;
    onChange: (style: BlockStyle) => void;
    includeTextStyles?: boolean;
}

const StyleControls: React.FC<StyleControlsProps> = ({
    style = {},
    onChange,
    includeTextStyles = true,
}) => {
    return (
        <>
            {/* Text Styles - Conditionally included */}
            {includeTextStyles && (
                <Card toggle defaultExpanded={false} title="Text">
                    <FormGroupWrapper>
                        <FormGroup label="Text Align">
                            <ChoiceToggleUI
                                options={[
                                    {
                                        key: 'left',
                                        value: 'left',
                                        icon: 'left-align',
                                    },
                                    {
                                        key: 'center',
                                        value: 'center',
                                        icon: 'center-align',
                                    },
                                    {
                                        key: 'right',
                                        value: 'right',
                                        icon: 'right-align',
                                    },
                                    {
                                        key: 'justify',
                                        value: 'justify',
                                        icon: 'justify-align',
                                    },
                                ]}
                                value={style.textAlign || 'left'}
                                onChange={(value) =>
                                    onChange({
                                        ...style,
                                        textAlign: value as
                                            | 'left'
                                            | 'center'
                                            | 'right'
                                            | 'justify',
                                    })
                                }
                            />
                        </FormGroup>

                        {/* font-size */}
                        <FormGroup cols={2} label="Font Size (rem)">
                            <BasicInputUI
                                type="number"
                                minNumber={0.5}
                                maxNumber={5}
                                value={style.fontSize ?? 1}
                                onChange={(val) => {
                                    onChange({
                                        ...style,
                                        fontSize: Number(val),
                                    });
                                }}
                            />
                        </FormGroup>

                        <FormGroup cols={2} label="Line Height">
                            <BasicInputUI
                                type="number"
                                minNumber={1}
                                maxNumber={3}
                                value={style.lineHeight ?? 1.5}
                                onChange={(val) => {
                                    onChange({
                                        ...style,
                                        lineHeight: Number(val),
                                    });
                                }}
                            />
                        </FormGroup>

                        {/* font weight */}
                        <FormGroup cols={2} label="Font Weight">
                            <select
                                value={style.fontWeight || 'normal'}
                                className="basic-input"
                                onChange={(e) =>
                                    onChange({
                                        ...style,
                                        fontWeight: e.target.value,
                                    })
                                }
                            >
                                <option value="300">Light (300)</option>
                                <option value="normal">Normal (400)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">Semibold (600)</option>
                                <option value="bold">Bold (700)</option>
                            </select>
                        </FormGroup>

                        <FormGroup cols={2} label="Text Decoration">
                            <select
                                value={style.textDecoration || 'none'}
                                className="basic-input"
                                onChange={(e) =>
                                    onChange({
                                        ...style,
                                        textDecoration: e.target.value,
                                    })
                                }
                            >
                                <option value="none">None</option>
                                <option value="underline">Underline</option>
                                <option value="overline">Overline</option>
                                <option value="line-through">
                                    Line Through
                                </option>
                            </select>
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
            )}

            {/* Background Group */}
            <Card toggle defaultExpanded={false} title="Color">
                <FormGroupWrapper>
                    <FormGroup cols={2} label="Background">
                        <BasicInputUI
                            type="color"
                            value={style.backgroundColor || '#ffffff'}
                            onChange={(val) => {
                                onChange({ ...style, backgroundColor: val });
                            }}
                        />
                    </FormGroup>
                    <FormGroup cols={2} label="Text">
                        <BasicInputUI
                            type="color"
                            value={style.color || '#000000'}
                            onChange={(val) => {
                                onChange({ ...style, color: val });
                            }}
                        />
                    </FormGroup>
                </FormGroupWrapper>
            </Card>

            {/* Padding & Margin Group */}
            <Card toggle defaultExpanded={false} title="Spacing">
                <FormGroupWrapper>
                    {/* Padding */}
                    <FormGroup label="Padding">
                        <div className="spacing-controls">
                            {['Top', 'Right', 'Bottom', 'Left'].map(
                                (position) => (
                                    <div
                                        className="spacing-input"
                                        key={`padding-${position}`}
                                    >
                                        <BasicInputUI
                                            type="number"
                                            minNumber={0}
                                            value={
                                                style[`padding${position}`] ?? 0
                                            }
                                            onChange={(val) => {
                                                onChange({
                                                    ...style,
                                                    [`padding${position}`]:
                                                        Number(val),
                                                });
                                            }}
                                        />
                                        <label>{position}</label>
                                    </div>
                                )
                            )}
                        </div>
                    </FormGroup>

                    {/* Margin */}
                    <FormGroup label="Margin">
                        <div className="spacing-controls">
                            {['Top', 'Right', 'Bottom', 'Left'].map(
                                (position) => (
                                    <div
                                        className="spacing-input"
                                        key={`margin-${position}`}
                                    >
                                        <BasicInputUI
                                            type="number"
                                            minNumber={0}
                                            value={
                                                style[`margin${position}`] ?? 0
                                            }
                                            onChange={(val) => {
                                                onChange({
                                                    ...style,
                                                    [`margin${position}`]:
                                                        Number(val),
                                                });
                                            }}
                                        />
                                        <label>{position}(rem)</label>
                                    </div>
                                )
                            )}
                        </div>
                    </FormGroup>
                </FormGroupWrapper>
            </Card>

            {/* Border Group */}
            <Card toggle defaultExpanded={false} title="Border">
                <FormGroupWrapper>
                    {/* Border Width */}
                    <FormGroup label="Width(rem)" cols={2}>  
                        <BasicInputUI
                            type="number"
                            minNumber={0}
                            value={style.borderWidth ?? 0}
                            onChange={(val) => {
                                onChange({
                                    ...style,
                                    borderWidth: Number(val),
                                });
                            }}
                        />
                    </FormGroup>

                    {/* Border Radius */}
                    <FormGroup label="Radius(rem)" cols={2}>
                        <BasicInputUI
                            type="number"
                            minNumber={0}
                            value={style.borderRadius ?? 0}
                            onChange={(val) => {
                                onChange({
                                    ...style,
                                    borderRadius: Number(val),
                                });
                            }}
                        />
                    </FormGroup>
                    {/* Border Color */}
                    <FormGroup label="Color" cols={2}>
                        <BasicInputUI
                            type="color"
                            value={style.borderColor || '#000000'}
                            onChange={(val) => {
                                onChange({ ...style, borderColor: val });
                            }}
                        />
                    </FormGroup>
                    <FormGroup label="Style" cols={2}>
                        <select
                            value={style.borderStyle || 'solid'}
                            className="basic-input"
                            onChange={(e) =>
                                onChange({
                                    ...style,
                                    borderStyle: e.target.value,
                                })
                            }
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                            <option value="none">None</option>
                        </select>
                    </FormGroup>
                </FormGroupWrapper>
            </Card>
        </>
    );
};

export default StyleControls;
