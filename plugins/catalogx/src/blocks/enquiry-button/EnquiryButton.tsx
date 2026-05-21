/* global enquiryButton */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EnquiryButton = () => {
    const [contentHtml, setContentHtml] = useState('Loading...');

    const productId =
        document
            .querySelector(
                '[data-block-name="woocommerce/single-product"]'
            )
            ?.getAttribute('data-product-id') || '';

    useEffect(() => {
        if (!productId) {
            setContentHtml('No product selected.');
            return;
        }

        axios({
            method: 'get',
            url: `${enquiryButton.apiUrl}/${enquiryButton.restUrl}/buttons?product_id=${productId}&button_type=enquiry`,
            headers: {
                'X-WP-Nonce': enquiryButton.nonce,
            },
        }).then((response) => {
            setContentHtml(
                response?.data?.html || 'Failed to load.'
            );
        });
    }, [productId]);

    return (
        <div
            dangerouslySetInnerHTML={{
                __html: contentHtml,
            }}
        />
    );
};

export default EnquiryButton;