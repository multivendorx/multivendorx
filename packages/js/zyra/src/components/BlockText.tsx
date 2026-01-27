/**
 * External dependencies
 */
import React from 'react';
import '../styles/web/BlockText.scss';

// Types
interface BlockTextProps {
    blockTextClass: string;
    value: string;
    title?: string;
    variant?: 'success' | 'error' | 'info' | 'warning' | 'default';
}

const variantIconConfig = {
    info: {
        icon: 'adminfont-icon-info',
        className: 'block-text-info',
    },
    success: {
        icon: 'adminfont-icon-check',
        className: 'block-text-success',
    },
    warning: {
        icon: 'adminfont-icon-suspended',
        className: 'block-text-warning',
    },
    error: {
        icon: 'adminfont-icon-error',
        className: 'block-text-error',
    },
    default: {
        icon: 'adminfont-icon-help',
        className: 'block-text-default',
    },
};

const BlockText: React.FC< BlockTextProps > = ( {
    blockTextClass,
    value,
    title,
    variant = 'default',
} ) => {
    const { icon, className } = variantIconConfig[ variant ];

    return (
        <div className={ `${ blockTextClass } ${ className }` }>
            <div className="metabox-note-wrapper">
                { icon && <i className={ icon } /> }
                <div className="details">
                    { title && <div className="title">{ title }</div> }
                    <p dangerouslySetInnerHTML={ { __html: value } } />
                </div>
            </div>
        </div>
    );
};

export default BlockText;
