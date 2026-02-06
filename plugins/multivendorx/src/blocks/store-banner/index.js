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

// Template 1: Store Header
const TEMPLATE_1 = [
    ['multivendorx/store-social-icons', {align: 'right'}],
    ['multivendorx/store-logo', {}],
    ['multivendorx/store-name', {}],
    ['core/group', {
        layout: {
            type: 'flex',
            flexWrap: 'nowrap',
            justifyContent: 'start',  
            alignItems: 'center',     
            orientation: 'horizontal'  
        },
        style: {
            spacing: {
                blockGap: '20px' 
            }
        }
    }, [
        ['multivendorx/store-email', {}],
        ['multivendorx/store-phone', {}],
        ['multivendorx/store-address', {}]
    ]],
    ['multivendorx/store-description', {}],
    ['core/spacer', { height: '20px' }],
    ['multivendorx/store-buttons', {align: 'right'}]
];

// Template 2: Contact Focused
const TEMPLATE_2 = [
    ['multivendorx/store-logo', {}],
    ['core/spacer', { height: '30px' }],
    ['multivendorx/store-name', {}],
    ['core/spacer', { height: '30px' }],
    ['core/columns', {}, [
        ['core/column', { width: '33.33%' }, [
            ['multivendorx/store-email', {}]
        ]],
        ['core/column', { width: '33.33%' }, [
            ['multivendorx/store-phone', {}]
        ]],
        ['core/column', { width: '33.33%' }, [
            ['multivendorx/store-social-icons', {}]
        ]]
    ]],
    ['core/spacer', { height: '30px' }],
    ['multivendorx/store-buttons', {}]
];

// Template 3: Simple Hero
const TEMPLATE_3 = [
    ['multivendorx/store-name', {}],
    ['core/spacer', { height: '15px' }],
    ['core/paragraph', { 
        content: __('Welcome to our store. We offer the best products with excellent customer service.', 'multivendorx'),
        align: 'center'
    }],
    ['core/spacer', { height: '30px' }],
    ['core/buttons', {
        align: 'center'
    }, [
        ['core/button', {
            text: __('Browse Products', 'multivendorx'),
            className: 'is-style-fill'
        }],
        ['core/button', {
            text: __('Contact Us', 'multivendorx'),
            className: 'is-style-outline'
        }]
    ]],
    ['core/spacer', { height: '30px' }],
    ['multivendorx/store-social-icons', {}]
];

// Empty template for reset
const EMPTY_TEMPLATE = [];

// Map templates
const TEMPLATES = {
    'template-1': TEMPLATE_1,
    'template-2': TEMPLATE_2,
    'template-3': TEMPLATE_3,
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
    'multivendorx/store-buttons',
    'multivendorx/store-logo'
];

