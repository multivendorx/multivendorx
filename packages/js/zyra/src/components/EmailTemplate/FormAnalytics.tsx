import React from 'react';

interface FormField {
    type: string;
    required?: boolean;
}

interface FormAnalyticsProps {
    formFields: FormField[];
}

interface FieldTypeCount {
    [ key: string ]: number;
}

const FormAnalytics: React.FC< FormAnalyticsProps > = ( { formFields } ) => {
    const fieldStats = {
        totalFields: formFields.length - 1,
        requiredFields: formFields.filter(
            ( field ) => field.required && field.type !== 'title'
        ).length,
        fieldTypes: formFields.reduce( ( acc, field ) => {
            if ( field.type !== 'title' ) {
                acc[ field.type ] = ( acc[ field.type ] || 0 ) + 1;
            }
            return acc;
        }, {} as FieldTypeCount ),
    };

    const fieldTypeEntries = Object.entries( fieldStats.fieldTypes ).map(
        ( [ type, count ] ) => ( {
            type,
            count,
        } )
    );

    return (
        <div className="form-analytics">
            <h3>Form Analytics</h3>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{ fieldStats.totalFields }</div>
                    <div className="stat-label">Total Fields</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        { fieldStats.requiredFields }
                    </div>
                    <div className="stat-label">Required Fields</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        { Object.keys( fieldStats.fieldTypes ).length }
                    </div>
                    <div className="stat-label">Field Types</div>
                </div>
            </div>

            <div className="field-type-breakdown">
                <h4>Field Type Breakdown</h4>
                { fieldTypeEntries.map( ( { type, count } ) => (
                    <div key={ type } className="type-row">
                        <span className="type-name">{ type }</span>
                        <span className="type-count">{ count }</span>
                    </div>
                ) ) }
            </div>
        </div>
    );
};

export default FormAnalytics;
