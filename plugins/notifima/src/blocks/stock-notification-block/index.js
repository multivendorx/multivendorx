/* global stockNotificationBlock */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import axios from 'axios';

const EditBlock = ( { attributes, setAttributes } ) => {
    const blockProps = useBlockProps();
    const [ formHtml, setFormHtml ] = useState(
        __( 'Loading form…', 'notifima' )
    );

    const productId = useSelect( ( select ) => {
        const blocks = select( 'core/block-editor' ).getBlocks();
        const singleProductBlock = blocks.find(
            ( block ) => block.name === 'woocommerce/single-product'
        );
        return singleProductBlock?.attributes?.productId || null;
    }, [] );

    useEffect( () => {
        if ( productId && productId !== attributes.productId ) {
            setAttributes( { productId } );
        }
    }, [ productId ] );

    useEffect( () => {
        if ( productId ) {
            axios( {
                method: 'get',
                url: `${ stockNotificationBlock.apiUrl }/${ stockNotificationBlock.restUrl }/stock-notification-form?product_id=${ productId }`,
                headers: { 'X-WP-Nonce': stockNotificationBlock.nonce },
            } ).then( ( response ) => {
                    setFormHtml(
                        response.data.html ||
                            __( 'Failed to load form.', 'notifima' )
                    );
                } );
        } else {
            setFormHtml( __( 'No product selected.', 'notifima' ) );
        }
    }, [ productId ] );

    return (
        <div { ...blockProps }>
            <div dangerouslySetInnerHTML={ { __html: formHtml } } />
        </div>
    );
};

registerBlockType( 'notifima/stock-notification-block', {
    title: __( 'Stock Notification Block', 'notifima' ),
    description: __(
        'This block can be connected to WooCommerce Out-of-Stock and Backorder products to provide a stock notification form for users.',
        'notifima'
    ),
    category: 'woocommerce',
    icon: 'clipboard',
    supports: {
        html: false,
    },
    attributes: {
        productId: {
            type: 'number',
            default: null,
        },
    },

    edit: EditBlock,

    save: () => null, // Rendered via PHP
} );
