import React, { useState } from 'react';
import axios from 'axios';
import { FormViewer, getApiLink } from 'zyra';

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

    return (
        <div className="notifima-subscribe-form">
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
                <FormViewer
                    formFields={subscription.settings}
                    response={{
                        email: userEmail,
                    }}
                    onSubmit={onSubmit}
                />
            )}

            {response?.already_subscribed && (
                <button
                    type="button"
                    className="notifima-unsubscribe"
                    disabled={loading}
                    onClick={unsubscribe}
                >
                    {loading
                        ? 'Please wait...'
                        : response.unsubscribe_button?.text ?? 'Unsubscribe'}
                </button>
            )}
        </div>
    );
};

export default SubscribeForm;