// Notice.tsx

import React, { useEffect, useState } from 'react';
import { addNotice, NoticePosition } from './NoticeReceiver';
import "../styles/web/Notice.scss";

export interface NoticeProps {
    uniqueKey?: string; // deduplication key — notices with the same key won't stack
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    position?: 'inline' | NoticePosition;
    actionLabel?: string;
    onAction?: () => void;
    validity?: number | 'lifetime';
}

export const Notice: React.FC<NoticeProps> = ({
    uniqueKey,
    title,
    message,
    type = 'success',
    position = 'notice',
    actionLabel,
    onAction,
    validity = 'lifetime',
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (position === 'inline') return;

        addNotice(
            { uniqueKey,title, message, type, position, actionLabel, onAction },
            validity
        );
        setIsVisible(false);
    }, []);

    // INLINE rendering
    if (position !== 'inline') return null;
    if (!isVisible) return null;
    if (!title && !message) return null;

    return (
        <div className={`ui-notice type-${type} display-${position}`}>
            {title && <div className="notice-text">{title}</div>}

            {Array.isArray(message)
                ? message.map((msg, i) => (
                        <div key={i} className="notice-desc">{msg}</div>
                    ))
                : message && <div className="notice-desc">{message}</div>
            }

            {actionLabel && (
                <button className="notice-action" onClick={onAction}>
                    {actionLabel}
                </button>
            )}

            <button
                className="notice-close"
                onClick={() => setIsVisible(false)}
            >
                ×
            </button>
        </div>
    );
};