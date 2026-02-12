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

export interface PopupProps {
    position?: PopupPosition;
    open?: boolean;
    toggleIcon?: string;
    header?: PopoverHeaderProps;
    footer?: React.ReactNode;
    width?: number | string;
    height?: number | string;
    className?: string;
    showBackdrop?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    children?: React.ReactNode;
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
            children,
            header,
            footer,
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
            <div className={`popup popup-${position} ${className}`}>
                {toggleIcon && (
                    <div className="popup-toggle" onClick={handleToggle}>
                        <i className={ toggleIcon }/>
                    </div>
                )}

                {showBackdrop && !toggleIcon && open && (
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
                        {header && (
                            <div className="popover-header">
                                <div className="popover-header-content">
                                    {header.icon && (
                                        <i className={`popover-header-icon ${header.icon}`}></i>
                                    )}
                                    <div className="popover-header-text">
                                        <div className="popover-title">{header.title}</div>
                                        {header.description && (
                                            <div className="popover-description">{header.description}</div>
                                        )}
                                    </div>
                                </div>
                                {header.showCloseButton && (
                                    <button
                                        className="popover-close-button"
                                        onClick={handleClose}
                                        aria-label="Close"
                                    >
                                        <i className="icon adminfont-close"></i>
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="popup-body">
                            {children}
                        </div>

                        {footer && (
                            <div className="popover-footer">
                                {footer}
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
        field
    }) => (
        <PopupUI
            position={field.position}
            toggleIcon={field.toggleIcon}
            width={field.width}
            height={field.height}
            className={field.className}
            showBackdrop={field.showBackdrop}
            open={field.open}
            header={field.header}
            footer={field.footer}
        >
            {field.children}
        </PopupUI>
    ),
};

export default Popup;