// External Dependencies
import React, { useState, useRef, useEffect, ReactNode } from 'react';

// Internal Dependencies
import Popover from './UI/Popover';
import HeaderSearch from './Header/HeaderSearch';

// Accepts searchIndex-style items directly
type SearchItem = {
    icon?: string;
    name?: string;
    desc?: string;
    link: string;
};
interface ProfileItem {
    title: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
}

interface DropdownOption {
    value: string;
    label: string;
}

interface NotificationItem {
    heading: string;
    message: string;
    time: string;
    icon?: string;
    color?: string;
    link?: string;
}

type OpenPanel =
    | 'search'
    | 'notifications'
    | 'messages'
    | 'profile'
    | 'activities'
    | null;

type AdminHeaderProps = {
    brandImg: string;
    results?: SearchItem[];
    free?: string;
    pro?: string;
    showDropdown?: boolean;
    dropdownOptions?: DropdownOption[];

    // notifications?: NotificationItem[];
    notifications?: ReactNode;
    messages?: NotificationItem[];
    notificationsLink?: string;
    messagesLink?: string;
    showNotifications?: boolean;
    showMessages?: boolean;
    showProfile?: boolean;
    chatUrl?: string;
    managePlanUrl?: string;
    profileItems?: ProfileItem[];
    showActivities?: boolean;
    activities?: ReactNode;
    search?: {
        placeholder?: string;
        options?: { label: string; value: string }[];
    };

    onQueryUpdate: (payload: {
        searchValue: string;
        searchAction?: string;
    }) => void;

    onResultClick: (res: SearchItem) => void;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
    brandImg,
    results = [],
    search,
    onQueryUpdate,
    onResultClick,
    free,
    pro,
    notifications,
    messagesLink,
    messages,
    showMessages,
    showNotifications,
    showProfile,
    chatUrl,
    profileItems,
}) => {
    const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [contactSupportPopup, setContactSupportPopup] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const closeAll = () => setOpenPanel(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                closeAll();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="admin-header" ref={wrapperRef}>
                <div className="left-section">
                    <img className="brand-logo" src={brandImg} alt="Logo" />

                    <div className="version-tag">
                        <span className="admin-badge purple">
                            <i className="adminfont-info"></i> <b>Free:</b>{' '}
                            {free}
                        </span>
                        <span className="admin-badge red">
                            <i className="adminfont-pro-tag"></i> Pro:{' '}
                            {pro ? pro : 'Not Installed'}
                        </span>
                    </div>
                </div>

                <div className="right-section">
                    <HeaderSearch
                        search={search}
                        results={results}
                        onQueryUpdate={onQueryUpdate}
                        onResultClick={onResultClick}
                    />

                    { /* Notifications */}
                    {showNotifications && (notifications)}

                    { /* Messages */}
                    {showMessages && messages && messages.length > 0 && (
                        <div className="icon-wrapper">
                            <i
                                className="admin-icon adminfont-enquiry"
                                title="Messages"
                                onClick={() =>
                                    setOpenPanel(
                                        openPanel === 'messages'
                                            ? null
                                            : 'messages'
                                    )
                                }
                            ></i>
                            <span className="count">{messages.length}</span>

                            {openPanel === 'messages' && (
                                <div className="dropdown notification">
                                    <div className="title">
                                        Messages{' '}
                                        <span className="admin-badge green">
                                            {messages.length} New
                                        </span>
                                    </div>
                                    <div className="notification">
                                        <ul>
                                            {messages.map((msg, idx) => (
                                                <li key={idx}>
                                                    <a href={msg.link || '#'}>
                                                        <div
                                                            className={`icon admin-badge ${msg.color ||
                                                                'green'
                                                                }`}
                                                        >
                                                            <i
                                                                className={
                                                                    msg.icon ||
                                                                    'adminfont-user-network-icon'
                                                                }
                                                            ></i>
                                                        </div>
                                                        <div className="details">
                                                            <span className="heading">
                                                                {msg.heading}
                                                            </span>
                                                            <span className="message">
                                                                {msg.message}
                                                            </span>
                                                            <span className="time">
                                                                {msg.time}
                                                            </span>
                                                        </div>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {messagesLink && (
                                        <div className="footer">
                                            <a
                                                href={messagesLink}
                                                className="admin-btn btn-purple"
                                            >
                                                <i className="adminfont-preview"></i>{' '}
                                                View all messages
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {showProfile && profileItems && (
                        <Popover
                            toggleIcon="admin-icon adminfont-user-circle"
                            width="14rem"
                            template="default"
                            items={profileItems.map((item) => ({
                                title: item.title,
                                icon: item.icon,
                                link: item.link,
                                targetBlank: item.targetBlank,
                                action: item.action,
                            }))}
                        />
                    )}
                </div>
            </div>

            <div
                className={`live-chat-wrapper
          ${contactSupportPopup ? 'open' : ''}
          ${isMinimized ? 'minimized' : ''}`}
            >
                <i
                    className="adminfont-close"
                    onClick={() => {
                        setContactSupportPopup(false);
                    }}
                ></i>
                <i
                    className="adminfont-minus icon"
                    onClick={() => {
                        setIsMinimized(!isMinimized);
                        setContactSupportPopup(true);
                    }}
                ></i>
                <iframe
                    src={chatUrl}
                    title="Support Chat"
                    allow="microphone; camera"
                />
            </div>
            {isMinimized && (
                <div
                    onClick={() => {
                        setContactSupportPopup(true);
                        setIsMinimized(false);
                    }}
                    className="minimized-icon"
                >
                    <i
                        className="admin-icon adminfont-enquiry"
                        title="Messages"
                    ></i>
                </div>
            )}
        </>
    );
};

export default AdminHeader;
