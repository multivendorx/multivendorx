// External dependencies
import React from 'react';

// Internal dependencies
import { FieldComponent } from './types';

// Types
interface SectionProps {
    wrapperClass?: string;
    title?: string;
    desc?: string;
}

export const SectionUI : React.FC<SectionProps> = ( {
    wrapperClass='',
    title,
    desc,
} ) => {
    return (
            <div className={`divider-wrapper ${wrapperClass}`}>
                <div className="divider-section">
                    { title && (
                        <p
                            className="title"
                            dangerouslySetInnerHTML={ { __html: title } }
                        ></p>
                    ) }
                    { desc && <span className="desc">{ desc }</span> }
                </div>
            </div>
    );
};

const Section: FieldComponent = {
    render: ({ field }) => (
        <SectionUI
            wrapperClass={field.wrapperClass}
            title={field.hint}
            desc={field.value}
        />
    ),
    validate: () => null,
};

export default Section;
