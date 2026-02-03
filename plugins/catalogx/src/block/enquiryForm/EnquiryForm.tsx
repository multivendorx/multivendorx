import { useState } from 'react';
import './EnquiryForm.scss';
import FreeForm from './FreeForm';
import { FormViewer } from 'zyra';
import axios from 'axios';

const EnquiryForm = () => {
    const [, setLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const formData = enquiryFormData;
    const proActive = formData.khali_dabba;

    const submitUrl = `${enquiryFormData.apiUrl}/catalogx/v1/enquiries`;

    const onSubmit = (submittedFormData: any) => {
        setLoading(true);

        const productId =
            document.querySelector<HTMLInputElement>('#product-id-for-enquiry')
                ?.value ?? '';
        const quantity =
            document.querySelector<HTMLInputElement>('.quantity .qty')?.value ??
            '1';

        submittedFormData.append('productId', productId);
        submittedFormData.append('quantity', quantity);

        axios
            .post(submitUrl, submittedFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-WP-Nonce': enquiryFormData.nonce,
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
        <>
            <div>{enquiryFormData.content_before_form}</div>
            {proActive ? (
                <FormViewer
                    formFields={formData.settings_pro}
                    onSubmit={onSubmit}
                />
            ) : (
                <FreeForm
                    formFields={formData.settings_free}
                    onSubmit={onSubmit}
                />
            )}
            <div>{enquiryFormData.content_after_form}</div>
            {toast && (
                <div className="admin-notice-display-title">
                    <i className="admin-font adminlib-icon-yes"></i>
                    {responseMessage}
                </div>
            )}
        </>
    );
};

export default EnquiryForm;
