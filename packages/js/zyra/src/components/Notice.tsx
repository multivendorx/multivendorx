// External dependencies
import React, { useEffect, useRef } from 'react';
import "../styles/web/UI/SuccessNotice.scss";

export const VARIANT_MODES = {
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

export const DISPLAY_MODES = {
    toast:  'admin-notice-wrapper', 
    inline: 'admin-notice-inline',
    banner: 'admin-notice-banner',
};

export type NoticeVariant = keyof typeof VARIANT_MODES;
export type NoticeDisplay = keyof typeof DISPLAY_MODES;

export interface NoticeProps {
    /** The body text of the notice */
    message?: string;
    /** Optional heading above the message */
    title?: string;
    /** Visual style of the notice */
    variant?: NoticeVariant;
    display?: NoticeDisplay | string;
    className?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    autoDismiss?: number;
    iconClass?: string;
}


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

    const variantMeta  = VARIANT_MODES[variant];
    const resolvedIcon = iconClass ?? variantMeta.iconClass;
    const resolvedTitle = title ?? variantMeta.title;
    const displayClass =
        className ??
        (DISPLAY_MODES[display as NoticeDisplay] ?? display);

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