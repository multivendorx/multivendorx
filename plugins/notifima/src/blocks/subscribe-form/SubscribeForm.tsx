/* global subscription */
import React, { useState } from 'react';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { __ } from '@wordpress/i18n';
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
    variationId,
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

    /**
     * Forwards the raw submitted fields to VuloForm's own public submit endpoint -- the same
     * request its script would have made, just issued by us instead, after Notifima's own check
     * already passed.
     */
    const submitToVuloForm = (formData: FormData) => {
        axios
            .post(
                `${subscription.apiUrl}/vuloform/v1/public/forms/${vuloformFormId}/submit`,
                formData
            )
            .catch(() => {
                // Notifima's own subscribe call already succeeded and told the visitor so;
                // VuloForm not recording its copy of the submission isn't user-facing.
            });
    };

    /**
     * VuloForm's script never gets this submission -- `VuloFormEmbed` hands it to us first.
     * Notifima's subscribe endpoint runs its own checks (email validation, banned domains/
     * addresses, already-subscribed dedup, etc.); only once it reports a real new subscription
     * do we forward the submission on to VuloForm itself. If Notifima doesn't add the subscriber,
     * VuloForm never receives or stores this submission at all.
     */
    const onVuloFormBeforeSubmit = (formData: FormData) => {
        const customerEmail = (formData.get('vf[email]') as string) || '';
        const countryCode = (formData.get('vf[phone][country_code]') as string) || '';
        const phoneNumber = (formData.get('vf[phone][phone]') as string) || '';

        const phone = `${countryCode}${phoneNumber}`;

        if (!customerEmail) {
            // No email field on this form -- nothing for Notifima to check.
            submitToVuloForm(formData);
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
                action: 'subscribe',
                customer_email: customerEmail,
                product_id: productId,
                phone,
                variation_id: variationId,
            },
        })
            .then(({ data }: { data: ApiResponse }) => {
                setResponse(data);

                if (data.status) {
                    submitToVuloForm(formData);
                }
            })
            .catch(() => {
                setResponse({
                    status: false,
                    message: __(
                        'Something went wrong. Please try again.',
                        'notifima'
                    ),
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
                    productId={variationId > 0 ? variationId : productId}
                    nonce={subscription.nonce}
                    onBeforeSubmit={onVuloFormBeforeSubmit}
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
