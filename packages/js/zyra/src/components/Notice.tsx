// Notice.tsx

import React, { useEffect, useState } from 'react';
import { addNotice, NoticePosition } from './NoticeReceiver';
import "../styles/web/Notice.scss";

export interface NoticeProps {
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    position?: 'inline' | NoticePosition;
    actionLabel?: string;
    onAction?: () => void;
    validity?: number | 'lifetime';
}

export const Notice: React.FC<NoticeProps> = ({
    title,
    message,
    type = 'success',
    position = 'float',
    actionLabel,
    onAction,
    validity = 'lifetime',
}) => {
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => {
        if (position === 'inline') return;

        // addNotice is idempotent — it fingerprints content and ignores duplicates.
        // No ref guard needed here; safe to call on every mount/remount/tab switch.
        addNotice(
            { title, message, type, position, actionLabel, onAction },
            validity
        );
        setIsVisible(false);
    }, []);

    // INLINE rendering
    if (position !== 'inline') return null;
    if (!isVisible) return null;
    if (!title && !message) return null;

    return (
        <div className={`ui-notice type-${type}`}>
            <div className="notice-details">
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
        </div>
    );
};