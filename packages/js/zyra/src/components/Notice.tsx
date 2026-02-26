// External dependencies
import React, { useEffect, useState } from 'react';
import "../styles/web/UI/SuccessNotice.scss";
import { FieldComponent } from './types';

export interface NoticeProps {
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error';
    display?: 'inline' | 'float' | 'banner' | 'notice';
    actionLabel?: string;
    onAction?: () => void;
}

export const Notice: React.FC<NoticeProps> = ({
    title,
    message,
    type = 'success',
    display = 'notice',
    actionLabel,
    onAction,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (display === 'float' && isVisible) {
            const timer = setTimeout(() => setIsVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [display, isVisible]);

    if (!isVisible) return null;
    if (!message && !title) return null;

    const handleDismiss = () => setIsVisible(false);

    const rootClass = [
        'ui-notice',
        `type-${type}`,
        `display-${display}`,
    ]
        .filter(Boolean)
        .join(' ');

    const renderMessage = () => {
        if (!message) return null;

        if (Array.isArray(message)) {
            return (
                <>
                    {message.map((msg, index) => (
                        <div key={index} className="notice-desc">
                            {msg}
                            {actionLabel && (
                                <button className="notice-action" onClick={onAction}> {actionLabel} </button>
                            )}
                        </div>
                    ))}
                    <i className="close-icon adminfont-close" onClick={handleDismiss} />
                </>
            );
        }

        return (
            <div className="notice-desc">{message}</div>
        );
    };

    return (
        <div className={rootClass}>
            <i className={`admin-font adminfont-${type}`} />

            <div className="notice-details">
                {title && <div className="notice-text">{title}</div>}
                {renderMessage()}
            </div>
        </div>
    );
};

const NoticeField: FieldComponent = {
    render: ({ field }) => {
        return (
            <Notice
                type={field.noticeType || field.type}
                display={field.display}
                title={field.title}
                message={field.message}
                actionLabel={field.actionLabel}
                onAction={field.onAction}
            />
        );
    },
};

export default NoticeField;