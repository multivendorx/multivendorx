import React, { useState, useRef, useEffect } from 'react';
import "../../styles/web/UI/Popover.scss";

interface PopoverTab {
    id: string;
    label: string;
    icon?: string;
    content: React.ReactNode;
}

interface PopoverItem {
    title: string;
    icon?: string;
    desc?: string;
    time?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
    className?: string;
}

interface PopoverProps {
    toggleIcon?: string;
    toggleContent?: React.ReactNode;
    items?: PopoverItem[];
    header?: React.ReactNode;
    footer?: React.ReactNode;
    width?: number | string;
    template?: 'default' | 'notification' | 'user' | 'action' | 'tab';
    tabs?: PopoverTab[];
    defaultActiveTab?: string;
    className?: string;

    onTabChange?: (tabId: string) => void;
}

const Popover: React.FC<PopoverProps> = ({
    toggleIcon,
    toggleContent,
    items = [],
    header,
    footer,
    width = '14rem',
    template = 'default',
    tabs = [],
    defaultActiveTab,
    className = '',
    onTabChange
}) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<string | undefined>(
        defaultActiveTab || tabs[0]?.id
    );

    // Reset tab when Popover opens
    useEffect(() => {
        if (open && template === 'tab') {
            setActiveTab(defaultActiveTab || tabs[0]?.id);
        }
    }, [open, template, tabs, defaultActiveTab]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                {toggleContent}
            </div>

            {open && (
                <div
                    className={`popover popover-${template}`}
                    style={{ minWidth: width }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {header && <div className="popover-header">{header}</div>}

                    <div className="popover-body">
                        {/* NOTIFICATION */}
                        {template === 'notification' && (
                            <ul>
                                {items.map((item, index) => (
                                    <li key={index} className={item.className}>
                                        <div
                                            className="item"
                                            onClick={() => {
                                                item.action?.();
                                                setOpen(false);
                                            }}
                                        >
                                            {item.icon && <i className={item.icon}></i>}

                                            <div className="details">
                                                <div className="heading">{item.title}</div>
                                                <div className="message">{item.desc}</div>
                                                <div className="time">{item.time}</div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* TAB */}
                        {template === 'tab' && tabs.length > 0 && (
                            <div className="popover-tabs">
                                <div className="tabs-wrapper">
                                    <div className="tabs-item">
                                        {tabs.map((tab) => (
                                            <div
                                                key={tab.id}
                                                className={`tab ${activeTab === tab.id ? 'active-tab' : ''
                                                    }`}
                                                onClick={() => {
                                                    setActiveTab(tab.id);
                                                    onTabChange?.(tab.id);
                                                }}
                                            >
                                                <span className="tab-name">{tab.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="notification">
                                    {tabs.find((tab) => tab.id === activeTab)?.content}
                                </div>
                            </div>
                        )}

                        {/* DEFAULT */}
                        {template !== 'notification' && template !== 'tab' && (
                            <ul>
                                {items.map((item, index) => (
                                    <li key={index} className={item.className}>
                                        {item.link ? (
                                            <a
                                                href={item.link}
                                                target={item.targetBlank ? '_blank' : '_self'}
                                                rel={
                                                    item.targetBlank
                                                        ? 'noopener noreferrer'
                                                        : undefined
                                                }
                                                className="item"
                                            >
                                                {item.icon && <i className={item.icon}></i>}
                                                {item.title}
                                            </a>
                                        ) : (
                                            <div
                                                className="item"
                                                onClick={() => {
                                                    item.action?.();
                                                    setOpen(false);
                                                }}
                                            >
                                                {item.icon && <i className={item.icon}></i>}
                                                {item.title}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {footer && <div className="popover-footer">{footer}</div>}
                </div>
            )}
        </div>
    );
};

export default Popover;