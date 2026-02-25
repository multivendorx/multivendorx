// External dependencies
import React, { useEffect } from 'react';
import "../styles/web/UI/SuccessNotice.scss";
import { FieldComponent } from './types';

export interface NoticeItem {
    title?: string;
    message: string;
    action?: {
        label: string;
        url?: string;
        onClick?: () => void;
    };
}

export interface NoticeProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message?: string | NoticeItem[];
    variant?: 'float' | 'inline' | 'banner' | 'notice' | string;
    className?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    autoDismiss?: number;
}

export const Notice: React.FC<NoticeProps> = ({
    message,
    title,
    type = 'success',
    variant = 'notice',
    className,
    dismissible = false,
    onDismiss,
    autoDismiss = 300000,
}) => {
    if (!message || message === '') return null;
    if (Array.isArray(message) && message.length === 0) return null;

    // Auto-dismiss - only for string messages
    useEffect(() => {
        if (!message || Array.isArray(message) || !autoDismiss) return;

        const timer = setTimeout(() => onDismiss?.(), autoDismiss);
        return () => clearTimeout(timer);
    }, [message, autoDismiss, onDismiss]);

    const rootClass = [
        'ui-notice',
        `type-${type}`, `variant-${variant}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    // Normalize to array for consistent rendering
    const items: NoticeItem[] = Array.isArray(message)
        ? message
        : [{
            title: title ,
            message: message,
        }];

    return (
        <div className={`${rootClass}`}>
            {dismissible && (
                <i className="close-icon adminfont-close" onClick={onDismiss} aria-hidden="true" />
            )}
            {items.map((item, index) => {
                return (
                    <div key={index} className="notice-item">
                        <i className={`admin-font adminfont-${type}`} aria-hidden="true" />

                        <div className="notice-item-details">
                            {item.title && (
                                <div className="notice-text">{item.title}</div>
                            )}
                            <div className="notice-desc">
                                {item.message}
                                {variant == 'banner' && (
                                    <a
                                        // href={proUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Upgrade Now
                                    </a>
                                )}
                            </div>

                        </div>
                    </div>
                );
            })}
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
                variant={display}
                dismissible={field.dismissible}
                className={field.className}
            />
        );
    },
};

export default NoticeField;