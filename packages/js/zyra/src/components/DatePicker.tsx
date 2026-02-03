// External dependencies
import React from 'react';

// Types
interface FormField {
    label: string; // The text label for the input field
}

interface DatepickerProps {
    formField: FormField; // The form field object
}

const Datepicker: React.FC<DatepickerProps> = ({ formField }) => {
    return (
        <div className="edit-form-wrapper">
            <p>{formField.label}</p>
            <div className="settings-form-group-radio">
                <input className="basic-input" type="date" readOnly />
            </div>
        </div>
    );
};

export default Datepicker;
