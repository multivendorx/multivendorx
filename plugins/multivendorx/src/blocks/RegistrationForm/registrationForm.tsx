import { useState } from 'react';
import './storeRegistration.scss';
import { FormViewer } from 'zyra';
import axios from 'axios';

const RegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const formData = registrationForm;
    const submitUrl = `${registrationForm.apiUrl}/catalogx/v1/enquiries`;

    const onSubmit = (submittedFormData: any) => {
        setLoading(true);

        const productId =
            document.querySelector<HTMLInputElement>(
                '#product-id-for-enquiry'
            )?.value ?? '';
        const quantity =
            document.querySelector<HTMLInputElement>('.quantity .qty')
                ?.value ?? '1';

        submittedFormData.append('productId', productId);
        submittedFormData.append('quantity', quantity);

        axios
            .post(submitUrl, submittedFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-WP-Nonce': registrationForm.nonce,
                },
            })
            .then((response) => {
                setResponseMessage(response.data.msg);
                setLoading(false);
                setToast(true);
                if (response.data.redirect_link !== '') {
                    window.location.href = response.data.redirect_link;
                }
                setTimeout(() => {
                    setToast(false);
                    window.location.reload();
                }, 3000);
            });
    };

    return (
        <div className="enquiry-form-modal">
            {loading && (
                <section className="loader-wrapper">
                    <div className="loader-item">
                        <div className="three-body-dot"></div>
                        <div className="three-body-dot"></div>
                        <div className="three-body-dot"></div>
                    </div>
                </section>
            )}
            <div className="modal-wrapper">
                <div>{registrationForm.content_before_form}</div>

                <FormViewer
                    formFields={formData.settings}
                    onSubmit={onSubmit}
                />
                <div>{registrationForm.content_after_form}</div>
                {toast && (
                    <div className="admin-notice-display-title">
                        <i className="admin-font adminlib-icon-yes"></i>
                        {responseMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationForm;
