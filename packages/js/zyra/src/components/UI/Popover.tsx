import React, { useState, useRef } from 'react';
import "../../styles/web/UI/Popover.scss";
import { useOutsideClick } from '../useOutsideClick';

interface PopoverProps {
    toggleIcon?: string;
    toggleContent?: React.ReactNode;
    className?:string;
}
const Popover: React.FC<PopoverProps> = ({
    toggleIcon,
    toggleContent,
    className='',
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
                    className={`popover popover-default`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {toggleContent}
                </div>
            )}
        </div>
    );
};

export default Popover;