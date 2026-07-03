import React, { useState } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

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
    variationId,
    productTitle,
    userEmail,
    shownInterest,
}) => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const isPopup = subscription.display_type === 'popup';

    /**
     * Subscribe
     */
    const onSubmit = (
        submittedFormData: Record<string, string | number | boolean>
    ) => {
        setLoading(true);

        axios({
            method: 'POST',
            url: getApiLink(subscription, `subscribers/${productId}`),
            headers: {
                'X-WP-Nonce': subscription.nonce,
            },
            data: {
                action: 'subscribe',
                customer_email: submittedFormData.email,
                product_id: productId,
                variation_id: variationId,
                product_title: productTitle,
            },
        })
            .then(({ data }: { data: ApiResponse }) => {
                setResponse(data);

                if (data.status) {
                    setShowPopup(false);
                }
            })
            .catch(() => {
                setResponse({
                    status: false,
                    message: 'Something went wrong. Please try again.',
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

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
                    message: 'Unable to unsubscribe.',
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

            {showForm && (
                !subscription.khali_dabba ? (
                    <>
                        <form className="woocommerce-form woocommerce-form-login login">
                            <label className="woocommerce-form__label woocommerce-form__label-for-checkbox" >
                                <input
                                    type="email"
                                    defaultValue={userEmail}
                                    placeholder="Enter your email"
                                    className="woocommerce-form__input woocommerce-form__input-checkbox"
                                    onChange={(e) => {
                                        subscription.email = e.target.value;
                                    }}
                                />
                            </label>

                            <button
                                type="button"
                                disabled={loading}
                                className='woocommerce-button button wp-element-button wp-block-button__link'
                                onClick={() =>
                                    onSubmit({
                                        email: subscription.email || userEmail,
                                    })
                                }
                            >
                                {__('Notify Me', 'notifima')}
                            </button>
                        </form>
                    </>
                ) : (
                    applyFilters(
                        'notifima_pro_subscribe_form',
                        <></>,
                        {
                            userEmail,
                            onSubmit,
                        }
                    )
                )
            )}

            {response?.already_subscribed && (
                <button
                    type="button"
                    className="notifima-unsubscribe woocommerce-button button wp-element-button wp-block-button__link"
                    disabled={loading}
                    onClick={unsubscribe}
                >
                    {loading
                        ? 'Please wait...'
                        : response.unsubscribe_button?.text ?? 'Unsubscribe'}
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