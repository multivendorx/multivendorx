// NoticeReceiver.tsx

import React, { useEffect, useState } from 'react';

export type NoticePosition = 'float' | 'notice' | 'banner';

export interface NoticeItem {
    id: string;
    title?: string;
    message?: string | string[];
    type?: 'info' | 'success' | 'warning' | 'error' | 'banner';
    position: NoticePosition;
    actionLabel?: string;
    onAction?: () => void;
    expiresAt?: number; // undefined = session-only (never persisted)
    _fp?: string;       // internal content fingerprint for deduplication
}

const STORAGE_KEY = 'app_notices_v1';

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

// Deterministic fingerprint based on content — used to deduplicate notices.
// Two notices with the same title/message/type/position are considered identical.
const fingerprint = (notice: Omit<NoticeItem, 'id' | 'expiresAt'>): string => {
    return [
        notice.position,
        notice.type ?? '',
        notice.title ?? '',
        Array.isArray(notice.message) ? notice.message.join('|') : (notice.message ?? ''),
        notice.actionLabel ?? '',
    ].join('::');
};

export const addNotice = (
    notice: Omit<NoticeItem, 'id' | 'expiresAt'>,
    validity: number | 'lifetime' = 'lifetime'
) => {
    const fp = fingerprint(notice);

    // Deduplicate: if an identical notice is already in the store, do nothing.
    // This makes addNotice idempotent — safe to call on every component mount/remount.
    const isDuplicate = notices.some(n => n._fp === fp);
    if (isDuplicate) return;

    const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString();

    // 'lifetime' → no expiresAt → session-only, not persisted
    const expiresAt = validity === 'lifetime' ? undefined : Date.now() + validity;

    notices.push({ ...notice, id, expiresAt, _fp: fp });
    notify();
};

export const removeNotice = (id: string) => {
    notices = notices.filter(n => n.id !== id);
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
                <div key={item.id} className={`ui-notice type-${item.type}`}>
                    <div className="notice-details">
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
                </div>
            ))}
        </div>
    );
};