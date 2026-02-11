import React, {
    forwardRef,
    useRef,
    useState,
} from 'react';
import { useOutsideClick } from '../useOutsideClick';
// import '../styles/web/Popup.scss';

import { FieldComponent } from '../types';

export type PopupPosition =
    | 'inline'
    | 'right'
    | 'left'
    | 'top'
    | 'bottom'
    | 'center';

export type PopupVariant =
    | 'module'
    | 'pro';

export interface PopupButton {
    text: string;
    icon?: string;
    href?: string;
    color?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
}

export interface PopupFeature {
    title: string;
    description?: string;
    icon?: string;
}

export interface PopupMessage {
    text: string;
    des?: string;
    icon?: string;
}
export interface BtnLink {
    site: string;
    price: string;
    link: string;
}
export interface PopupProps {
    position?: PopupPosition;
    variant?: PopupVariant;
    open?: boolean;
    toggleIcon?: string;
    width?: number | string;
    height?: number | string;
    className?: string;
    showBackdrop?: boolean;
    onOpen?: () => void;
    onClose?: () => void;

    title?: string;
    description?: string;
    features?: PopupFeature[];
    buttons?: PopupButton[];

    children?: React.ReactNode;

    proUrl?: string;
    messages?: PopupMessage[];
    moreText?: string;
    moduleName?: string;
    settings?: string;
    plugin?: string;
    message?: string;
    moduleButton?: string;
    pluginDescription?: string;
    pluginButton?: string;
    SettingDescription?: string;
    pluginUrl?: string;
    modulePageUrl?: string;
    btnLink?: BtnLink[];
    upgradeBtnText?: string;
    confirmMode?: boolean;
    confirmMessage?: string;
    confirmYesText?: string;
    confirmNoText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export const PopupUI = forwardRef<HTMLDivElement, PopupProps>(
    (
        {
            position = 'inline',
            open: controlledOpen,
            toggleIcon,
            width = 14,
            height = 'auto',
            className = '',
            showBackdrop = true,
            onOpen,
            onClose,

            title,
            description,
            buttons,

            variant,
            children,

            moduleName,
            proUrl,
            messages,
            moreText,
            settings,
            plugin,
            message,
            moduleButton,
            pluginDescription,
            pluginButton,
            SettingDescription,
            pluginUrl,
            modulePageUrl,
            btnLink,
            upgradeBtnText,
            confirmMode,
            confirmMessage,
            confirmYesText,
            confirmNoText,
        },
        ref
    ) => {
        const [internalOpen, setInternalOpen] =
            useState(false);

        const wrapperRef =
            useRef<HTMLDivElement>(null);

        const isControlled =
            controlledOpen !== undefined;
        const open = isControlled
            ? controlledOpen
            : internalOpen;

        const handleOpen = () => {
            if (!isControlled)
                setInternalOpen(true);
            onOpen?.();
        };

        const handleClose = () => {
            if (!isControlled)
                setInternalOpen(false);
            onClose?.();
        };

        const handleToggle = (
            e: React.MouseEvent
        ) => {
            e.stopPropagation();
            open
                ? handleClose()
                : handleOpen();
        };

        useOutsideClick(wrapperRef, () => {
            if (open) handleClose();
        });

        const styles: React.CSSProperties =
        {
            minWidth: typeof width === 'number' ? `${width}rem` : width,
            height: typeof height === 'number' ? `${height}rem` : height,
        };

        return (
            <div
                ref={(node) => {
                    wrapperRef.current =
                        node;
                    if (
                        typeof ref ===
                        'function'
                    ) {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                className={`popup popup-${position} ${className}`}
            >
                {position === 'inline' && (
                    <div className="popup-toggle" onClick={handleToggle}>
                        {toggleIcon && (
                            <i className={toggleIcon} />
                        )}
                    </div>
                )}

                {showBackdrop && position !== 'inline' && open && (
                    <div
                        className="popup-backdrop"
                        onClick={
                            handleClose
                        }
                    />
                )}

                {open && (
                    <div
                        className="popup-content"
                        style={styles}
                        onClick={(
                            e
                        ) =>
                            e.stopPropagation()
                        }
                    >
                        {title && (
                            <div className="popup-header">
                                <h3>
                                    {title}
                                </h3>
                            </div>
                        )}


                        {variant === 'pro' && (
                            <>
                                <div className="top-section">
                                    <div className="heading">{title}</div>
                                    <div className="description">
                                        {description}
                                    </div>
                                    <div className="price">
                                        {/* {selectedBtn.price} */}
                                        $150
                                    </div>
                                    <div className="select-wrapper">
                                        For website with
                                        {/* <select
                                            value={selectedBtn.link}
                                            onChange={(e) => {
                                                const found = btnLink.find(
                                                    (b) =>
                                                        b.link === e.target.value
                                                );
                                                if (found) {
                                                    setSelectedBtn(found);
                                                }
                                            }}
                                        >
                                            {btnLink.map((b, idx) => (
                                                <option
                                                    key={idx}
                                                    value={b.link}
                                                >
                                                    {b.site}
                                                </option>
                                            ))}
                                        </select> */}
                                        site license
                                    </div>
                                    {/* <a
                                        className="admin-btn"
                                        href={selectedBtn.link}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {props.upgradeBtnText}{' '}
                                        <i className="adminfont-arrow-right arrow-icon"></i>
                                    </a> */}
                                </div>
                                <div className="popup-content">
                                    <div className="heading-text">
                                        Why should you upgrade?
                                    </div>

                                    <ul>
                                        {/* {props.messages?.map(
                                            (message, index) => (
                                                <li key={index}>
                                                    <div className="title">
                                                        <i
                                                            className={
                                                                message.icon
                                                            }
                                                        ></i>{' '}
                                                        {message.text}
                                                    </div>
                                                    <div className="sub-text">
                                                        {message.des}
                                                    </div>
                                                </li>
                                            )
                                        )} */}
                                    </ul>
                                </div>
                            </>
                        )}

                        {variant === 'module' && (
                            <>
                                <div className="popup-header">
                                    <i
                                    className={`adminfont-${moduleName}`}
                                    ></i>
                                </div>
                                <div className="popup-body">
                                    <h2>
                                        Activate{' '}
                                        {String(moduleName)
                                            .split('-')
                                            .map(
                                                (word: string) =>
                                                    word.charAt(0).toUpperCase() +
                                                    word.slice(1)
                                            )
                                            .join(' ')}
                                    </h2>
                                    <p>{message}</p>

                                    <div className="buttons-wrapper center">
                                        <a
                                            className="admin-btn btn-purple"
                                            href={modulePageUrl}
                                        >
                                            <i className="adminfont-eye"></i>{' '}
                                            {moduleButton}
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}


                        {description && (
                            <div className="popup-description">
                                {description}
                            </div>
                        )}

                        {children && (
                            <div className="popup-body">
                                {children}
                            </div>
                        )}

                        {buttons && buttons.length > 0 && (
                            <div className="popup-footer">
                                {buttons.map(
                                    (
                                        btn,
                                        index
                                    ) =>
                                        btn.href ? (
                                            <a
                                                key={
                                                    index
                                                }
                                                href={
                                                    btn.href
                                                }
                                                className={`popup-btn popup-btn--${btn.color ||
                                                    'primary'
                                                    }`}
                                            >
                                                {btn.icon && (
                                                    <i
                                                        className={
                                                            btn.icon
                                                        }
                                                    />
                                                )}
                                                {
                                                    btn.text
                                                }
                                            </a>
                                        ) : (
                                            <button
                                                key={
                                                    index
                                                }
                                                onClick={
                                                    btn.onClick
                                                }
                                                className={`popup-btn popup-btn--${btn.color ||
                                                    'primary'
                                                    }`}
                                            >
                                                {btn.icon && (
                                                    <i
                                                        className={
                                                            btn.icon
                                                        }
                                                    />
                                                )}
                                                {
                                                    btn.text
                                                }
                                            </button>
                                        )
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

PopupUI.displayName = 'PopupUI';

const Popup: FieldComponent = {
    render: ({
        field,
        value,
        onChange,
        canAccess,
        appLocalizer
    }) => (
        <PopupUI
            position={field.position}
            toggleIcon={field.toggleIcon}
            width={field.width}
            height={field.height}
            className={field.className}
            showBackdrop={field.showBackdrop}
            open={field.open}
            title={field.title}
            description={field.description}
            features={field.features}
            buttons={field.buttons}
        >
            {field.children}
        </PopupUI>
    ),
};

export default Popup;
