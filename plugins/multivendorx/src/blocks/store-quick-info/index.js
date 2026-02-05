import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    BlockControls,
    AlignmentToolbar
} from '@wordpress/block-editor';

registerBlockType('multivendorx/store-quick-info', {

    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps({
            className: 'multivendorx-store-quick-info-block',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }
        });

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

                <div {...blockProps}>
                    <div className="store-card">
                        <div className="store-header">
                            <div className="store-avatar">
                                <img src="https://via.placeholder.com/80" alt="Vendor Avatar" />
                            </div>
                            <div className="store-info">
                                <h3 className="store-name">vendor</h3>
                                <p className="store-email">vendor@test.com</p>
                                <div className="store-rating">
                                    <span className="stars">★★★★★</span>
                                    <span className="rating-number">4.8</span>
                                </div>
                            </div>
                        </div>

                        <div className="store-stats">
                            <div className="stat-item">
                                <div className="stat-number">5</div>
                                <div className="stat-label">Products</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">4.8</div>
                                <div className="stat-label">Rating</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">127</div>
                                <div className="stat-label">Sales</div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    },

    save: () => {
        const blockProps = useBlockProps.save({
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }
        });

        return (
            <div {...blockProps}>
                <div className="store-card">
                    <div className="store-header">
                        <div className="store-avatar">
                            <img src="https://via.placeholder.com/80" alt="Vendor Avatar" />
                        </div>
                        <div className="store-info">
                            <h3 className="store-name">vendor</h3>
                            <p className="store-email">vendor@test.com</p>
                            <div className="store-rating">
                                <span className="stars">★★★★★</span>
                                <span className="rating-number">4.8</span>
                            </div>
                        </div>
                    </div>

                    <div className="store-stats">
                        <div className="stat-item">
                            <div className="stat-number">5</div>
                            <div className="stat-label">Products</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">4.8</div>
                            <div className="stat-label">Rating</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">127</div>
                            <div className="stat-label">Sales</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});