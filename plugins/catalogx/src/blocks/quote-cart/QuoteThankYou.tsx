import React, { useState, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

interface QuoteThankYouProps {
    orderId: string | null;
    status: string;
}

const QuoteThankYou = ({ orderId, status }: QuoteThankYouProps) => {
    const [reason, setReason] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRejectQuote = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();        
        axios({
            method: 'post',
            url: `${quoteCart.apiUrl}/catalogx/v1/quotes`,
            headers: { 'X-WP-Nonce': quoteCart.nonce },
            data: { orderId: orderId, status, reason },
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

    if (orderId && status) {
        return (
            <div className="reject-quote-from-mail woocommerce">
                <h2>{`${__('You are about to reject the quote', 'catalogx')} ${orderId}`}</h2>
                <form className="woocommerce-form woocommerce-form-login login" onSubmit={handleRejectQuote}>
                    <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label>
                            {__(
                                'Please feel free to enter here your reason or provide us your feedback:',
                                'catalogx'
                            )}
                        </label>

                        <textarea
                            name="message"
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className='woocommerce-Input input-text'
                        />
                    </p>
                    <p className='form-row'>
                        <button type="submit" className='woocommerce-button button wp-element-button wp-block-button__link'>
                            {__('Reject the quote', 'catalogx')}
                        </button>
                    </p>
                </form>
            </div>
        );
    }

    if (orderId) {
        return (
            <div className='quote-thank-you-section'>
                <svg width="3rem" height="3rem" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path fill="green" fillRule="evenodd" d="M3 10a7 7 0 019.307-6.611 1 1 0 00.658-1.889 9 9 0 105.98 7.501 1 1 0 00-1.988.22A7 7 0 113 10zm14.75-5.338a1 1 0 00-1.5-1.324l-6.435 7.28-3.183-2.593a1 1 0 00-1.264 1.55l3.929 3.2a1 1 0 001.38-.113l7.072-8z"/>
                </svg>
                <h2> {__('Thank you for your quote request', 'catalogx')} {!quoteCart.khali_dabba && (orderId)}.</h2>
                <p>
                    {__(
                        'Our team is reviewing your details and will get back to you shortly with a personalized quote. We appreciate your patience and look forward to serving you!',
                        'catalogx'
                    )}
                </p>
                {quoteCart.khali_dabba && (
                    <a className="button wp-block-button__link update-cart-button" href={quoteCart.quote_my_account_url}>{__('View Quote ', 'catalogx')}{' '}{orderId}</a>
                )}
            </div>
        );
    }

    return null;
};

export default QuoteThankYou;