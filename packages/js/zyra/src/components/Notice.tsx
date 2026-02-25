// External dependencies
import React, { useEffect } from 'react';
import "../styles/web/UI/SuccessNotice.scss";
import { FieldComponent } from './types';

// export const DISPLAY_POSITIONS = {
//     float: 'float', 
//     inline: 'inline',
//     banner: 'banner',
//     general: 'general',
// };

export const NOTICE_TYPES = {
    success: {
        title: 'Great!',
        icon: 'icon-yes',
        // defaultDisplayPosition: 'float',
    },
    error: {
        title: 'Error',
        icon: 'error',
        // defaultDisplayPosition: 'general',
    },
    warning: {
        title: 'Warning',
        icon: 'warning',
        // defaultDisplayPosition: 'general',
    },
    info: {
        title: 'Info',
        icon: 'info',
        // defaultDisplayPosition: 'general',
    },
    // banner: {
    //     defaultDisplayPosition: 'banner',
    // }
};

export type NoticeType = NonNullable<keyof typeof NOTICE_TYPES>;
// export type NoticeDisplay = NonNullable<keyof typeof DISPLAY_POSITIONS>;

export interface NoticeItem {
    title?: string;
    message: string;
    icon?: string;
    action?: {
        label: string;
        url?: string;
        onClick?: () => void;
    };
}

export interface NoticeProps {
    type?: NoticeType;
    title?: string;
    message?: string | NoticeItem[];
    // displayPosition?: NoticeDisplay | string;
    displayPosition?: 'float' | 'inline' | 'banner' | 'notice' | string;
    className?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    autoDismiss?: number;
    icon?: string;
}

export const Notice: React.FC<NoticeProps> = ({
    message,
    title,
    type,
    // displayPosition,
    displayPosition = 'notice',
    className,
    dismissible = false,
    onDismiss,
    autoDismiss = 300000,
    icon,
}) => {
    if (!message || message === '') return null;
    if (Array.isArray(message) && message.length === 0) return null;

    // Auto-dismiss - only for string messages
    useEffect(() => {
        if (!message || Array.isArray(message) || !autoDismiss) return;

        const timer = setTimeout(() => onDismiss?.(), autoDismiss);
        return () => clearTimeout(timer);
    }, [message, autoDismiss, onDismiss]);

    const variantMeta =
        (type && type in NOTICE_TYPES
            ? NOTICE_TYPES[type as NoticeType]
            : NOTICE_TYPES.info);
    // const resolvedDisplayPosition =
    //     displayPosition ||
    //     variantMeta.defaultDisplayPosition ||
    //     'general_notice';

    // const displayModifier =
    //     DISPLAY_POSITIONS[resolvedDisplayPosition as NoticeDisplay] ??
    //     resolvedDisplayPosition;

    const rootClass = [
        'ui-notice',
        // `ui-notice-${displayModifier}`,
        `type-${type}`, `variant-${displayPosition}`,
        // Array.isArray(message) ? 'ui-notice-multiple' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    // Normalize to array for consistent rendering
    const items: NoticeItem[] = Array.isArray(message)
        ? message
        : [{
            title: title ?? variantMeta.title,
            message: message,
            icon: icon ?? variantMeta.icon,
        }];

    return (
        <div className={`${rootClass}`}>
            {dismissible && (
                <i className="close-icon adminfont-close" onClick={onDismiss} aria-hidden="true" />
            )}
            {items.map((item, index) => {
                const itemIcon = item.icon ?? icon ?? variantMeta.icon;
                const itemTitle = item.title;
                return (
                    <div key={index} className="notice-item">
                        <i className={`admin-font adminfont-${itemIcon}`} aria-hidden="true" />

                        <div className="notice-item-details">
                            {itemTitle && (
                                <div className="notice-text">{itemTitle}</div>
                            )}
                            <div className="notice-desc">
                                {item.message}
                                {displayPosition == 'banner' && (
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
                displayPosition={display}
                icon={field.icon}
                dismissible={field.dismissible}
                className={field.className}
            />
        );
    },
};

export default NoticeField;