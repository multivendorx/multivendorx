import React, { useState, useRef } from 'react';
import "../../styles/web/UI/Popover.scss";
import { useOutsideClick } from '../useOutsideClick';

interface PopoverProps {
    toggleIcon?: string;
    toggleContent?: React.ReactNode;
    width?: number; // width in rem
    className?: string;
}
const Popover: React.FC<PopoverProps> = ({
    toggleIcon,
    toggleContent,
    className = '',
    width = 14
}) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useOutsideClick(wrapperRef, () => setOpen(false));

    return (
        <div className={`popover-wrapper ${className}`} ref={wrapperRef}>
            <div
                className="popover-toggle"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
            >
                {toggleIcon && <i className={`popover-icon ${toggleIcon}`}></i>}
            </div>
            {open && (
                <div
                    className={`popover-dropdown`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ minWidth: `${width}rem` }}
                >
                    <div className="popover-body">
                        {toggleContent}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Popover;