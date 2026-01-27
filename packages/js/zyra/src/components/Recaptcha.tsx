/**
 * External dependencies
 */
import React from 'react';

// Types
interface RecaptchaProps {
    formField: { sitekey?: string };
    onChange?: (
        field: string,
        value: string | boolean | number | null
    ) => void;
}

const Recaptcha: React.FC< RecaptchaProps > = ( { formField } ) => {
    return (
        <div
            className={ `main-input-wrapper ${
                ! formField.sitekey ? 'recaptcha' : ''
            }` }
        >
            { formField.sitekey
                ? 'reCAPTCHA has been successfully added to the form.'
                : 'reCAPTCHA is not configured.' }
        </div>
    );
};

export default Recaptcha;
