import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { 
    useBlockProps,
    BlockControls,
    AlignmentToolbar,
    InspectorControls
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    ColorPalette,
    ToggleControl
} from '@wordpress/components';

// Button Icons
const FollowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
    </svg>
);

const SupportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
    </svg>
);

const StoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm7 6c-1.65 0-3-1.35-3-3V5h6v6c0 1.65-1.35 3-3 3zm7-6c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
);

registerBlockType('multivendorx/store-buttons', {
    attributes: {
        buttonSize: {
            type: 'string',
            default: 'default' // 'small', 'default', 'large'
        },
        buttonType: {
            type: 'string',
            default: 'primary' // 'primary', 'secondary', 'outline'
        },
        align: {
            type: 'string',
            default: 'center'
        },
        followersCount: {
            type: 'number',
            default: 1250
        },
        showFollowersCount: {
            type: 'boolean',
            default: true
        },
        showFollowButton: {
            type: 'boolean',
            default: true
        },
        showChatButton: {
            type: 'boolean',
            default: true
        },
        showSupportButton: {
            type: 'boolean',
            default: true
        },
        showShopButton: {
            type: 'boolean',
            default: true
        }
    },

    edit: ({ attributes, setAttributes }) => {
        const { 
            buttonSize, 
            buttonType,
            align,
            followersCount,
            showFollowersCount,
            showFollowButton,
            showChatButton,
            showSupportButton
        } = attributes;
    
        
        const blockProps = useBlockProps({
            className: `multivendorx-store-buttons align-${align} wc-store-buttons`,
            style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                alignItems: 'start',
                justifyContent: align === 'left' ? 'flex-start' : 
                               align === 'right' ? 'flex-end' : 'center'
            }
        });

        // Follow button wrapper style
        const followButtonWrapperStyle = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
        };

        // Followers count style
        const followersCountStyle = {
            fontSize: '16px',
            color: '#fff',
            fontWeight: 'normal',
            marginTop: '2px'
        };
        const ButtonStyle ={
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
        }
        return (
            <>
                <BlockControls>
                    <AlignmentToolbar
                        value={align}
                        onChange={(newAlign) => setAttributes({ align: newAlign })}
                    />
                </BlockControls>

                <InspectorControls>
                    <PanelBody title={__('Button Settings', 'multivendorx')} initialOpen={true}>
                        <ToggleControl
                            label={__('Show Followers Count', 'multivendorx')}
                            checked={showFollowersCount}
                            onChange={(value) => setAttributes({ showFollowersCount: value })}
                        />                        
                        <ToggleControl
                            label={__('Show Follow Button', 'multivendorx')}
                            checked={showFollowButton}
                            onChange={(value) => setAttributes({ showFollowButton: value })}
                        />
                        <ToggleControl
                            label={__('Show Live Chat', 'multivendorx')}
                            checked={showChatButton}
                            onChange={(value) => setAttributes({ showChatButton: value })}
                        />
                        <ToggleControl
                            label={__('Show Support', 'multivendorx')}
                            checked={showSupportButton}
                            onChange={(value) => setAttributes({ showSupportButton: value })}
                        />
                    </PanelBody>
                </InspectorControls>

                <div {...blockProps}>
                    {/* Follow Store Button with Count */}
                    {showFollowButton && (
                        <div style={followButtonWrapperStyle}>
                            <button  style={ButtonStyle}
                                className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-follow-btn`}
                            >
                                <FollowIcon />
                                {__('Follow Store', 'multivendorx')}
                            </button>
                            {showFollowersCount && (
                                <div style={followersCountStyle}>
                                    {followersCount.toLocaleString()} {__('followers', 'multivendorx')}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Live Chat Button */}
                    {showChatButton && (
                        <button style={ButtonStyle}
                            className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-chat-btn`}
                        >
                            <ChatIcon />
                            {__('Live Chat', 'multivendorx')}
                        </button>
                    )}
                    
                    {/* Support Button */}
                    {showSupportButton && (
                        <button style={ButtonStyle}
                            className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-support-btn`}
                        >
                            <SupportIcon />
                            {__('Support', 'multivendorx')}
                        </button>
                    )}
                </div>
            </>
        );
    },

    save: ({ attributes }) => {
        const {
            align,
            followersCount,
            showFollowersCount,
            showFollowButton,
            showChatButton,
            showSupportButton,
        } = attributes;
        
        const blockProps = useBlockProps.save({
            className: `multivendorx-store-buttons align-${align} wc-store-buttons`,
            style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                alignItems: 'start',
                justifyContent: align === 'left' ? 'flex-start' : 
                               align === 'right' ? 'flex-end' : 'center'
            }
        });

        // Follow button wrapper style
        const followButtonWrapperStyle = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
        };

        // Followers count style
        const followersCountStyle = {
            fontSize: '12px',
            color: '#666',
            fontWeight: 'normal',
            marginTop: '2px'
        };

        return (
            <div {...blockProps}>
                {/* Follow Store Button with Count */}
                {showFollowButton && (
                    <div style={followButtonWrapperStyle}>
                        <button 
                            className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-follow-btn`}
                            data-followers={followersCount}
                        >
                            <FollowIcon />
                            {__('Follow Store', 'multivendorx')}
                        </button>
                        {showFollowersCount && (
                            <div 
                                style={followersCountStyle}
                                className="multivendorx-followers-count"
                            >
                                {followersCount.toLocaleString()} {__('followers', 'multivendorx')}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Live Chat Button */}
                {showChatButton && (
                    <button 
                        className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-chat-btn`}
                    >
                        <ChatIcon />
                        {__('Live Chat', 'multivendorx')}
                    </button>
                )}
                
                {/* Support Button */}
                {showSupportButton && (
                    <button 
                        className={`wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-support-btn`}
                    >
                        <SupportIcon />
                        {__('Support', 'multivendorx')}
                    </button>
                )}
            </div>
        );
    }
});