import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    ColorPalette,
    SelectControl
} from '@wordpress/components';

// Luxe Display Template
const LuxeDisplay = [
    ['multivendorx/store-social-icons', { align: 'right' }],
    ['multivendorx/store-logo', {}],
    ['multivendorx/store-name', {}],
    [
        'core/group',
        {
            layout: {
                type: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'start',
                alignItems: 'center',
                orientation: 'horizontal',
            },
            style: {
                spacing: {
                    blockGap: '1.25rem',
                },
            },
        },
        [
            ['multivendorx/store-email', {}],
            ['multivendorx/store-phone', {}],
            ['multivendorx/store-address', {}],
        ],
    ],
    ['multivendorx/store-description', {}],
    ['core/spacer', { height: '1.25rem' }],
    ['multivendorx/follow-store', { align: 'right' }],
    ['multivendorx-pro/live-chat', { align: 'right' }],
    ['multivendorx-pro/store-support', { align: 'right' }]
];

// Signature View Template 
const SignatureView = [
    // main container
    [
        'core/group',
        {
            layout: {
                type: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'center',
                alignItems: 'center',
                orientation: 'vertical',
            },
            style: {
                spacing: {
                    blockGap: '1.25rem',
                },
            },
        },
        [
            ['multivendorx/store-logo', {}],
            ['multivendorx/store-name', {}],
            [
                'core/group',
                {
                    layout: {
                        type: 'flex',
                        flexWrap: 'nowrap',
                        justifyContent: 'start',
                        alignItems: 'center',
                        orientation: 'horizontal',
                    },
                    style: {
                        spacing: {
                            blockGap: '1.25rem',
                        },
                    },
                },
                [
                    ['multivendorx/store-email', {}],
                    ['multivendorx/store-phone', {}],
                    ['multivendorx/store-address', {}],
                ],
            ],
            ['multivendorx/store-description', { align: 'center' }],
            ['multivendorx/follow-store', { align: 'right' }],
            ['multivendorx-pro/live-chat', { align: 'right' }],
            ['multivendorx-pro/store-support', { align: 'right' }]
        ],
    ],
];

// Dynamic Showcase Template 
const DynamicShowcase = [
    // main container
    [
        'core/group',
        {
            layout: {
                type: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'start',
                alignItems: 'center',
                orientation: 'horizontal',
            },
            style: {
                spacing: {
                    blockGap: '1.25rem',
                },
            },
        },
        [
            // left information
            ['core/group',
                {
                    layout: {
                        type: 'flex',
                        flexWrap: 'nowrap',
                        justifyContent: 'start',
                        alignItems: 'center',
                        orientation: 'horizontal',
                    },
                    style: {
                        spacing: {
                            blockGap: '1.25rem',
                        },
                    },
                },
                [
                    // logo
                    ['multivendorx/store-logo', {}],
                    // store details
                    [
                        'core/group',
                        {
                            layout: {
                                type: 'flex',
                                flexWrap: 'nowrap',
                                justifyContent: 'start',
                                alignItems: 'center',
                                orientation: 'vartical',
                            },
                            style: {
                                spacing: {
                                    blockGap: '0',
                                },
                            },
                        },
                        [
                            ['multivendorx/store-name', {}],
                            [
                                'core/group',
                                {
                                    layout: {
                                        type: 'flex',
                                        flexWrap: 'nowrap',
                                        justifyContent: 'start',
                                        alignItems: 'center',
                                        orientation: 'horizontal',
                                    },
                                    style: {
                                        spacing: {
                                            blockGap: '1.25rem',
                                        },
                                    },
                                },
                                [
                                    ['multivendorx/store-email', {}],
                                    ['multivendorx/store-phone', {}],
                                    ['multivendorx/store-address', {}],
                                ],
                            ],
                            ['multivendorx/store-description', {}],
                        ],
                    ],
                ],
            ],
            // right information
            [
                'core/group',
                {
                    layout: {
                        type: 'flex',
                        flexWrap: 'nowrap',
                        justifyContent: 'start',
                        alignItems: 'center',
                        orientation: 'horizontal',
                    },
                    style: {
                        spacing: {
                            blockGap: '1.25rem',
                        },
                    },
                },
                [
                    ['multivendorx/follow-store', { align: 'right' }],
                    ['multivendorx-pro/live-chat', { align: 'right' }],
                    ['multivendorx-pro/store-support', { align: 'right' }]
                ],
            ],
        ],
    ],
];

// Empty template for reset
const EMPTY_TEMPLATE = [];

// Map templates
const TEMPLATES = {
    'luxe-display': LuxeDisplay,
    'signature-view': SignatureView,
    'dynamic-showcase': DynamicShowcase,
    'empty': EMPTY_TEMPLATE
};

const ALLOWED_BLOCKS = [
    'core/heading',
    'core/paragraph',
    'core/buttons',
    'core/button',
    'core/columns',
    'core/column',
    'core/row',
    'core/image',
    'core/spacer',
    'multivendorx/store-name',
    'multivendorx/store-email',
    'multivendorx/store-phone',
    'multivendorx/store-address',
    'multivendorx/store-social-icons',
    'multivendorx/follow-store',
    'multivendorx-pro/live-chat',
    'multivendorx-pro/store-support',
    'multivendorx/store-logo',
];

