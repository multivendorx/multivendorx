// External dependencies
import React from 'react';
import { FieldComponent } from './types';

// Types
interface RecaptchaProps {
    formField?: { sitekey?: string };
    onChange?: (
        field: string,
        value: string | boolean | number | null
    ) => void;
}

export const RecaptchaUI: React.FC< RecaptchaProps > = ( { formField } ) => {
    if (!formField?.sitekey) {
        return (
            <div className="main-input-wrapper recaptcha">
                <p>
                    Please enter the reCAPTCHA site key in the field settings to enable reCAPTCHA.
                </p>
            </div>
        );
    }

    return (
        <div className="main-input-wrapper recaptcha">
            <p>reCAPTCHA has been successfully added to the form.</p>
        </div>
    );
};

const Recaptcha: FieldComponent = {
    render:RecaptchaUI,

    validate: (field, value) => {
        if (field.required && !value?.[field.key]) {
            return `${field.label} is required`;
        }

        return null;
    },

};

export default Recaptcha;