import React, { useState, useRef } from 'react';
import "../../styles/web/UI/Popover.scss";
import { useOutsideClick } from '../useOutsideClick';

interface PopoverProps {
    toggleIcon?: string;
    children: React.ReactNode;
    header?: PopoverHeaderProps;
    footer?: React.ReactNode;
    width?: number | string;
    height?: number | string;
    position?: 'inline' | 'right' | 'left' | 'top' | 'bottom' | 'center';
    className?: string;
    onOpen?: () => void;
    onClose?: () => void;
    open?: boolean;
}

const Popover: React.FC<PopoverProps> = ({
    toggleIcon,
    children,
    header,
    footer,
    width = 14,
    height = 'auto',
    position = 'inline',
    className = '',
    onOpen,
    onClose,
    open: controlledOpen 
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);    
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

    useOutsideClick(wrapperRef, () => {
        if (open) {
            handleClose();
        }
    });

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (open) {
            handleClose();
        } else {
            handleOpen();
        }
    };

    const handleOpen = () => {
        if (controlledOpen === undefined) {
            setInternalOpen(true);
        }
        onOpen?.();
    };

    const handleClose = () => {
        if (controlledOpen === undefined) {
            setInternalOpen(false);
        }
        onClose?.();
    };

    const getDropdownStyles = () => {
        const styles: React.CSSProperties = {
            minWidth: typeof width === 'number' ? `${width}rem` : width,
            height: typeof height === 'number' ? `${height}rem` : height,
        };
        
        return styles;
    };

    return (
        <div className={`popover-wrapper ${className}`} data-position={position} ref={wrapperRef}>
            {position !== 'inline' && open && (
                <div
                    className="popover-backdrop"
                    onClick={handleClose}
                />
            )}

            {position == 'inline' && (
                <div
                    className="popover-toggle"
                    onClick={handleToggle}
                >
                    {toggleIcon && <i className={`popover-icon ${toggleIcon}`}></i>}
                </div>
            )}

            {/* Popover content */}
            {open && (
                <div
                    className="popover-dropdown"
                    onClick={(e) => e.stopPropagation()}
                    style={getDropdownStyles()}
                >
                    {/* Header */}
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

                    {/* popover Body */}
                    <div className="popover-body">
                        {children}
                    </div>

                    {/* popover Footer */}
                    {footer && (
                        <div className="popover-footer">
                            {footer}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Popover;