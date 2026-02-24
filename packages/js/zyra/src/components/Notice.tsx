// External dependencies
import React, { useEffect } from 'react';
import "../styles/web/UI/SuccessNotice.scss";
import { FieldComponent } from './types';

export const VARIANT_MODES = {
    success: {
        title:         'Great!',
        iconClass:     'adminfont-icon-yes',
    },
    error: {
        title:         'Error',
        iconClass:     'adminfont-error',
    },
    warning: {
        title:         'Warning',
        iconClass:     'adminfont-warning',
    },
    info: {
        title:         'Info',
        iconClass:     'adminfont-info',
    },
};

export const DISPLAY_MODES = {
    toast:  'admin-notice-wrapper', 
    inline: 'admin-notice-inline',
    banner: 'admin-notice-banner',
};

export type NoticeVariant = keyof typeof VARIANT_MODES;
export type NoticeDisplay = keyof typeof DISPLAY_MODES;

export interface NoticeItem {
    title?: string;
    message: string;
    iconClass?: string;
    action?: {
        label: string;
        url?: string;
        onClick?: () => void;
    };
}

export interface NoticeProps {
    /** The body text of the notice - can be string or array of items */
    message?: string | NoticeItem[];
    /** Optional heading above the message (only used for string message) */
    title?: string;
    /** Visual style of the notice */
    variant?: NoticeVariant;
    display?: NoticeDisplay | string;
    className?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    autoDismiss?: number;
    iconClass?: string;
}

export const Notice: React.FC<NoticeProps> = ({
    message,
    title,
    variant      = 'success',
    display      = 'toast',
    className,
    dismissible  = false,
    onDismiss,
    autoDismiss  = 5000,
    iconClass,
}) => {

    // Auto-dismiss - only for string messages
    useEffect(() => {
        if (!message || Array.isArray(message) || !autoDismiss) return;

        const timer = setTimeout(() => onDismiss?.(), autoDismiss);
        return () => clearTimeout(timer);
    }, [message, autoDismiss, onDismiss]);

    if (!message) return null;
    if (Array.isArray(message) && message.length === 0) return null;

    const variantMeta = VARIANT_MODES[variant];
    const displayClass = className ?? (DISPLAY_MODES[display as NoticeDisplay] ?? display);
    const rootClass = [displayClass, Array.isArray(message) ? 'notice-multiple-items' : '']
        .filter(Boolean)
        .join(' ');

    // Render array of messages
    if (Array.isArray(message)) {
        return (
            <div className={rootClass}>
                {dismissible && (
                    <button
                        type="button"
                        className="notice-dismiss"
                        aria-label="Dismiss notice"
                        onClick={onDismiss}
                    >
                        <i className="admin-font adminfont-close" aria-hidden="true" />
                    </button>
                )}
                
                <div className="notice-items-container">
                    {message.map((item, index) => {
                        const itemIcon = item.iconClass ?? iconClass ?? variantMeta.iconClass;
                        
                        return (
                            <div key={index} className="notice-item">
                                <i className={`admin-font ${itemIcon}`} aria-hidden="true" />
                                
                                <div className="notice-item-details">
                                    {item.title && (
                                        <div className="item-title">{item.title}</div>
                                    )}
                                    <div className="item-message">{item.message}</div>
                                    
                                    {item.action && (
                                        <div className="item-action">
                                            {item.action.url ? (
                                                <a 
                                                    href={item.action.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-link"
                                                >
                                                    {item.action.label}
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="action-button"
                                                    onClick={item.action.onClick}
                                                >
                                                    {item.action.label}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Render single message (original behavior)
    const resolvedIcon = iconClass ?? variantMeta.iconClass;
    const resolvedTitle = title ?? variantMeta.title;

    return (
        <div className={rootClass}>
            <i className={`admin-font ${resolvedIcon}`} aria-hidden="true" />

            <div className="notice-details">
                {resolvedTitle && (
                    <div className="title">{resolvedTitle}</div>
                )}
                <div className="desc">{message}</div>
            </div>

            {dismissible && (
                <button
                    type="button"
                    className="notice-dismiss"
                    aria-label="Dismiss notice"
                    onClick={onDismiss}
                >
                    <i className="admin-font adminfont-close" aria-hidden="true" />
                </button>
            )}
        </div>
    );
};

const NoticeField: FieldComponent = {
    render: ({ field }) => {
        // Handle both legacy and new data structures if needed during migration
        const message = field.notice || field.blocktext; // Fallback for migration
        const variant = field.variant || 'info';
        const display = field.display || 'inline';
        return (
            <Notice
                key={field.key}
                message={message}
                variant={variant}
                display={display}
                iconClass={field.iconClass || 'adminfont-info'}
                dismissible={field.dismissible}
                className={field.className || 'settings-metabox-note'}
            />
        );
    },
};

export default NoticeField;