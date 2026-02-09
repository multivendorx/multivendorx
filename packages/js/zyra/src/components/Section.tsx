// External dependencies
import React from 'react';
import { FieldComponent } from './types';

// Types
interface SectionProps {
    wrapperClass?: string;
    hint?: string;
    value?: string;
    description?: string;
}

export const SectionUI = ( {
    wrapperClass,
    hint,
    value,
    description,
}: SectionProps ) => {
    return (
            <div className={`divider-wrapper ${wrapperClass}`}>
                <div className="divider-section">
                    { hint && (
                        <p
                            className="title"
                            dangerouslySetInnerHTML={ { __html: hint } }
                        ></p>
                    ) }
                    { description && (
                        <div
                            className="desc"
                            dangerouslySetInnerHTML={ { __html: description } }
                        ></div>
                    ) }
                    { value && <span>{ value }</span> }
                </div>
            </div>
    );
};

const Section: FieldComponent = {
    render: ({ field }) => (
        <SectionUI
            wrapperClass={field.wrapperClass}
            hint={field.hint}
            value={field.value}
            description={field.description}
        />
    ),
    validate: () => null,
};

export default Section;
