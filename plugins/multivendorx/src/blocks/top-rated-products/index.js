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
    ToggleControl,
    ToolbarGroup
} from '@wordpress/components';

registerBlockType('multivendorx/top-rated-products', {
    attributes: {
        align: {
            type: 'string',
            default: 'none'
        },
        columns: {
            type: 'number',
            default: 3
        },
        showPrice: {
            type: 'boolean',
            default: true
        },
        limit: {
            type: 'number',
            default: 6
        }
    },

    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps({
            className: `multivendorx-top-products-list columns-${attributes.columns} ${attributes.align ? `align${attributes.align}` : ''}`
        });

        const staticProducts = Array.from({ length: Math.min(attributes.limit, 6) }, (_, i) => ({
            id: i + 1,
            name: `Product ${i + 1}`,
            price: `$${(19.99 + i * 10).toFixed(2)}`,
            rating: 4 + Math.random() * 1,
            salePrice: i % 3 === 0 ? `$${(14.99 + i * 8).toFixed(2)}` : null
        }));

        return (
            <>
                <BlockControls>
                    <ToolbarGroup>
                        <AlignmentToolbar
                            value={attributes.align}
                            onChange={(align) => setAttributes({ align })}
                        />
                    </ToolbarGroup>
                </BlockControls>

                <InspectorControls>
                    <PanelBody title={__('Layout Settings', 'multivendorx')} initialOpen={true}>
                        <RangeControl
                            label={__('Number of Columns', 'multivendorx')}
                            value={attributes.columns}
                            onChange={(columns) => setAttributes({ columns })}
                            min={1}
                            max={6}
                            step={1}
                        />
                        <RangeControl
                            label={__('Number of Products', 'multivendorx')}
                            value={attributes.limit}
                            onChange={(limit) => setAttributes({ limit })}
                            min={1}
                            max={12}
                            step={1}
                        />
                    </PanelBody>

                    <ToggleControl
                        label={__('Show Price', 'multivendorx')}
                        checked={attributes.showPrice}
                        onChange={(showPrice) => setAttributes({ showPrice })}
                    />
                </InspectorControls>

                <div {...blockProps}>
                    <div className="top-products-inner">
                        {staticProducts.map((product) => (
                            <div className="product-item" key={product.id}>
                                <div className="product-image">
                                    <div className="image-placeholder">
                                        <span className="image-text">Product Image</span>
                                    </div>
                                    {product.salePrice && (
                                        <span className="sale-badge">Sale</span>
                                    )}
                                </div>
                                <div className="product-content">
                                    <h3 className="product-title">
                                        {product.name}
                                    </h3>
                                    {attributes.showPrice && (
                                        <div className="product-price">
                                            {product.salePrice ? (
                                                <>
                                                    <del className="regular-price">{product.price}</del>
                                                    <ins className="sale-price">{product.salePrice}</ins>
                                                </>
                                            ) : (
                                                <span className="regular-price">{product.price}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="editor-note">
                        <p>{__('Top Rated Products Block Preview', 'multivendorx')}</p>
                        <small>{__('Real WooCommerce products will be displayed on the frontend.', 'multivendorx')}</small>
                    </div>
                </div>
            </>
        );
    },

    save: ({ attributes }) => {
        const blockProps = useBlockProps.save({
            className: `multivendorx-top-products-list columns-${attributes.columns} ${attributes.align ? `align${attributes.align}` : ''}`,
            'data-columns': attributes.columns,
            'data-limit': attributes.limit,
            'data-show-price': attributes.showPrice
        });

        return (
            <div {...blockProps}>
                <div className="top-products-inner">
                    <div className="loading-products">
                        <span>{__('Loading top rated products...', 'multivendorx')}</span>
                    </div>
                </div>
            </div>
        );
    }
});