import React, { useState, useRef, useEffect, ReactNode } from 'react';
import Popover from './UI/Popover';

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

type AdminHeaderProps = {
    brandImg: string;
    query: string;
    results?: SearchItem[];
    onSearchChange: ( value: string ) => void;
    onResultClick: ( res: SearchItem ) => void;
    onSelectChange: ( value: string ) => void;
    selectValue: string;
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
};

const AdminHeader: React.FC< AdminHeaderProps > = ( {
    brandImg,
    query,
    results = [],
    onSearchChange,
    onResultClick,
    onSelectChange,
    selectValue,
    free,
    pro,
    showDropdown,
    dropdownOptions,
    notifications,
    messagesLink,
    messages,
    showMessages,
    showNotifications,
    showProfile,
    chatUrl,
    profileItems,
    showActivities,
    activities,
} ) => {
    const [ dropdownOpen, setDropdownOpen ] = useState( false );
    const [ notifOpen, setNotifOpen ] = useState( false );
    const [ activityOpen, setActivityOpen ] = useState( false );
    const [ profileOpen, setProfileOpen ] = useState( false );
    const [ messageOpen, setMessageOpen ] = useState( false );
    const wrapperRef = useRef< HTMLDivElement >( null );
    const [ contactSupportPopup, setContactSupportPopup ] = useState( false );
    const [ isMinimized, setIsMinimized ] = useState( false );

    // Close dropdown on click outside
    useEffect( () => {
        const handleClickOutside = ( event: MouseEvent ) => {
            if (
                wrapperRef.current &&
                ! wrapperRef.current.contains( event.target as Node )
            ) {
                setDropdownOpen( false );
                setNotifOpen( false );
                setActivityOpen( false );
                setMessageOpen( false );
                setProfileOpen( false );
            }
        };

        document.addEventListener( 'mousedown', handleClickOutside );
        return () => {
            document.removeEventListener( 'mousedown', handleClickOutside );
        };
    }, [] );

    // Open dropdown automatically when there are results
    useEffect( () => {
        setDropdownOpen( results.length > 0 );
    }, [ results ] );

    return (
        <>
            <div className="admin-header" ref={ wrapperRef }>
                <div className="left-section">
                    <img className="brand-logo" src={ brandImg } alt="Logo" />

                    <div className="version-tag">
                        <span className="admin-badge purple">
                            <i className="adminfont-info"></i> <b>Free:</b>{ ' ' }
                            { free }
                        </span>
                        <span className="admin-badge red">
                            <i className="adminfont-pro-tag"></i> Pro:{ ' ' }
                            { pro ? pro : 'Not Installed' }
                        </span>
                    </div>
                </div>

                <div className="right-section">
                    <div className="search-field header-search">
                        <div className="search-action">
                            { showDropdown &&
                                dropdownOptions &&
                                dropdownOptions.length > 0 && (
                                    <select
                                        value={ selectValue }
                                        onChange={ ( e ) =>
                                            onSelectChange( e.target.value )
                                        }
                                    >
                                        { dropdownOptions.map( ( opt ) => (
                                            <option
                                                key={ opt.value }
                                                value={ opt.value }
                                            >
                                                { opt.label }
                                            </option>
                                        ) ) }
                                    </select>
                                ) }
                        </div>

                        <div className="search-section">
                            <input
                                type="text"
                                placeholder="Search Settings"
                                value={ query }
                                onChange={ ( e ) =>
                                    onSearchChange( e.target.value )
                                }
                            />
                            <i className="adminfont-search"></i>
                        </div>

                        { /* dropdown render */ }
                        { dropdownOpen && results.length > 0 && (
                            <ul className="search-dropdown">
                                { results.map( ( r, i ) => {
                                    const name = r.name || '(No name)';
                                    const desc = r.desc || '';

                                    return (
                                        <li
                                            key={ i }
                                            onClick={ () => {
                                                onResultClick( r );
                                                setDropdownOpen( false ); // close dropdown on click
                                            } }
                                        >
                                            <div className="icon-wrapper">
                                                { r.icon && (
                                                    <i className={ r.icon }></i>
                                                ) }
                                            </div>

                                            <div className="details">
                                                <div className="title">
                                                    { name.length > 60
                                                        ? name.substring(
                                                              0,
                                                              60
                                                          ) + '...'
                                                        : name }
                                                </div>
                                                { desc && (
                                                    <div className="desc">
                                                        { desc.length > 80
                                                            ? desc.substring(
                                                                  0,
                                                                  80
                                                              ) + '...'
                                                            : desc }
                                                    </div>
                                                ) }
                                            </div>
                                        </li>
                                    );
                                } ) }
                            </ul>
                        ) }
                    </div>

                    { /* Notifications */ }
                    {
                        showNotifications &&
                            // <div className="icon-wrapper">
                            //     <i
                            //         className="admin-icon adminfont-notification"
                            //         title="Notifications"
                            //         onClick={() => {
                            //             setNotifOpen(!notifOpen);
                            //             setProfileOpen(false);
                            //             setMessageOpen(false);
                            //             setActivityOpen(false);
                            //         }}
                            //     ></i>
                            notifications
                        // </div>
                    }

                    { /* Activities */ }
                    { /* {showActivities && (
                        <div className="icon-wrapper">
                            <i
                                className="admin-icon adminfont-notification"
                                title="Activities"
                                onClick={() => {
                                    setActivityOpen(!activityOpen);
                                    setNotifOpen(false);
                                    setProfileOpen(false);
                                    setMessageOpen(false);
                                }}
                            ></i>
                            {activityOpen && activities}
                        </div>
                    )} */ }

                    { /* Messages */ }
                    { showMessages && messages && messages.length > 0 && (
                        <div className="icon-wrapper">
                            <i
                                className="admin-icon adminfont-enquiry"
                                title="Messages"
                                onClick={ () => {
                                    setMessageOpen( ! messageOpen );
                                    setProfileOpen( false );
                                    setNotifOpen( false );
                                    setActivityOpen( false );
                                } }
                            ></i>
                            <span className="count">{ messages.length }</span>

                            { messageOpen && (
                                <div className="dropdown notification">
                                    <div className="title">
                                        Messages{ ' ' }
                                        <span className="admin-badge green">
                                            { messages.length } New
                                        </span>
                                    </div>
                                    <div className="notification">
                                        <ul>
                                            { messages.map( ( msg, idx ) => (
                                                <li key={ idx }>
                                                    <a href={ msg.link || '#' }>
                                                        <div
                                                            className={ `icon admin-badge ${
                                                                msg.color ||
                                                                'green'
                                                            }` }
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
                                                                { msg.heading }
                                                            </span>
                                                            <span className="message">
                                                                { msg.message }
                                                            </span>
                                                            <span className="time">
                                                                { msg.time }
                                                            </span>
                                                        </div>
                                                    </a>
                                                </li>
                                            ) ) }
                                        </ul>
                                    </div>
                                    { messagesLink && (
                                        <div className="footer">
                                            <a
                                                href={ messagesLink }
                                                className="admin-btn btn-purple"
                                            >
                                                <i className="adminfont-preview"></i>{ ' ' }
                                                View all messages
                                            </a>
                                        </div>
                                    ) }
                                </div>
                            ) }
                        </div>
                    ) }

                    { showProfile && profileItems && (
                        <>
                            <Popover
                                toggleIcon="admin-icon adminfont-user-circle"
                                width="14rem"
                                template="default"
                                items={ profileItems.map( ( item ) => ( {
                                    title: item.title,
                                    icon: item.icon,
                                    link: item.link,
                                    targetBlank: item.targetBlank,
                                    action: item.action,
                                } ) ) }
                            />
                        </>
                    ) }
                </div>
            </div>

            <div
                className={ `live-chat-wrapper
          ${ contactSupportPopup ? 'open' : '' }
          ${ isMinimized ? 'minimized' : '' }` }
            >
                <i
                    className="adminfont-close"
                    onClick={ () => {
                        setContactSupportPopup( false );
                    } }
                ></i>
                <i
                    className="adminfont-minus icon"
                    onClick={ () => {
                        setIsMinimized( ! isMinimized );
                        setContactSupportPopup( true );
                    } }
                ></i>
                <iframe
                    src={ chatUrl }
                    title="Support Chat"
                    allow="microphone; camera"
                />
            </div>
            { isMinimized && (
                <div
                    onClick={ () => {
                        setContactSupportPopup( true );
                        setIsMinimized( false );
                    } }
                    className="minimized-icon"
                >
                    <i
                        className="admin-icon adminfont-enquiry"
                        title="Messages"
                    ></i>
                </div>
            ) }
        </>
    );
};

export default AdminHeader;
