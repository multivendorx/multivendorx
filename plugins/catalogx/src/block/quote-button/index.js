import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import axios from 'axios';

const EditBlock = ({ attributes, setAttributes }) => {
    const blockProps = useBlockProps();
    const [contentHtml, setContentHtml] = useState(__('Loading', 'catalogx'));

    // Select the product ID from the WooCommerce Single Product Block
    const productId = useSelect((select) => {
        const blocks = select('core/block-editor').getBlocks();
        const singleProductBlock = blocks.find(
            (block) => block.name === 'woocommerce/single-product'
        );
        return singleProductBlock?.attributes?.productId || null;
    }, []);

    // Update the product ID attribute if it changes
    useEffect(() => {
        if (productId && productId !== attributes.productId) {
            setAttributes({ productId });
        }
    }, [productId, attributes.productId, setAttributes]);

    // Fetch the rendered form from the REST API
    useEffect(() => {
        if (productId) {
            axios({
                method: 'get',
                url: `${quoteButton.apiUrl}/${quoteButton.restUrl}/buttons?product_id=${productId}&button_type=quote`,
                headers: { 'X-WP-Nonce': quoteButton.nonce },
            }).then((response) => {
                setContentHtml(
                    response.data.html || __('Failed to load.', 'catalogx')
                );
            });
        } else {
            setContentHtml(__('No product selected.', 'catalogx'));
        }
    }, [productId]);

    return (
        <div {...blockProps}>
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
    );
};

// Register the block
registerBlockType('catalogx/quote-button', {
    title: 'Quote Button',
    icon: 'money-alt',
    category: 'catalogx',
    attributes: {
        productId: {
            type: 'number',
            default: null,
        },
    },

    edit: EditBlock,

    save: () => {
        // Save function remains empty since rendering is handled by the PHP render callback
        return null;
    },
});
