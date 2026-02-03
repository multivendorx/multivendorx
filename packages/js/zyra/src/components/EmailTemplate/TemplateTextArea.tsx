/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

// Types
interface TextareaProps {
    formField: { label: string; placeholder?: string };
}

const TemplateTextArea: React.FC< TextareaProps > = ( {
    formField
} ) => {
    return (
        <div className="edit-form-wrapper">
            <p>{ formField.label }</p>
            <div className="settings-form-group-radio">
                <input
                    className="basic-input"
                    type="text"
                    value={ formField.placeholder }
                    readOnly
                />
            </div>
        </div>
    );
};

export default TemplateTextArea;
