/**
 * External dependencies
 */
import React from "react";

/**
 * Internal dependencies
 */
import "../styles/web/Attachment.scss";

// Types
interface FormField {
    label: string;
    placeholder?: string;
}

interface AttachmentProps {
    formField: FormField;
    onChange: ( field: string, value: string ) => void;
}

const Attachment: React.FC< AttachmentProps > = ( { formField, onChange } ) => {
    return (
        <div className="main-input-wrapper">
            { /* Render label */ }
            <input
                className="input-label textArea-label"
                type="text"
                value={ formField.label }
                placeholder={ formField.placeholder }
                onChange={ ( event ) =>
                    onChange( "label", event.target.value )
                }
            />

            { /* Render attachments */ }
            <div className="attachment-section">
                <label htmlFor="dropzone-file" className="attachment-label">
                    <div className="wrapper">
                        <i className="adminLib-cloud-upload"></i>
                        <p className="heading">
                            <span>{ "Click to upload" }</span>{ " " }
                            { "or drag and drop" }
                        </p>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default Attachment;
