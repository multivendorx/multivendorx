// External dependencies
import React from 'react';

// Internal dependencies
import { FieldComponent } from './fieldUtils';
import '../styles/web/Section.scss';

// Types
interface SectionProps {
    wrapperClass?: string;
    title?: string;
    desc?: string;
    withoutBorder?: boolean;
}

export const SectionUI: React.FC<SectionProps> = ({
    wrapperClass = '',
    title,
    desc,
    withoutBorder = false,
}) => {
    return (
        <div
            className={`divider-section ${!title ? 'border-only' : ''} ${
                withoutBorder ? 'without-border' : ''
            } ${wrapperClass}`}
        >
            {title && (
                <div
                    className="title"
                    dangerouslySetInnerHTML={{ __html: title }}
                ></div>
            )}
            {desc && <span className="desc">{desc}</span>}
        </div>
    );
};

const Section: FieldComponent = {
    render: ({ field }) => (
        <SectionUI
            wrapperClass={field.wrapperClass}
            title={field.title}
            desc={field.desc}
            withoutBorder={field.withoutBorder}
        />
    ),
    validate: () => null,
};

export default Section;
