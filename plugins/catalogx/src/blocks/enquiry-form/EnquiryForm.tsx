import { useState } from 'react';
import './EnquiryForm.scss';
import { FormViewer } from '@zyra/formbuilder';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const EnquiryForm = () => {
    const [showToast, setshowToast] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const formData = enquiryFormData;
    const proActive = formData.khali_dabba;

    const submitUrl = `${enquiryFormData.apiUrl}/catalogx/v1/enquiries`;

    const onSubmit = (submittedFormData: any) => {
        // Convert Zyra form object into FormData
        const formData = new FormData();
        Object.keys(submittedFormData).forEach((key) => {
            let value = submittedFormData[key];

            if (key === 'phone' && typeof value === 'object') {
                value = `${value.country_code}${value.phone}`;
            }

            formData.append(key, value);
        });

        const productId =
            document.querySelector<HTMLInputElement>(
                '#product-id-for-enquiry'
            )?.value ?? '';

        const quantity =
            document.querySelector<HTMLInputElement>(
                '.quantity .qty'
            )?.value ?? '1';

        formData.append('productId', productId);
        formData.append('quantity', quantity);

        axios
            .post(submitUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-WP-Nonce': enquiryFormData.nonce,
                },
            })
            .then((response) => {
                setResponseMessage(response.data.msg);
                setshowToast(true);
                if (response.data.redirect_link !== '') {
                    window.location.href = response.data.redirect_link;
                }
                setTimeout(() => {
                    setshowToast(false);
                    window.location.reload();
                }, 3000);
            });
    };

    const handleClose = () => {
        const modal = document.getElementById('catalogx-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

    return (
        <>
            <div className="form-wrapper">
                <div>{enquiryFormData.content_before_form}</div>
                {proActive ? (
                    <FormViewer
                        formFields={{
                            formfieldlist: formData.settings_pro,
                        }}
                        onSubmit={onSubmit}
                        onClose={handleClose}
                        formMessages={{
                            /* translators: %s: Field label. */
                            fieldRequired: __('%s is required.', 'catalogx'),
                            invalidEmail: __(
                                'Please enter a valid email address.',
                                'catalogx'
                            ),
                            termsRequired: __(
                                'Please accept the Terms & Conditions.',
                                'catalogx'
                            ),
                        }}
                    />
                ) : (
                    <FormViewer
                        formFields={{
                            formfieldlist: formData.settings_free,
                        }}
                        onSubmit={onSubmit}
                        onClose={handleClose}
                        formMessages={{
                            /* translators: %s: Field label. */
                            fieldRequired: __('%s is required.', 'catalogx'),
                            invalidEmail: __(
                                'Please enter a valid email address.',
                                'catalogx'
                            ),
                            termsRequired: __(
                                'Please accept the Terms & Conditions.',
                                'catalogx'
                            ),
                        }}
                    />
                )}
                <div>{enquiryFormData.content_after_form}</div>
                {showToast && (
                    <div className="woocommerce-notices-wrapper">
                        <ul className="woocommerce-message" role="alert">
                            <li>{responseMessage}</li>
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default EnquiryForm;
