// NoticeReceiver.tsx

import React, { useEffect, useState } from 'react';

export type NoticePosition = 'float' | 'notice' | 'banner';

export interface NoticeItem {
    uniqueKey: string;// caller-supplied deduplication key — if set, only one notice with this key can exist at a time
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    position: NoticePosition;
    actionLabel?: string;
    onAction?: () => void;
    expiresAt?: number; // undefined = session-only (never persisted)
}

const STORAGE_KEY = 'zyra_app_notices_v1';

let subscribers: Array<(items: NoticeItem[]) => void> = [];

// Safe localStorage read — only returns notices that have an expiry
// (lifetime/session notices are never written to storage, so they won't pile up on refresh)
const getStored = (): NoticeItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const parsed: NoticeItem[] = JSON.parse(data);
        // Extra safety: strip anything without expiresAt that somehow got persisted
        return parsed.filter(n => typeof n.expiresAt === 'number');
    } catch {
        return [];
    }
};

let notices: NoticeItem[] = getStored();

// Only persist notices that have a real expiry timestamp.
// Session-only ("lifetime") notices are intentionally excluded — they should
// not survive a page reload, so writing them to storage is wrong.
const persist = () => {
    if (typeof window === 'undefined') return;
    const persistable = notices.filter(n => typeof n.expiresAt === 'number');
    if (persistable.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    }
};

const notify = () => {
    persist();
    subscribers.forEach(cb => cb([...notices]));
};

export const subscribe = (callback: (items: NoticeItem[]) => void) => {
    subscribers.push(callback);
    callback([...notices]);
    return () => {
        subscribers = subscribers.filter(cb => cb !== callback);
    };
};

export const addNotice = (
    notice: Omit<NoticeItem, 'expiresAt'>,
    validity: number | 'lifetime' = 'lifetime'
) => {
    // If no uniqueKey passed → generate one
    const uniqueKey = notice.uniqueKey || Date.now().toString();

    // If same uniqueKey already exists → do nothing
    if (notices.some(n => n.uniqueKey === uniqueKey)) return;

    const id = notice.uniqueKey || Date.now().toString();

    const expiresAt =
        validity === 'lifetime' ? undefined : Date.now() + validity;

    notices.push({ ...notice, uniqueKey, expiresAt });
    notify();
};


export const flushExpired = () => {
    const now = Date.now();
    const before = notices.length;
    // Keep session-only notices (no expiresAt) and non-expired timed ones
    notices = notices.filter(n => !n.expiresAt || n.expiresAt > now);
    if (before !== notices.length) notify();
};

// Call this on app unmount / logout to clear session-only notices from memory
// (they're already not in localStorage, but the in-memory array lives for the module lifetime)
export const clearSessionNotices = () => {
    notices = notices.filter(n => typeof n.expiresAt === 'number');
    notify();
};

interface NoticeReceiverProps {
    position: NoticePosition;
}

export const NoticeReceiver: React.FC<NoticeReceiverProps> = ({ position }) => {
    const [items, setItems] = useState<NoticeItem[]>([]);

    useEffect(() => {
        return subscribe((all) => {
            setItems(all.filter(n => n.position === position));
        });
    }, [position]);

    useEffect(() => {
        flushExpired();
        const interval = setInterval(flushExpired, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!items.length) return null;

    return (
        <div className={`receiver receiver-${position}`}>
            {items.map(item => (
                <div key={item.id} className={`ui-notice type-${item.type} display-${position}`}>
                        {item.title && (
                            <div className="notice-text">{item.title}</div>
                        )}

                        {Array.isArray(item.message)
                            ? item.message.map((msg, i) => (
                                  <div key={i} className="notice-desc">{msg}</div>
                              ))
                            : item.message && (
                                  <div className="notice-desc">{item.message}</div>
                              )
                        }

                        {item.actionLabel && (
                            <button className="notice-action" onClick={item.onAction}>
                                {item.actionLabel}
                            </button>
                        )}

                        <button
                            className="notice-close"
                            onClick={() => removeNotice(item.id)}
                        >
                            ×
                        </button>
                </div>
            ))}
        </div>
    );
};