registerBlockType('multivendorx/store-banner', {
    attributes: {
        height: {
            type: 'string',
            default: 'auto'
        },
        minHeight: {
            type: 'string',
            default: '18.75rem'
        },
        overlayColor: {
            type: 'string',
            default: '#000000'
        },
        overlayOpacity: {
            type: 'number',
            default: 30
        },
        contentColor: {
            type: 'string',
        },
        align: {
            type: 'string'
        },
        backgroundPosition: {
            type: 'string',
            default: 'center'
        },
        contentPosition: {
            type: 'string',
            default: 'center center'
        },
        template: {
            type: 'string',
            default: 'luxe-display'
        },
        bannerUrl: {
            type: 'string',
            default: ''
        }
    },

    edit: ({ attributes, setAttributes, clientId }) => {
        const {
            height,
            minHeight,
            overlayColor,
            overlayOpacity,
            contentColor,
            backgroundPosition,
            contentPosition,
            template,
            bannerUrl
        } = attributes;

        const currentBannerUrl = bannerUrl;

        const blockProps = useBlockProps({
            className: `multivendorx-store-banner template-${template}`,
            style: {
                height: height,
                minHeight: minHeight,
                backgroundImage: `url(${currentBannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: backgroundPosition,
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                display: 'flex',
            }
        });

        const [justifyContent, alignItems] = contentPosition.split(' ');

        // Overlay style
        const overlayStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100
        };

        const contentContainerStyle = {
            position: 'relative',
            zIndex: 2,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: justifyContent || 'center',
            alignItems: alignItems || 'center',
            padding: '2.5rem 0',
            color: contentColor
        };

        // Get current template
        const currentTemplate = TEMPLATES[template] || LuxeDisplay;
        const isOverlayTemplate = template === 'luxe-display';

        // Function to handle template change
        const handleTemplateChange = (newTemplate) => {
            setAttributes({ template: newTemplate });

            // Replace inner blocks with the new template
            const newTemplateBlocks = TEMPLATES[newTemplate] || LuxeDisplay;

            if (wp.data.select('core/block-editor')) {
                wp.data.dispatch('core/block-editor').replaceInnerBlocks(
                    clientId,
                    JSON.parse(JSON.stringify(newTemplateBlocks))
                );
            }
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Banner Settings', 'multivendorx')} initialOpen={true}>

                        <SelectControl
                            label={__('Template', 'multivendorx')}
                            value={template}
                            onChange={handleTemplateChange}
                            options={[
                                { label: __('Luxe Display', 'multivendorx'), value: 'luxe-display' },
                                { label: __('Signature View', 'multivendorx'), value: 'signature-view' },
                                { label: __('Dynamic Showcase', 'multivendorx'), value: 'dynamic-showcase' },
                                { label: __('Custom', 'multivendorx'), value: 'empty' }
                            ]}
                        />

                        <SelectControl
                            label={__('Height', 'multivendorx')}
                            value={height}
                            onChange={(value) => setAttributes({ height: value })}
                            options={[
                                { label: __('Small (18.75rem)', 'multivendorx'), value: '18.75rem' },
                                { label: __('Medium (25rem)', 'multivendorx'), value: '25rem' },
                                { label: __('Large (31.25rem)', 'multivendorx'), value: '31.25rem' },
                                { label: __('Extra Large (37.5rem)', 'multivendorx'), value: '37.5rem' },
                                { label: __('Auto', 'multivendorx'), value: 'auto' }
                            ]}
                        />

                        <SelectControl
                            label={__('Min Height', 'multivendorx')}
                            value={minHeight}
                            onChange={(value) => setAttributes({ minHeight: value })}
                            options={[
                                { label: __('Small (12.5em)', 'multivendorx'), value: '12.5em' },
                                { label: __('Medium (18.75rem)', 'multivendorx'), value: '18.75rem' },
                                { label: __('Large (25rem)', 'multivendorx'), value: '25rem' },
                                { label: __('Extra Large (31.25rem)', 'multivendorx'), value: '31.25rem' }
                            ]}
                        />

                        <SelectControl
                            label={__('Background Position', 'multivendorx')}
                            value={backgroundPosition}
                            onChange={(value) => setAttributes({ backgroundPosition: value })}
                            options={[
                                { label: __('Center', 'multivendorx'), value: 'center' },
                                { label: __('Top', 'multivendorx'), value: 'top' },
                                { label: __('Bottom', 'multivendorx'), value: 'bottom' },
                                { label: __('Left', 'multivendorx'), value: 'left' },
                                { label: __('Right', 'multivendorx'), value: 'right' },
                                { label: __('Top Left', 'multivendorx'), value: 'top left' },
                                { label: __('Top Right', 'multivendorx'), value: 'top right' },
                                { label: __('Bottom Left', 'multivendorx'), value: 'bottom left' },
                                { label: __('Bottom Right', 'multivendorx'), value: 'bottom right' }
                            ]}
                        />

                        <SelectControl
                            label={__('Content Position', 'multivendorx')}
                            value={contentPosition}
                            onChange={(value) => setAttributes({ contentPosition: value })}
                            options={[
                                { label: __('Center Center', 'multivendorx'), value: 'center center' },
                                { label: __('Center Left', 'multivendorx'), value: 'center flex-start' },
                                { label: __('Center Right', 'multivendorx'), value: 'center flex-end' },
                                { label: __('Top Center', 'multivendorx'), value: 'flex-start center' },
                                { label: __('Top Left', 'multivendorx'), value: 'flex-start flex-start' },
                                { label: __('Top Right', 'multivendorx'), value: 'flex-start flex-end' },
                                { label: __('Bottom Center', 'multivendorx'), value: 'flex-end center' },
                                { label: __('Bottom Left', 'multivendorx'), value: 'flex-end flex-start' },
                                { label: __('Bottom Right', 'multivendorx'), value: 'flex-end flex-end' }
                            ]}
                        />

                        <div style={{ marginTop: '1.25em' }}>
                            <label>{__('Content Text Color', 'multivendorx')}</label>
                            <ColorPalette
                                value={contentColor}
                                onChange={(color) => setAttributes({ contentColor: color })}
                            />
                        </div>

                        <div style={{ marginTop: '1.25em' }}>
                            <label>{__('Overlay Color', 'multivendorx')}</label>
                            <ColorPalette
                                value={overlayColor}
                                onChange={(color) => setAttributes({ overlayColor: color })}
                            />
                        </div>

                        <RangeControl
                            label={__('Overlay Opacity (%)', 'multivendorx')}
                            value={overlayOpacity}
                            onChange={(value) => setAttributes({ overlayOpacity: value })}
                            min={0}
                            max={100}
                            step={5}
                        />
                    </PanelBody>
                </InspectorControls>

                {isOverlayTemplate ? (
                    // ✅ TEMPLATE 1 → content over banner
                    <div {...blockProps}>
                        <div style={overlayStyle}></div>

                        <div style={contentContainerStyle}>
                            <InnerBlocks
                                template={currentTemplate}
                                templateLock="all"
                                allowedBlocks={ALLOWED_BLOCKS}
                            />
                        </div>
                    </div>
                ) : (
                    // ✅ TEMPLATE 2 & 3 → banner first, content below
                    <div {...blockProps}>
                        <div style={contentContainerStyle}>
                            {/* Banner Image */}
                            <div className='banner-image'
                                style={{
                                    height: height,
                                    minHeight: '25rem',
                                    width: '100%',
                                    marginBottom: '1rem',
                                    backgroundImage: `url(${currentBannerUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: backgroundPosition,
                                    backgroundRepeat: 'no-repeat',
                                    position: 'relative'
                                }}
                            >
                                <div style={overlayStyle}></div>
                            </div>

                            {/* Content BELOW */}
                            <InnerBlocks
                                template={currentTemplate}
                                templateLock="all"
                                allowedBlocks={ALLOWED_BLOCKS}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    },

    save: ({ attributes }) => {
        const {
            height,
            minHeight,
            overlayColor,
            overlayOpacity,
            contentColor,
            backgroundPosition,
            contentPosition,
            template,
            bannerUrl
        } = attributes;

        const currentBannerUrl = bannerUrl;

        const [justifyContent, alignItems] = contentPosition.split(' ');

        const blockProps = useBlockProps.save({
            className: `multivendorx-store-banner template-${template}`,
            style: {
                height: height,
                minHeight: minHeight,
                backgroundImage: `url(${currentBannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: backgroundPosition,
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                display: 'flex',
                overflow: 'hidden'
            }
        });

        const overlayStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100
        };

        const contentContainerStyle = {
            position: 'relative',
            zIndex: 2,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: justifyContent || 'center',
            alignItems: alignItems || 'center',
            color: contentColor
        };

        const isOverlayTemplate = template === 'luxe-display';

        return isOverlayTemplate ? (
            <div {...blockProps}>
                <div style={overlayStyle}></div>
                <div style={contentContainerStyle}>
                    <InnerBlocks.Content />
                </div>
            </div>
        ) : (
            <div {...blockProps}>
                <div style={contentContainerStyle}>
                    {/* Banner Image */}
                    <div className='banner-image'
                        style={{
                            height: height,
                            minHeight: '25rem',
                            width: '100%',
                            marginBottom: '1rem',
                            backgroundImage: `url(${currentBannerUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: backgroundPosition,
                            backgroundRepeat: 'no-repeat',
                            position: 'relative'
                        }}
                    >
                        <div style={overlayStyle}></div>
                    </div>

                    {/* Content BELOW */}
                    <InnerBlocks.Content />
                </div>
            </div>
        );
    }
});

// Frontend script to handle dynamic banner images
document.addEventListener('DOMContentLoaded', () => {
    const bannerUrl = window.StoreInfo?.storeDetails?.storeBanner || '';

    document.querySelectorAll('.multivendorx-store-banner').forEach(banner => {
        if (bannerUrl) {
            banner.style.backgroundImage = `url(${bannerUrl})`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
        }
    });
});