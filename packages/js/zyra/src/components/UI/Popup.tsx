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
            <div className={`popup popup--${position} ${className}`}>
                {position === 'inline' && (
                    <div className="popup-toggle" onClick={handleToggle}>
                        {toggleIcon && (
                            <i
                                className={
                                    toggleIcon
                                }
                            />
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
                        <div className="popup-body">
                            {children}
                        </div>
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
        >
            {field.children}
        </PopupUI>
    ),
};

export default Popup;