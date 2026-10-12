import React from 'react';
import { __ } from '@wordpress/i18n';

interface QuoteThankYouProps {
    orderId: string | null;
}

const QuoteThankYou = ({ orderId }: QuoteThankYouProps) => {

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