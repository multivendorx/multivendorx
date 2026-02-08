// External dependencies
import React from 'react';

// Internal Dependencies
import '../styles/web/BlockText.scss';
import { FieldComponent } from './types';

// Types
interface BlockTextProps {
    blockTextClass: string;
    value: string;
    title?: string;
}

const BlockTextUI: React.FC< BlockTextProps > = ( {
    blockTextClass,
    value,
    title,
} ) => {
    return (
            <div className={ blockTextClass }>
                <div className="metabox-note-wrapper">
                    <i className="adminfont-info"></i>
                    <div className="details">
                        <div className="title">{ title }</div>
                        <p dangerouslySetInnerHTML={ { __html: value } }></p>
                    </div>
                </div>
            </div>
    );
};

const BlockText: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <BlockTextUI
            key={field.blocktext}
            blockTextClass={
                field.blockTextClass ||
                'settings-metabox-note'
            }
            title={field.title}
            value={String(field.blocktext)}
        />
    ),

    validate: (field, value) => {
        if (field.required && !value?.[field.key]) {
            return `${field.label} is required`;
        }

        return null;
    },

};
export default BlockText;
