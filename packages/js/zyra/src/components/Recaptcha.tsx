/**
 * External dependencies
 */
import React from "react";

// Types
interface RecaptchaProps {
    formField: { sitekey?: string };
    onChange?: ( field: string, value: any ) => void;
}

const Recaptcha: React.FC< RecaptchaProps > = ( { formField } ) => {
    return (
        <div
            className={ `main-input-wrapper ${
                ! formField.sitekey ? "recaptcha" : ""
            }` }
        >
            <p>{ "reCAPTCHA has been successfully added to the form." }</p>
        </div>
    );
};

export default Recaptcha;
