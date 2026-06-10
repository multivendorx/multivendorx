import { useState } from 'react';
import './EnquiryForm.scss';
import { FormViewer } from 'zyra';
import axios from 'axios';

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
            {showToast && (
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
                    onClose={handleClose}
                />
            ) : (
                <FormViewer
                    formFields={{
                        formfieldlist: formData.settings_free,
                    }}
                    onSubmit={onSubmit}
                    onClose={handleClose}
                />
            )}
            <div>{enquiryFormData.content_after_form}</div>
        </>
    );
};

export default EnquiryForm;
