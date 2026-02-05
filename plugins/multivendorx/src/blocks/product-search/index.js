import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    BlockControls,
    AlignmentToolbar,
    InspectorControls,
    InnerBlocks
} from '@wordpress/block-editor';
import {
    TextControl,
    PanelBody,
    PanelRow,
    RangeControl,
    ColorPalette,
    SelectControl,
    __experimentalBoxControl as BoxControl,
    __experimentalUnitControl as UnitControl,
    __experimentalSpacingSizesControl as SpacingSizesControl,
    __experimentalInputControl as InputControl
} from '@wordpress/components';

registerBlockType('multivendorx/product-search', {
    attributes: {
        align: {
            type: 'string'
        },
        placeholder: {
            type: 'string',
            default: 'Search products...'
        },
        layout: {
            type: 'string',
            default: 'inline'
        },
        inputWidth: {
            type: 'string',
            default: '300px'
        },
        inputBackgroundColor: {
            type: 'string'
        },
        inputTextColor: {
            type: 'string'
        },
        inputBorderColor: {
            type: 'string'
        },
        inputBorderRadius: {
            type: 'object',
            default: {
                top: '4px',
                right: '4px',
                bottom: '4px',
                left: '4px'
            }
        },
        inputPadding: {
            type: 'object',
            default: {
                top: '10px',
                right: '15px',
                bottom: '10px',
                left: '15px'
            }
        },
        inputFontSize: {
            type: 'number',
            default: 16
        },
        gap: {
            type: 'number',
            default: 10
        }
    },

    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps({
            className: `multivendorx-product-search-block layout-${attributes.layout}`,
            style: {
                textAlign: attributes.align,
                '--multivendorx-search-gap': `${attributes.gap}px`
            }
        });

        const inputStyle = {
            width: attributes.inputWidth,
            backgroundColor: attributes.inputBackgroundColor,
            color: attributes.inputTextColor,
            borderColor: attributes.inputBorderColor,
            borderRadius: attributes.inputBorderRadius.top &&
                attributes.inputBorderRadius.right &&
                attributes.inputBorderRadius.bottom &&
                attributes.inputBorderRadius.left ?
                `${attributes.inputBorderRadius.top} ${attributes.inputBorderRadius.right} ${attributes.inputBorderRadius.bottom} ${attributes.inputBorderRadius.left}` :
                '4px',
            padding: attributes.inputPadding.top &&
                attributes.inputPadding.right &&
                attributes.inputPadding.bottom &&
                attributes.inputPadding.left ?
                `${attributes.inputPadding.top} ${attributes.inputPadding.right} ${attributes.inputPadding.bottom} ${attributes.inputPadding.left}` :
                '10px 15px',
            fontSize: `${attributes.inputFontSize}px`,
            borderStyle: 'solid',
            borderWidth: '1px',
            outline: 'none'
        };

        const ALLOWED_BLOCKS = ['core/button'];
        const TEMPLATE = [
            ['core/button', {
                text: __('Search', 'multivendorx')
            }]
        ];

        return (
            <>
                <BlockControls>
                    <AlignmentToolbar
                        value={attributes.align}
                        onChange={(nextAlign) => {
                            setAttributes({ align: nextAlign });
                        }}
                    />
                </BlockControls>

                <InspectorControls>
                    <PanelBody title={__('Text', 'multivendorx')} initialOpen={true}>
                        <PanelRow>
                            <TextControl
                                label={__('Placeholder Text', 'multivendorx')}
                                value={attributes.placeholder}
                                onChange={(value) => setAttributes({ placeholder: value })}
                            />
                        </PanelRow>
                    </PanelBody>

                    <PanelBody title={__('Layout', 'multivendorx')} initialOpen={true}>
                        <PanelRow>
                            <SelectControl
                                label={__('Layout', 'multivendorx')}
                                value={attributes.layout}
                                options={[
                                    { label: __('Inline', 'multivendorx'), value: 'inline' },
                                    { label: __('Stacked', 'multivendorx'), value: 'stacked' }
                                ]}
                                onChange={(value) => setAttributes({ layout: value })}
                            />
                        </PanelRow>
                        <PanelRow>
                            <RangeControl
                                label={__('Gap', 'multivendorx')}
                                value={attributes.gap}
                                onChange={(value) => setAttributes({ gap: value })}
                                min={0}
                                max={50}
                                step={1}
                                help={__('Spacing between input and button', 'multivendorx')}
                            />
                        </PanelRow>
                    </PanelBody>

                    <PanelBody title={__('Dimensions', 'multivendorx')} initialOpen={false}>
                        <PanelBody title={__('Input Width', 'multivendorx')} initialOpen={false}>
                            <PanelRow>
                                <UnitControl
                                    label={__('Input Width', 'multivendorx')}
                                    value={attributes.inputWidth}
                                    onChange={(value) => setAttributes({ inputWidth: value || '300px' })}
                                    units={[
                                        { value: 'px', label: 'px' },
                                        { value: '%', label: '%' },
                                        { value: 'em', label: 'em' },
                                        { value: 'rem', label: 'rem' }
                                    ]}
                                />
                            </PanelRow>
                        </PanelBody>

                        <PanelBody title={__('Padding', 'multivendorx')} initialOpen={false}>
                            <BoxControl
                                label={__('Padding', 'multivendorx')}
                                values={attributes.inputPadding}
                                onChange={(value) => setAttributes({ inputPadding: value })}
                                units={[
                                    { value: 'px', label: 'px' },
                                    { value: 'em', label: 'em' },
                                    { value: 'rem', label: 'rem' }
                                ]}
                                allowReset={true}
                                resetValues={{ top: '10px', right: '15px', bottom: '10px', left: '15px' }}
                            />
                        </PanelBody>
                    </PanelBody>

                    <PanelBody title={__('Typography', 'multivendorx')} initialOpen={false}>
                        <PanelRow>
                            <RangeControl
                                label={__('Font Size (px)', 'multivendorx')}
                                value={attributes.inputFontSize}
                                onChange={(value) => setAttributes({ inputFontSize: value })}
                                min={12}
                                max={48}
                                step={1}
                            />
                        </PanelRow>
                    </PanelBody>

                    <PanelBody title={__('Border', 'multivendorx')} initialOpen={false}>
                        <PanelRow>
                            <BoxControl
                                label={__('Border Radius', 'multivendorx')}
                                values={attributes.inputBorderRadius}
                                onChange={(value) => setAttributes({ inputBorderRadius: value })}
                                units={[
                                    { value: 'px', label: 'px' },
                                    { value: 'em', label: 'em' },
                                    { value: '%', label: '%' }
                                ]}
                                allowReset={true}
                                resetValues={{ top: '4px', right: '4px', bottom: '4px', left: '4px' }}
                            />
                        </PanelRow>
                        <PanelRow>
                            <>
                                <p>{__('Border Color', 'multivendorx')}</p>
                                <ColorPalette
                                    value={attributes.inputBorderColor}
                                    onChange={(value) => setAttributes({ inputBorderColor: value })}
                                    disableCustomColors={false}
                                    clearable={true}
                                />
                            </>
                        </PanelRow>
                    </PanelBody>

                    <PanelBody title={__('Colors', 'multivendorx')} initialOpen={false}>
                        <PanelRow>
                            <div style={{ width: '100%' }}>
                                <p>{__('Background Color', 'multivendorx')}</p>
                                <ColorPalette
                                    value={attributes.inputBackgroundColor}
                                    onChange={(value) => setAttributes({ inputBackgroundColor: value })}
                                    disableCustomColors={false}
                                    clearable={true}
                                />
                            </div>
                        </PanelRow>
                        <PanelRow>
                            <div style={{ width: '100%' }}>
                                <p>{__('Text Color', 'multivendorx')}</p>
                                <ColorPalette
                                    value={attributes.inputTextColor}
                                    onChange={(value) => setAttributes({ inputTextColor: value })}
                                    disableCustomColors={false}
                                    clearable={true}
                                />
                            </div>
                        </PanelRow>
                    </PanelBody>
                </InspectorControls>

                <div {...blockProps}>
                    <div className="multivendorx-search-container">
                        <input
                            type="text"
                            className="multivendorx-search-input"
                            placeholder={attributes.placeholder}
                            style={inputStyle}
                            readOnly
                        />
                        <div className="multivendorx-search-button">
                            <InnerBlocks
                                allowedBlocks={ALLOWED_BLOCKS}
                                template={TEMPLATE}
                                templateLock="all"
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    },

    save: ({ attributes }) => {
        const blockProps = useBlockProps.save({
            className: `multivendorx-product-search-block layout-${attributes.layout}`,
            style: {
                '--multivendorx-search-gap': `${attributes.gap}px`
            }
        });

        const inputStyle = {
            width: attributes.inputWidth,
            backgroundColor: attributes.inputBackgroundColor,
            color: attributes.inputTextColor,
            borderColor: attributes.inputBorderColor,
            borderRadius: attributes.inputBorderRadius.top &&
                attributes.inputBorderRadius.right &&
                attributes.inputBorderRadius.bottom &&
                attributes.inputBorderRadius.left ?
                `${attributes.inputBorderRadius.top} ${attributes.inputBorderRadius.right} ${attributes.inputBorderRadius.bottom} ${attributes.inputBorderRadius.left}` :
                '4px',
            padding: attributes.inputPadding.top &&
                attributes.inputPadding.right &&
                attributes.inputPadding.bottom &&
                attributes.inputPadding.left ?
                `${attributes.inputPadding.top} ${attributes.inputPadding.right} ${attributes.inputPadding.bottom} ${attributes.inputPadding.left}` :
                '10px 15px',
            fontSize: `${attributes.inputFontSize}px`,
            borderStyle: 'solid',
            borderWidth: '1px',
            outline: 'none'
        };

        return (
            <div {...blockProps}>
                <form className="multivendorx-search-form" method="get" action="">
                    <div className="multivendorx-search-container">
                        <input
                            type="text"
                            className="multivendorx-search-input"
                            placeholder={attributes.placeholder}
                            name="s"
                            style={inputStyle}
                        />
                        <div className="multivendorx-search-button">
                            <InnerBlocks.Content />
                        </div>
                    </div>
                </form>
            </div>
        );
    }
});