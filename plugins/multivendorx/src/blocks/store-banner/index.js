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

// const TEMPLATE = [
//     ['core/heading', { 
//         level: 2, 
//         content: __('Welcome to Our Store', 'multivendorx'),
//         align: 'center',
//         textColor: 'white'
//     }],
//     ['core/paragraph', { 
//         content: __('Discover amazing products and exclusive deals', 'multivendorx'),
//         align: 'center'
//     }],
//     ['core/buttons', {
//         align: 'center'
//     }, [
//         ['core/button', {
//             text: __('Shop Now', 'multivendorx'),
//             className: 'is-style-fill'
//         }]
//     ]]
// ];

const ALLOWED_BLOCKS = [
    'core/heading',
    'core/paragraph',
    'core/buttons',
    'core/button',
    'core/columns',
    'core/column',
    'core/image',
    'core/spacer',
    'multivendorx/store-name',
    'multivendorx/store-email',
    'multivendorx/store-phone',
    'multivendorx/store-social-icons',
    'multivendorx/store-buttons',
    'multivendorx/store-logo'
];

registerBlockType('multivendorx/store-banner', {
    attributes: {
        height: {
            type: 'string',
            default: '400px'
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
        }
    },

    edit: ({ attributes, setAttributes }) => {
        const { 
            height, 
            minHeight,
            overlayColor, 
            overlayOpacity, 
            contentColor,
            backgroundPosition,
            contentPosition
        } = attributes;

        const bannerImage = 'http://localhost:8889/wp-content/plugins/woocommerce/assets/images/pattern-placeholders/table-wood-house-chair-floor-window.jpg';

        const blockProps = useBlockProps({
            className: 'multivendorx-store-banner',
            style: {
                height: height,
                minHeight: minHeight,
                backgroundImage: `url(${bannerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: backgroundPosition,
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                display: 'flex',
                overflow: 'hidden'
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
            padding: '40px',
            color: contentColor
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Banner Settings', 'multivendorx')} initialOpen={true}>
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
                            // template={TEMPLATE}
                            templateLock={false} 
                            allowedBlocks={ALLOWED_BLOCKS}
                            orientation="vertical"
                            renderAppender={InnerBlocks.ButtonBlockAppender}
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
            backgroundPosition,
            contentPosition
        } = attributes;

        const bannerImage = 'http://localhost:8889/wp-content/plugins/woocommerce/assets/images/pattern-placeholders/table-wood-house-chair-floor-window.jpg';

        const [justifyContent, alignItems] = contentPosition.split(' ');
        
        const blockProps = useBlockProps.save({
            className: 'multivendorx-store-banner',
            style: {
                height: height,
                minHeight: minHeight,
                backgroundImage: `url(${bannerImage})`,
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