registerBlockType('multivendorx/store-banner', {
    attributes: {
        height: {
            type: 'string',
            default: 'auto'
        },
        minHeight: {
            type: 'string',
            default: '300px'
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
            default: '#ffffff'
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
            default: 'template-1'
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
            template
        } = attributes;

        const bannerImage = 'http://localhost:8889/wp-content/plugins/woocommerce/assets/images/pattern-placeholders/table-wood-house-chair-floor-window.jpg';

        const blockProps = useBlockProps({
            className: `multivendorx-store-banner template-${template}`,
            style: {
                height: height,
                minHeight: minHeight,
                backgroundImage: `url(${bannerImage})`,
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
            // justifyContent: justifyContent || 'center',
            // alignItems: alignItems || 'center',
            padding: '40px',
            color: contentColor
        };

        // Get current template
        const currentTemplate = TEMPLATES[template] || TEMPLATE_1;

        // Function to handle template change
        const handleTemplateChange = (newTemplate) => {
            // First set the template attribute
            setAttributes({ template: newTemplate });
            
            // Get the InnerBlocks
            const innerBlocks = wp.data.select('core/block-editor').getBlocks(clientId);
            
            // If there are existing blocks, replace them with new template
            if (innerBlocks.length > 0) {
                // Replace blocks with the new template
                wp.data.dispatch('core/block-editor').replaceInnerBlocks(
                    clientId,
                    TEMPLATES[newTemplate] || TEMPLATE_1
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
                                { label: 'Template 1', value: 'template-1' },
                                { label: 'Template 2', value: 'template-2' },
                                { label: 'Template 3', value: 'template-3' },
                                { label: 'Custom', value: 'empty' }
                            ]}
                        />
                        
                        <SelectControl
                            label={__('Height', 'multivendorx')}
                            value={height}
                            onChange={(value) => setAttributes({ height: value })}
                            options={[
                                { label: 'Small (300px)', value: '300px' },
                                { label: 'Medium (400px)', value: '400px' },
                                { label: 'Large (500px)', value: '500px' },
                                { label: 'Extra Large (600px)', value: '600px' },
                                { label: 'Auto', value: 'auto' }
                            ]}
                        />
                        
                        <SelectControl
                            label={__('Min Height', 'multivendorx')}
                            value={minHeight}
                            onChange={(value) => setAttributes({ minHeight: value })}
                            options={[
                                { label: 'Small (200px)', value: '200px' },
                                { label: 'Medium (300px)', value: '300px' },
                                { label: 'Large (400px)', value: '400px' },
                                { label: 'Extra Large (500px)', value: '500px' }
                            ]}
                        />
                        
                        <SelectControl
                            label={__('Background Position', 'multivendorx')}
                            value={backgroundPosition}
                            onChange={(value) => setAttributes({ backgroundPosition: value })}
                            options={[
                                { label: 'Center', value: 'center' },
                                { label: 'Top', value: 'top' },
                                { label: 'Bottom', value: 'bottom' },
                                { label: 'Left', value: 'left' },
                                { label: 'Right', value: 'right' },
                                { label: 'Top Left', value: 'top left' },
                                { label: 'Top Right', value: 'top right' },
                                { label: 'Bottom Left', value: 'bottom left' },
                                { label: 'Bottom Right', value: 'bottom right' }
                            ]}
                        />
                        
                        <SelectControl
                            label={__('Content Position', 'multivendorx')}
                            value={contentPosition}
                            onChange={(value) => setAttributes({ contentPosition: value })}
                            options={[
                                { label: 'Center Center', value: 'center center' },
                                { label: 'Center Left', value: 'center flex-start' },
                                { label: 'Center Right', value: 'center flex-end' },
                                { label: 'Top Center', value: 'flex-start center' },
                                { label: 'Top Left', value: 'flex-start flex-start' },
                                { label: 'Top Right', value: 'flex-start flex-end' },
                                { label: 'Bottom Center', value: 'flex-end center' },
                                { label: 'Bottom Left', value: 'flex-end flex-start' },
                                { label: 'Bottom Right', value: 'flex-end flex-end' }
                            ]}
                        />
                        
                        <div style={{ marginTop: '20px' }}>
                            <label>{__('Content Text Color', 'multivendorx')}</label>
                            <ColorPalette
                                value={contentColor}
                                onChange={(color) => setAttributes({ contentColor: color })}
                            />
                        </div>
                        
                        <div style={{ marginTop: '20px' }}>
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

                <div {...blockProps}>
                    <div style={overlayStyle}></div>
                    <div style={contentContainerStyle}>
                        <InnerBlocks 
                            template={currentTemplate}
                            allowedBlocks={ALLOWED_BLOCKS}
                            orientation="vertical"
                            renderAppender={template === 'empty' ? InnerBlocks.ButtonBlockAppender : false}
                        />
                    </div>
                </div>
                
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
            contentPosition,
            template
        } = attributes;
    
        const [justifyContent, alignItems] = contentPosition.split(' ');
        
        const blockProps = useBlockProps.save({
            className: `multivendorx-store-banner template-${template}`,
            style: {
                height: height,
                minHeight: minHeight,
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
            // justifyContent: justifyContent ,
            // alignItems: alignItems,
            padding: '40px',
            color: contentColor
        };
    
        return (
            <div {...blockProps}>
                <div style={overlayStyle}></div>
                <div style={contentContainerStyle}>
                    <InnerBlocks.Content />
                </div>
            </div>
        );
    }
    
});
document.addEventListener('DOMContentLoaded', () => {
    const bannerUrl = StoreInfo?.storeDetails?.storeBanner || '';

    document
        .querySelectorAll('.multivendorx-store-banner')
        .forEach(banner => {
            if (bannerUrl) {
                banner.style.backgroundImage = `url(${bannerUrl})`;
                banner.style.backgroundSize = 'cover';
                banner.style.backgroundPosition = 'center';
                banner.style.backgroundRepeat = 'no-repeat';
            }
        });
});
