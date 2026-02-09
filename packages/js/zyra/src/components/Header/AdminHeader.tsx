// External Dependencies
import React, { useRef, ReactNode } from 'react';

// Internal Dependencies
import Popover from '../UI/Popover';
import HeaderSearch from './HeaderSearch';
import SupportChat from './SupportChat';

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
export interface PopoverItem {
    title: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
    desc?: string;
    time?: string;
    className?: string;
}
export interface PopoverTab {
    id: string;
    label: string;
    icon?: string;
    content: React.ReactNode;
        footer?: {
        url: string;
        icon?: string;
        text: string;
    };
}

// Generic Popover configuration
export interface HeaderPopover {
    toggleIcon: string;
    width?: string;
    template: 'default' | 'notification' | 'tab';
    items?: PopoverItem[]; // for default / notification
    tabs?: PopoverTab[];   // for tab
    defaultActiveTab?: string;
}


type AdminHeaderProps = {
    brandImg: string;
    results?: SearchItem[];
    free?: string;
    pro?: string;

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
    popovers?: HeaderPopover[];
};


const AdminHeader: React.FC<AdminHeaderProps> = ({
    brandImg,
    results = [],
    search,
    onQueryUpdate,
    onResultClick,
    free,
    pro,
    chatUrl,
    popovers = [],
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

                    {/* Render all popovers dynamically */}
                    {popovers.map((headerPopover, popoverIndex) => (
                        <Popover
                            key={popoverIndex}
                            toggleIcon={headerPopover.toggleIcon}
                            width={headerPopover.width}
                            template={headerPopover.template}
                            defaultActiveTab={headerPopover.defaultActiveTab}
                            // Pass items only if template is NOT tab
                            items={
                                headerPopover.template !== 'tab' && headerPopover.items
                                    ? headerPopover.items.map((popoverItem) => ({
                                        title: popoverItem.title,
                                        icon: popoverItem.icon,
                                        link: popoverItem.link,
                                        targetBlank: popoverItem.targetBlank,
                                        action: popoverItem.action,
                                        desc: popoverItem.desc,
                                        time: popoverItem.time,
                                        className: popoverItem.className,
                                    }))
                                    : undefined
                            }
                            // Pass tabs only if template IS tab
                            tabs={headerPopover.template === 'tab' ? headerPopover.tabs : undefined}
                        />
                    ))}


                </div>
            </div>

            {chatUrl && <SupportChat chatUrl={chatUrl} />}

        </>
    );
};

export default AdminHeader;
