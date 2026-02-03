// External dependencies
import React from 'react';

// Types
interface TimePickerProps {
    formField: { label: string };
    onChange: ( field: string, value: string ) => void;
}

const TimePicker: React.FC< TimePickerProps > = ( { formField } ) => {
    return (
        <div className="edit-form-wrapper">
            <p>{ formField.label }</p>
            <div className="settings-form-group-radio">
                <input className="basic-input" type="time" readOnly />
            </div>
        </div>
    );
};

export default TimePicker;
