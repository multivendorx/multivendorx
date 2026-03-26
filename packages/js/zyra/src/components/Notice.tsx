// Notice.tsx — merged from Notice.tsx + NoticeReceiver.tsx

import React, { useEffect, useState } from 'react';
import '../styles/web/Notice.scss';
import { FieldComponent } from './fieldUtils';

type NoticePosition = 'float' | 'notice' | 'banner';

interface NoticeItem {
    uniqueKey: string;
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    position: NoticePosition;
    actionLabel?: string;
    onAction?: () => void;
    expiresAt?: number;
}

const STORAGE_KEY = 'zyra_app_notices_v1';

let noticeQueue: NoticeItem[] = [];
const subscribers = new Set<(items: NoticeItem[]) => void>();

const getStored = (): NoticeItem[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return [];
        }
        const parsed: NoticeItem[] = JSON.parse(data);
        return parsed.filter((n) => typeof n.expiresAt === 'number');
    } catch {
        return [];
    }
};

const persist = () => {
    const persistable = noticeQueue.filter(
        (n) => typeof n.expiresAt === 'number'
    );
    if (persistable.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    }
};

const broadcast = () => {
    persist();
    subscribers.forEach((cb) => cb([...noticeQueue]));
};

// initialize
if (typeof window !== 'undefined') {
    noticeQueue = getStored();
}

export const NoticeManager = {
    subscribe(cb: (items: NoticeItem[]) => void) {
        subscribers.add(cb);
        cb([...noticeQueue]);
        return () => subscribers.delete(cb);
    },

    add(notice: Omit<NoticeItem, 'expiresAt'>, validity?: number | 'lifetime') {
        const uniqueKey = notice.uniqueKey || Date.now().toString();
        if (noticeQueue.some((n) => n.uniqueKey === uniqueKey)) {
            return;
        }

        let finalValidity: number | 'lifetime';

        if (validity !== undefined) {
            finalValidity = validity;
        } else {
            finalValidity = notice.position === 'float' ? 2000 : 'lifetime';
        }

        const expiresAt =
            finalValidity === 'lifetime'
                ? undefined
                : Date.now() + (finalValidity as number);

        noticeQueue.push({
            ...notice,
            uniqueKey,
            expiresAt,
        });

        if (expiresAt && typeof finalValidity === 'number') {
            setTimeout(() => {
                NoticeManager.remove(uniqueKey);
            }, finalValidity);
        }

        broadcast();
    },

    remove(uniqueKey: string) {
        noticeQueue = noticeQueue.filter((n) => n.uniqueKey !== uniqueKey);
        broadcast();
    },

    clearSession() {
        noticeQueue = noticeQueue.filter((n) => n.expiresAt);
        broadcast();
    },
};

/* ──────────────────────────────────────────────────────────────
   Shared Render Helper
────────────────────────────────────────────────────────────── */

const renderNoticeContent = (item: NoticeItem, onClose?: () => void) => (
    <>
        <i className={`admin-font adminfont-${item.type}`} />

        <div className="notice-details">
            {item.title && <div className="notice-text">{item.title}</div>}

            {Array.isArray(item.message) ? (
                <>
                    {item.message.map((msg, i) => (
                        <div key={i} className="notice-desc">
                            <span dangerouslySetInnerHTML={{ __html: msg }} />
                            {item.actionLabel && (
                                <div
                                    className="banner-btn"
                                    onClick={item.onAction}
                                >
                                    {item.actionLabel}
                                </div>
                            )}
                        </div>
                    ))}

                    {onClose && (
                        <i
                            className="close-icon adminfont-close"
                            onClick={onClose}
                        />
                    )}
                </>
            ) : (
                item.message && (
                    <div
                        className="notice-desc"
                        dangerouslySetInnerHTML={{ __html: item.message }}
                    />
                )
            )}
        </div>
    </>
);

export interface NoticeProps {
    uniqueKey?: string;
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    displayPosition?: 'inline' | 'inline-notice' | NoticePosition;
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
    validity,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (displayPosition === 'inline' || displayPosition === 'inline-notice') {
            return;
        }
        NoticeManager.add(
            {
                uniqueKey,
                title,
                message,
                type,
                position: displayPosition,
                actionLabel,
                onAction,
            },
            validity
        );

        setIsVisible(false);
    }, []);

    const isInline = ['inline', 'inline-notice'].includes(displayPosition);

        if (!isInline || !isVisible || (!title && !message)) {
            return null;
        }

    const item: NoticeItem = {
        uniqueKey: uniqueKey || 'inline',
        title,
        message,
        type,
        position: 'notice',
        actionLabel,
        onAction,
    };

    return (
        <div className={`ui-notice type-${type} display-${displayPosition}`}>
            {renderNoticeContent(item, () => setIsVisible(false))}
        </div>
    );
};

// ─── <NoticeReceiver> — mounts in layout to display store notices ─────────────

interface NoticeReceiverProps {
    position: NoticePosition;
}

export const NoticeReceiver: React.FC<NoticeReceiverProps> = ({ position }) => {
    const [items, setItems] = useState<NoticeItem[]>([]);

    useEffect(() => {
        return NoticeManager.subscribe((notices) => {
            setItems(notices.filter((n) => n.position === position));
        });
    }, [position]);

    if (!items.length) {
        return null;
    }

    return (
        <div className={`receiver receiver-${position}`}>
            {items.map((item) => (
                <div
                    key={item.uniqueKey}
                    className={`ui-notice type-${item.type} display-${item.position}`}
                >
                    {renderNoticeContent(item, () =>
                        NoticeManager.remove(item.uniqueKey)
                    )}
                </div>
            ))}
        </div>
    );
};

/* ──────────────────────────────────────────────────────────────
   NoticeField (FieldRegistry)
────────────────────────────────────────────────────────────── */

const NoticeField: FieldComponent = {
    render: ({ field }) => {
        const item: NoticeItem = {
            uniqueKey: field.uniqueKey || field.key,
            title: field.title,
            message: field.message,
            type: field.noticeType || 'info',
            position: 'notice',
            actionLabel: field.actionLabel,
            onAction: field.onAction,
        };

        return (
            <div
                className={`ui-notice type-${item.type} display-${item.position}`}
            >
                {renderNoticeContent(item)}
            </div>
        );
    },
};

export default NoticeField;
