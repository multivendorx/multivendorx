/* global enquiryFormData */
import './EnquiryForm.scss';
import { __ } from '@wordpress/i18n';
import VuloFormEmbed from './VuloFormEmbed';

const EnquiryForm = () => {
    const formData = enquiryFormData;

    const productId =
        document.querySelector<HTMLInputElement>('#product-id-for-enquiry')
            ?.value ?? '';

    const quantity =
        document.querySelector<HTMLInputElement>('.quantity .qty')?.value ??
        '1';

    const isPopup = document
        .getElementById('catalogx-modal')
        ?.classList.contains('popup-enable');

    const closePopup = () => {
        const modal = document.getElementById('catalogx-modal');

        if (modal) {
            modal.style.display = 'none';
        }
    };

    return (
        <div className="form-wrapper">
            {isPopup && (
                <button
                    type="button"
                    className="close-icon"
                    aria-label={__('Close', 'catalogx')}
                    onClick={closePopup}
                >
                    ×
                </button>
            )}
            <div>{formData.content_before_form}</div>
            {formData.vuloform_form_id > 0 && (
                <VuloFormEmbed
                    formId={formData.vuloform_form_id}
                    apiUrl={formData.apiUrl}
                    productId={productId}
                    quantity={quantity}
                    onSubmitted={() => {
                        if (formData.redirect_url) {
                            window.location.href = formData.redirect_url;
                        }
                    }}
                />
            )}
            <div>{formData.content_after_form}</div>
        </div>
    );
};

export default EnquiryForm;
