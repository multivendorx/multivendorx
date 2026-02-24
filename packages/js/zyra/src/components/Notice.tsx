// External dependencies
import React, { useEffect } from 'react';
import "../styles/web/UI/SuccessNotice.scss";
import { FieldComponent } from './types';

export const DISPLAY_POSITIONS = {
    float: 'admin-notice-wrapper',
    inline: 'admin-notice-inline',
    banner: 'admin-notice-banner',
    general_notice: 'general',
};

export const NOTICE_TYPES = {
    success: {
        title:         'Great!',
        iconClass:     'adminfont-icon-yes',
        defaultDisplayPosition: 'float',
    },
    error: {
        title:         'Error',
        iconClass:     'adminfont-error',
        defaultDisplayPosition: 'general_notice',
    },
    warning: {
        title:         'Warning',
        iconClass:     'adminfont-warning',
        defaultDisplayPosition: 'general_notice',
    },
    info: {
        title:         'Info',
        iconClass:     'adminfont-info',
        defaultDisplayPosition: 'general_notice',
    },
    banner: {
        title:         '',
        iconClass:     'adminfont-info',
        defaultDisplayPosition: 'banner',
    }
};

export const DISPLAY_MODES = {
    toast:  'admin-notice-wrapper', 
    inline: 'admin-notice-inline',
    banner: 'admin-notice-banner',
};

export type NoticeType = NonNullable<keyof typeof NOTICE_TYPES>;
export type NoticeDisplay = NonNullable<keyof typeof DISPLAY_POSITIONS>;

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
    type?: NoticeType;
    title?: string;
    message?: string | NoticeItem[];
    displayPosition?: NoticeDisplay | string;
    className?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    autoDismiss?: number;
    iconClass?: string;
}

export const Notice: React.FC<NoticeProps> = ({
    message,
    title,
    type,
    displayPosition,
    className,
    dismissible  = false,
    onDismiss,
    autoDismiss  = 20000,
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

   const variantMeta =
    (type && type in NOTICE_TYPES
        ? NOTICE_TYPES[type as NoticeType]
        : NOTICE_TYPES.info);
    const resolvedDisplayPosition =
        displayPosition ||
        variantMeta.defaultDisplayPosition ||
        'general_notice';

    const displayModifier =
        DISPLAY_POSITIONS[resolvedDisplayPosition as NoticeDisplay] ??
        resolvedDisplayPosition;

    const rootClass = [
        displayModifier, Array.isArray(message) ? 'notice-multiple-items' : '']
        .filter(Boolean)
        .join(' ');

    // Normalize to array for consistent rendering
    const items: NoticeItem[] = Array.isArray(message) 
        ? message 
        : [{
            title: title ?? variantMeta.title,
            message: message,
            iconClass: iconClass ?? variantMeta.iconClass,
        }];

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
            
            <div className={`notice-items-container ${!Array.isArray(message) ? 'single-item' : ''}`}>
                {items.map((item, index) => {
                    const itemIcon = item.iconClass ?? iconClass ?? variantMeta.iconClass;
                    const itemTitle = item.title;
                    return (
                        <div key={index} className="notice-item">
                            <i className={`admin-font ${itemIcon}`} aria-hidden="true" />
                            
                            <div className="notice-item-details">
                                {itemTitle && (
                                    <div className="item-title">{itemTitle}</div>
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
};

const NoticeField: FieldComponent = {
    render: ({ field }) => {
        // Handle both legacy and new data structures if needed during migration
        const message = field.notice || field.blocktext; // Fallback for migration
        const type = field.type;
        const display = field.display || 'inline';
        return (
            <Notice
                key={field.key}
                type={type}
                title={field.title}
                message={message}
                displayPosition={display}
                iconClass={field.iconClass || 'adminfont-info'}
                dismissible={field.dismissible}
                className={field.className || 'settings-metabox-note'}
            />
        );
    },
};

export default NoticeField;