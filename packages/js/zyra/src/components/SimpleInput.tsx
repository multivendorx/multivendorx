// External dependencies
import React from 'react';

// Types
interface SimpleInputProps {
    formField: { label: string; placeholder?: string };
    onChange?: ( field: string, value: string ) => void;
}

const SimpleInput: React.FC< SimpleInputProps > = ( {
    formField,
} ) => {
    return (
        <div className="edit-form-wrapper">
            <p>{ formField.label }</p>
            <div className="settings-form-group-radio">
                <input
                    className="basic-input"
                    type="text"
                    placeholder={ formField.placeholder }
                    readOnly
                />
            </div>
        </div>
    );
};

export default SimpleInput;
