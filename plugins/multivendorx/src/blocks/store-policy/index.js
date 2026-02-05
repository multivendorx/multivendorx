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

/**
 * Single source of truth for policies
 */
const POLICY_MAP = {
    storePolicy: {
        label: __('Store Policy'),
        placeholder: __('Store policy content goes here...')
    },
    shippingPolicy: {
        label: __('Shipping Policy'),
        placeholder: __('Shipping policy content goes here...')
    },
    refundPolicy: {
        label: __('Refund Policy'),
        placeholder: __('Refund policy content goes here...')
    },
    cancellationPolicy: {
        label: __('Cancellation / return / exchange policy'),
        placeholder: __('Cancellation / return / exchange policy content goes here...')
    }
};

/**
 * Shared accordion builder
 */
const buildAccordionItems = ({ visibility, isEdit }) => {
    return Object.entries(POLICY_MAP).map(([key, config]) => {
        if (!visibility[key]) return null;

        return (
            <div
                key={key}
                className="accordion-item"
                data-policy={!isEdit ? key : undefined}
            >
                <div className="accordion-header">
                    {config.label}
                </div>

                <div className="accordion-body" style={{ display: 'none' }}>
                    <p>{isEdit ? config.placeholder : ''}</p>
                </div>
            </div>
        );
    });
};


registerBlockType('multivendorx/store-policy', {
    supports: {
        align: true,
        html: false
    },

    attributes: {
        heading: {
            type: 'string',
            default: __('Store policy')
        },
        showStorePolicy: { type: 'boolean', default: true },
        showShippingPolicy: { type: 'boolean', default: true },
        showRefundPolicy: { type: 'boolean', default: true },
        showCancellationPolicy: { type: 'boolean', default: true }
    },

    /**
     * EDIT — static preview only
     */
    edit: ({ attributes, setAttributes }) => {
        const {
            heading,
            showStorePolicy,
            showShippingPolicy,
            showRefundPolicy,
            showCancellationPolicy
        } = attributes;

        const blockProps = useBlockProps({
            className: 'multivendorx-store-policy-block'
        });

        const visibility = {
            storePolicy: showStorePolicy,
            shippingPolicy: showShippingPolicy,
            refundPolicy: showRefundPolicy,
            cancellationPolicy: showCancellationPolicy
        };

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('Policy Settings')} initialOpen={false}>
                        <ToggleControl
                            label={POLICY_MAP.storePolicy.label}
                            checked={showStorePolicy}
                            onChange={(value) =>
                                setAttributes({ showStorePolicy: value })
                            }
                        />
                        <ToggleControl
                            label={POLICY_MAP.shippingPolicy.label}
                            checked={showShippingPolicy}
                            onChange={(value) =>
                                setAttributes({ showShippingPolicy: value })
                            }
                        />
                        <ToggleControl
                            label={POLICY_MAP.refundPolicy.label}
                            checked={showRefundPolicy}
                            onChange={(value) =>
                                setAttributes({ showRefundPolicy: value })
                            }
                        />
                        <ToggleControl
                            label={POLICY_MAP.cancellationPolicy.label}
                            checked={showCancellationPolicy}
                            onChange={(value) =>
                                setAttributes({ showCancellationPolicy: value })
                            }
                        />
                    </PanelBody>
                </InspectorControls>

                <RichText
                    tagName="h2"
                    value={heading}
                    onChange={(value) =>
                        setAttributes({ heading: value })
                    }
                    placeholder={__('Enter store policy heading…')}
                />

                <div className="multivendorx-policies-accordion">
                    {buildAccordionItems({
                        visibility,
                        isEdit: true
                    })}
                </div>
            </div>
        );
    },

    /**
     * SAVE — dynamic-ready markup only
     */
    save: ({ attributes }) => {
        const {
            heading,
            showStorePolicy,
            showShippingPolicy,
            showRefundPolicy,
            showCancellationPolicy
        } = attributes;
    
        const blockProps = useBlockProps.save({
            className: 'multivendorx-store-policy-block'
        });
    
        const visibility = {
            storePolicy: showStorePolicy,
            shippingPolicy: showShippingPolicy,
            refundPolicy: showRefundPolicy,
            cancellationPolicy: showCancellationPolicy
        };
    
        return (
            <div {...blockProps}>
                <h2>{heading}</h2>
    
                <div className="multivendorx-policies-accordion">
                    {Object.entries(POLICY_MAP).map(([key, config]) => {
                        if (!visibility[key]) return null;
    
                        return (
                            <div
                                key={key}
                                className="accordion-item"
                                data-policy={key}
                            >
                                <div className="accordion-header">
                                    {config.label}
                                </div>
    
                                <div
                                    className="accordion-body"
                                    style={{ display: 'none' }}
                                >
                                    <p></p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }    
});

/**
 * FRONTEND ONLY — dynamic policy injection
 */
document.addEventListener('DOMContentLoaded', () => {
    if (
        !window.StoreInfo ||
        !StoreInfo.activeModules?.includes('store-policy')
    ) {
        return;
    }

    const policies = StoreInfo.storeDetails || {};

    document
        .querySelectorAll(
            '.multivendorx-store-policy-block .accordion-item'
        )
        .forEach((item) => {
            const key = item.dataset.policy;
            const value = policies[key];

            if (!key || !value) return;

            const p = item.querySelector('.accordion-body p');
            if (p) {
                p.textContent = value;
            }
        });
});

