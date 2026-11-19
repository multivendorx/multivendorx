/* global subscription */
import React, { useState } from 'react';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { __ } from '@wordpress/i18n';
import logo from '../../assets/images/brand-logo.png';
import VuloFormEmbed from './VuloFormEmbed';

interface SubscribeFormProps {
    productId: number;
    variationId: number;
    productTitle: string;
    userEmail: string;
    shownInterest: string;
}

interface ApiResponse {
    status: boolean;
    message: string;
    already_subscribed?: boolean;
    customer_email?: string;
    product_id?: number;
    variation_id?: number;
    unsubscribe_button?: {
        text: string;
    };
}

const SubscribeForm: React.FC<SubscribeFormProps> = ({
    productId,
    shownInterest,
}) => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const isPopup = subscription.display_type === 'popup';
    const vuloformFormId = subscription.vuloform_form_id ?? 0;

    /**
     * Unsubscribe
     */
    const unsubscribe = () => {
        if (!response) {
            return;
        }

        setLoading(true);

        axios({
            method: 'POST',
            url: getApiLink(subscription, `subscribers/${productId}`),
            headers: {
                'X-WP-Nonce': subscription.nonce,
            },
            data: {
                action: 'unsubscribe',
                customer_email: response.customer_email,
                product_id: response.product_id,
                variation_id: response.variation_id,
            },
        })
            .then(({ data }: { data: ApiResponse }) => {
                setResponse(data);
            })
            .catch(() => {
                setResponse({
                    status: false,
                    message: __('Unable to unsubscribe.', 'notifima'),
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const showForm =
        !response || (!response.status && !response.already_subscribed);

    const formContent = (
        <>
            {subscription.lead_time && (
                <p className="notifima-lead-time">
                    {subscription.lead_time}
                </p>
            )}

            {shownInterest && <p>{shownInterest}</p>}

            {response && (
                <div
                    className={
                        response.status
                            ? 'woocommerce-message'
                            : 'woocommerce-error'
                    }
                >
                    {response.message}
                </div>
            )}

            {showForm && vuloformFormId > 0 && (
                <VuloFormEmbed
                    formId={vuloformFormId}
                    apiUrl={subscription.apiUrl}
                    productId={productId}
                />
            )}

            {response?.already_subscribed && (
                <button
                    type="button"
                    className="notifima-unsubscribe woocommerce-button button wp-element-button wp-block-button__link"
                    disabled={loading}
                    onClick={unsubscribe}
                >
                    {loading
                        ? __('Please wait...', 'notifima')
                        : response.unsubscribe_button?.text ?? __('Unsubscribe', 'notifima')}
                </button>
            )}
        </>
    );

    return (
        <div className="notifima-subscribe-form">
            {!isPopup ? (
                formContent
            ) : (
                <>
                    <button
                        type="button"
                        className="notifima-open-popup woocommerce-button button wp-element-button wp-block-button__link"
                        onClick={() => setShowPopup(true)}
                    >
                        {__('Notify Me', 'notifima')}
                    </button>

                    {showPopup && (
                        <div
                            className="notifima-popup-overlay"
                            onClick={() => setShowPopup(false)}
                        >
                            <div
                                className="notifima-popup"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="notifima-popup-close"
                                    onClick={() => setShowPopup(false)}
                                >
                                    ×
                                </button>

                                <img
                                    src={logo}
                                    alt=""
                                    className="notifima-popup-logo"
                                />

                                {formContent}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SubscribeForm;
