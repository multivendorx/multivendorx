// Notice.tsx

import React, { useEffect, useState } from 'react';
import { addNotice, NoticePosition, renderNoticeContent, NoticeItem } from './NoticeReceiver';
import "../styles/web/Notice.scss";

export interface NoticeProps {
    uniqueKey?: string; // deduplication key — notices with the same key won't stack
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    displayPosition?: 'inline' | NoticePosition;
    actionLabel?: string;
    onAction?: () => void;
    validity?: number | 'lifetime';
}

export const Notice: React.FC<NoticeProps> = ({
    uniqueKey,
    title,
    message,
    type = 'success',
    displayPosition = 'notice',
    actionLabel,
    onAction,
    validity = 'lifetime',
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (displayPosition === 'inline') return;

        addNotice(
            { uniqueKey, title, message, type, displayPosition, actionLabel, onAction },
            validity
        );
        setIsVisible(false);
    }, []);

    // INLINE rendering
    if (displayPosition !== 'inline') return null;
    if (!isVisible) return null;
    if (!title && !message) return null;

    // Create a NoticeItem object for the render function
    const item: NoticeItem = {
        uniqueKey: uniqueKey || 'inline',
        title,
        message,
        type,
        position: 'notice', // Default position for inline (not used visually)
        actionLabel,
        onAction
    };

    return (
        <div className={`ui-notice type-${type} display-${displayPosition}`}>
            {renderNoticeContent(item, () => setIsVisible(false))}
        </div>
    );
};