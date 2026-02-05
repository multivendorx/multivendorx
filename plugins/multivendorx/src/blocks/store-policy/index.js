import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { 
    RichText, 
    InspectorControls,
    useBlockProps
} from '@wordpress/block-editor';
import {
    PanelBody,
    ToggleControl
} from '@wordpress/components';

registerBlockType('multivendorx/store-policy', {
    supports: {
        align: true,
        alignWide: false,
        html: false,
        color: {
            text: true,
            __experimentalDefaultControls: {
                text: true
            }
        },
        typography: {
            fontSize: true,
            lineHeight: true,
            __experimentalDefaultControls: {
                fontSize: true
            }
        },
        spacing: {
            margin: true,
            padding: true,
            __experimentalDefaultControls: {
                margin: true,
                padding: true
            }
        }
    },

    attributes: {
        heading: {
            type: 'string',
            default: 'Store policy'
        },
        showStorePolicy: {
            type: 'boolean',
            default: true
        },
        showShippingPolicy: {
            type: 'boolean',
            default: true
        },
        showRefundPolicy: {
            type: 'boolean',
            default: true
        },
        showCancellationPolicy: {
            type: 'boolean',
            default: true
        }
    },

    edit: ({ attributes, setAttributes }) => {
        const {
            heading,
            showStorePolicy,
            showShippingPolicy,
            showRefundPolicy,
            showCancellationPolicy
        } = attributes;

        const headingProps = useBlockProps();
        const blockProps = { className: 'multivendorx-store-policy-block' };

        const accordionItems = [];

        if (showStorePolicy) {
            accordionItems.push(
                <div className="accordion-item" key="store-policy">
                    <div className="accordion-header">Store Policy</div>
                    <div className="accordion-body" style={{ display: 'none' }}>
                        <p>Store policy content goes here...</p>
                    </div>
                </div>
            );
        }

        if (showShippingPolicy) {
            accordionItems.push(
                <div className="accordion-item" key="shipping-policy">
                    <div className="accordion-header">Shipping Policy</div>
                    <div className="accordion-body" style={{ display: 'none' }}>
                        <p>Shipping policy content goes here...</p>
                    </div>
                </div>
            );
        }

        if (showRefundPolicy) {
            accordionItems.push(
                <div className="accordion-item" key="refund-policy">
                    <div className="accordion-header">Refund policy</div>
                    <div className="accordion-body" style={{ display: 'none' }}>
                        <p>Refund policy content goes here...</p>
                    </div>
                </div>
            );
        }

        if (showCancellationPolicy) {
            accordionItems.push(
                <div className="accordion-item" key="cancellation-policy">
                    <div className="accordion-header">Cancellation / return / exchange policy</div>
                    <div className="accordion-body" style={{ display: 'none' }}>
                        <p>Cancellation/return/exchange policy content goes here...</p>
                    </div>
                </div>
            );
        }

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('Policy Settings')} initialOpen={false}>
                        <ToggleControl
                            label={__('Show Store Policy')}
                            checked={showStorePolicy}
                            onChange={(value) => setAttributes({ showStorePolicy: value })}
                        />
                        <ToggleControl
                            label={__('Show Shipping Policy')}
                            checked={showShippingPolicy}
                            onChange={(value) => setAttributes({ showShippingPolicy: value })}
                        />
                        <ToggleControl
                            label={__('Show Refund Policy')}
                            checked={showRefundPolicy}
                            onChange={(value) => setAttributes({ showRefundPolicy: value })}
                        />
                        <ToggleControl
                            label={__('Show Cancellation Policy')}
                            checked={showCancellationPolicy}
                            onChange={(value) => setAttributes({ showCancellationPolicy: value })}
                        />
                    </PanelBody>
                </InspectorControls>

                <RichText
                    tagName="h2"
                    value={heading}
                    onChange={(value) => setAttributes({ heading: value })}
                    placeholder={__('Enter store policy heading...')}
                    {...headingProps}
                />
                
                <div className="multivendorx-policies-accordion">
                    {accordionItems}
                </div>
            </div>
        );
    },

    save: ({ attributes }) => {
        const {
            heading,
            showStorePolicy,
            showShippingPolicy,
            showRefundPolicy,
            showCancellationPolicy
        } = attributes;

        const headingProps = useBlockProps.save();
        const blockProps = { className: 'multivendorx-store-policy-block' };

        const accordionItems = [];

        if (showStorePolicy) {
            accordionItems.push(
                <div className="accordion-item" key="store-policy">
                    <div className="accordion-header">Store Policy</div>
                    <div className="accordion-body" style={{ display: 'none' }}>
                        <p>Store policy content goes here...</p>
                    </div>
                </div>
            );
        }

        if (showShippingPolicy) {
            accordionItems.push(
                <div className="accordion-item" key="shipping-policy">
                    <div className="accordion-header">Shipping Policy</div>
                    <div className="accordion-body" style={{ display: 'none' }}>
                        <p>Shipping policy content goes here...</p>
                    </div>
                </div>
            );
        }

        if (showRefundPolicy) {
            accordionItems.push(
                <div className="accordion-item" key="refund-policy">
                    <div className="accordion-header">Refund policy</div>
                    <div className="accordion-body" style={{ display: 'none' }}>
                        <p>Refund policy content goes here...</p>
                    </div>
                </div>
            );
        }

        if (showCancellationPolicy) {
            accordionItems.push(
                <div className="accordion-item" key="cancellation-policy">
                    <div className="accordion-header">Cancellation / return / exchange policy</div>
                    <div className="accordion-body" style={{ display: 'none' }}>
                        <p>Cancellation/return/exchange policy content goes here...</p>
                    </div>
                </div>
            );
        }

        return (
            <div {...blockProps}>
                <h2 {...headingProps}>{heading}</h2>
                <div className="multivendorx-policies-accordion">
                    {accordionItems}
                </div>
            </div>
        );
    }
});
