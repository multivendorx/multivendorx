import React, { forwardRef, useRef, useState } from 'react';
import { useOutsideClick, FieldComponent } from './fieldUtils';
import '../styles/web/Popup.scss';
import Tooltip from './UI/Tooltip';

export type PopupPosition =
    | 'menu-dropdown'
    | 'slide-right-to-left'
    | 'slide-left-to-right'
    | 'slide-top-to-bottom'
    | 'slide-bottom-to-top'
    | 'lightbox';

export interface PopupHeaderProps {
    icon?: string;
    title?: string;
    description?: string;
}

export interface PopupProps {
    position?: PopupPosition;
    open?: boolean;
    toggleIcon?: string;
    tooltipName?: string;
    header?: PopupHeaderProps;
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
            position = 'slide-right-to-left',
            open: controlledOpen,
            toggleIcon,
            tooltipName = 'Menu',
            width = 14,
            height = 'fit-content',
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
        const [internalOpen, setInternalOpen] = useState(false);
        const wrapperRef = useRef<HTMLDivElement>(null);
        const isControlled = controlledOpen !== undefined;
        const open = isControlled ? controlledOpen : internalOpen;

        const handleOpen = () => {
            if (!isControlled) {
                setInternalOpen(true);
            }
            onOpen?.();
        };

        const handleClose = () => {
            if (!isControlled) {
                setInternalOpen(false);
            }
            onClose?.();
        };

        const handleToggle = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (open) {
                handleClose();
            } else {
                handleOpen();
            }
        };

        useOutsideClick(wrapperRef, () => {
            if (open) {
                handleClose();
            }
        });

        const styles: React.CSSProperties = {
            minWidth: typeof width === 'number' ? `${width}rem` : width,
            height: typeof height === 'number' ? `${height}rem` : height,
        };

        return (
            <div
                className={`popup ${className} ${open ? 'popup-open' : ''}`}
                ref={wrapperRef}
            >
                {toggleIcon && (
                    <Tooltip text={tooltipName} position="bottom"  className={open ? 'hidden' : ''}>
                        <i
                            onClick={handleToggle}
                            className={`popup-icon adminfont-${toggleIcon}`}
                        />
                    </Tooltip>
                )}

                {showBackdrop && !toggleIcon && open && (
                    <div className="popup-backdrop" onClick={handleClose} />
                )}

                {open && (
                    <div
                        className={`popup-content`}
                        style={styles}
                        data-position={position}
                        onClick={(e) => e.stopPropagation()}
                        ref={ref}
                    >
                        {header && (
                            <div className="popup-header">
                                <div className="popup-title">
                                    {header.icon && (
                                        <i
                                            className={`adminfont-${header.icon}`}
                                        ></i>
                                    )}
                                    {header.title}
                                </div>
                                {header.description && (
                                    <div className="desc">
                                        {header.description}
                                    </div>
                                )}
                            </div>
                        )}
                        {position != "menu-dropdown" && 
                            <i onClick={handleClose} className="close-icon adminfont-close" />
                        }
                        <div className="popup-body">{children}</div>

                        {footer && <div className="popup-footer">{footer}</div>}
                    </div>
                )}
            </div>
        );
    }
);

const Popup: FieldComponent = {
    render: ({ field }) => (
        <PopupUI
            position={field.position}
            toggleIcon={field.toggleIcon}
            tooltipName={field.tooltipName}
            width={field.width}
            height={field.height}
            className={field.className}
            showBackdrop={field.showBackdrop}
            open={field.open}
            onClose={field.onClose}
            onOpen={field.onOpen}
            header={field.header}
            footer={field.footer}
        >
            {field.children}
        </PopupUI>
    ),
};

export default Popup;
