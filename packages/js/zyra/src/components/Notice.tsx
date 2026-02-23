// External dependencies
import React, { useEffect, useRef } from 'react';
import "../styles/web/UI/SuccessNotice.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NoticeVariant = 'success' | 'error' | 'warning' | 'info';

export type NoticeDisplay = 'toast' | 'inline' | 'banner';

export interface NoticeProps {
    /** The body text of the notice */
    message?: string;
    /** Optional heading above the message */
    title?: string;
    /** Visual style of the notice */
    variant?: NoticeVariant;
    /**
     * Controls the layout/positioning CSS class on the root element.
     *
     * Pass one of the pre-defined display modes OR any custom class string:
     *   - "toast"   → "admin-notice-wrapper"   (floating popup, legacy behaviour)
     *   - "inline"  → "admin-notice-inline"    (sits in document flow)
     *   - "banner"  → "admin-notice-banner"    (full-width strip)
     *   - any other string is forwarded as-is  (escape hatch for legacy classes
     *     like "field-error" or "invalid-massage")
     */
    display?: NoticeDisplay | string;
    /** Completely override the root className (skips display mapping) */
    className?: string;
    /** Show a close/dismiss button */
    dismissible?: boolean;
    /** Called when the user dismisses the notice */
    onDismiss?: () => void;
    /**
     * Auto-dismiss after N milliseconds.
     * Pass 0 or omit to keep the notice visible until manually dismissed.
     */
    autoDismiss?: number;
    /** Override the icon class (adminfont-*) */
    iconClass?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISPLAY_CLASS_MAP: Record<string, string> = {
    toast:  'admin-notice-wrapper',  // keeps full backward-compat with SuccessNotice
    inline: 'admin-notice-inline',
    banner: 'admin-notice-banner',
};

const VARIANT_DEFAULTS: Record<
    NoticeVariant,
    { title: string; iconClass: string; modifierClass: string }
> = {
    success: {
        title:         'Great!',
        iconClass:     'adminfont-icon-yes',
        modifierClass: 'notice--success',
    },
    error: {
        title:         'Error',
        iconClass:     'adminfont-close',
        modifierClass: 'notice--error',
    },
    warning: {
        title:         'Warning',
        iconClass:     'adminfont-warning',
        modifierClass: 'notice--warning',
    },
    info: {
        title:         'Info',
        iconClass:     'adminfont-info',
        modifierClass: 'notice--info',
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

const Notice: React.FC<NoticeProps> = ({
    message,
    title,
    variant      = 'success',
    display      = 'toast',
    className,
    dismissible  = false,
    onDismiss,
    autoDismiss  = 0,
    iconClass,
}) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Auto-dismiss ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!message || !autoDismiss) return;

        timerRef.current = setTimeout(() => {
            onDismiss?.();
        }, autoDismiss);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [message, autoDismiss, onDismiss]);

    if (!message) return null;

    const variantMeta  = VARIANT_DEFAULTS[variant];
    const resolvedIcon = iconClass ?? variantMeta.iconClass;
    const resolvedTitle = title ?? variantMeta.title;
    const displayClass =
        className ??
        (DISPLAY_CLASS_MAP[display as string] ?? display);

    const rootClass = [
        displayClass
    ]
        .filter(Boolean)
        .join(' ');

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={ rootClass }>
            <i className={ `admin-font ${ resolvedIcon }` } aria-hidden="true" />

            <div className="notice-details">
                { resolvedTitle && (
                    <div className="title">{ resolvedTitle }</div>
                ) }
                <div className="desc">{ message }</div>
            </div>

            { dismissible && (
                <button
                    type="button"
                    className="notice-dismiss"
                    aria-label="Dismiss notice"
                    onClick={ onDismiss }
                >
                    <i className="admin-font adminfont-close" aria-hidden="true" />
                </button>
            ) }
        </div>
    );
};

export default Notice;