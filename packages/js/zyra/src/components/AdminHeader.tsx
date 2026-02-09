// External Dependencies
import React, { useRef, ReactNode } from 'react';

// Internal Dependencies
import Popover from './UI/Popover';
import HeaderSearch from './Header/HeaderSearch';
import SupportChat from './Header/SupportChat';

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


type AdminHeaderProps = {
    brandImg: string;
    results?: SearchItem[];
    free?: string;
    pro?: string;

    notifications?: ReactNode;
    showNotifications?: boolean;

    showProfile?: boolean;
    profileItems?: ProfileItem[];

    chatUrl?: string;

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
    showNotifications,
    showProfile,
    chatUrl,
    profileItems,
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
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

            {chatUrl && <SupportChat chatUrl={chatUrl} />}

        </>
    );
};

export default AdminHeader;
