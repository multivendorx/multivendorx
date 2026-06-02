import React, { useState, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

interface QuoteThankYouProps {
    order_id: string | null;
    status: string;
}

const QuoteThankYou = ({ order_id, status }: QuoteThankYouProps) => {
    const [reason, setReason] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRejectQuote = () => {
        axios({
            method: 'post',
            url: `${quoteCart.apiUrl}/catalogx/v1/quotes`,
            headers: { 'X-WP-Nonce': quoteCart.nonce },
            data: { orderId: order_id, status, reason },
        }).then((response) => {
            setSuccessMessage(response.data?.message ?? '');
        });
    };

    if (successMessage) {
        return (
            <div className="woocommerce-notices-wrapper">
                <ul className="woocommerce-message" role="alert">
                    <li>{successMessage}</li>
                </ul>
            </div>
        );
    }

    if (order_id && status) {
        return (
            <div className="reject-quote-from-mail">
                <div className="reject-content">
                    <p>
                        {`${__('You are about to reject the quote', 'catalogx')} ${order_id}`}
                    </p>
                    <p>
                        <label htmlFor="reason">
                            {__(
                                'Please feel free to enter here your reason or provide us your feedback:',
                                'catalogx'
                            )}
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            cols={10}
                            rows={3}
                            value={reason}
                            onChange={ ( e ) => setReason( e.target.value ) }
                        />
                    </p>
                    <button onClick={handleRejectQuote}>
                        {__('Reject the quote', 'catalogx')}
                    </button>
                </div>
            </div>
        );
    }

    if (order_id) {
        return (
            <div>
                <p>
                    {__('Thank you for your quote request', 'catalogx')}{' '}
                    <strong>
                        {quoteCart.khali_dabba ? (
                            <a href={quoteCart.quote_my_account_url}>{order_id}</a>
                        ) : (
                            order_id
                        )}
                    </strong>
                    .
                </p>
                <p>
                    {__(
                        'Our team is reviewing your details and will get back to you shortly with a personalized quote. We appreciate your patience and look forward to serving you!',
                        'catalogx'
                    )}
                </p>
            </div>
        );
    }

    return null;
};

export default QuoteThankYou;