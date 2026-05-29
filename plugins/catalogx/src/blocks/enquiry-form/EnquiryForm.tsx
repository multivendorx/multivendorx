import { useState } from 'react';
import './EnquiryForm.scss';
import { FormViewer } from 'zyra';
import axios from 'axios';

const EnquiryForm = () => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const formData = enquiryFormData;
    const proActive = formData.khali_dabba;

    const submitUrl = `${enquiryFormData.apiUrl}/catalogx/v1/enquiries`;

    const onSubmit = (submittedFormData: any) => {
        setLoading(true);

        // Convert Zyra form object into FormData
        const formData = new FormData();

        Object.keys(submittedFormData).forEach((key) => {
            formData.append(key, submittedFormData[key]);
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
    console.log('formData', formData);
    console.log('proActive', proActive);


    return (
        <>
            {toast && (
                <div className="woocommerce-notices-wrapper">
                    <ul className="woocommerce-message" role="alert">
                        <li>{responseMessage}</li>
                    </ul>
                </div>
            )}
            <div>{enquiryFormData.content_before_form}</div>
            {proActive ? (
                <FormViewer
                    formFields={{
                        formfieldlist: formData.settings_pro,
                    }}
                    onSubmit={onSubmit}
                />
            ) : (
                <FormViewer
                    formFields={{
                        formfieldlist: formData.settings_free,
                    }}
                    onSubmit={onSubmit}
                />
            )}
            <div>{enquiryFormData.content_after_form}</div>
        </>
    );
};

export default EnquiryForm;
