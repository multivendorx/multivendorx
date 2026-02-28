// External Dependencies
import React, { useRef, useEffect } from 'react';

// Internal Dependencies
import { PopupUI } from './Popup';
import HeaderSearch from './HeaderSearch';
import { ItemListUI } from './ItemList';
import { TabsUI } from './Tabs';
import { NoticeReceiver } from './NoticeReceiver';

type SearchItem = {
    icon?: string;
    name?: string;
    desc?: string;
    link: string;
};

interface PopoverTab {
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

interface ProfileItem {
    title: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
}

interface PopoverItem {
    title: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
    desc?: string;
    time?: string;
    className?: string;
}

interface HeaderPopover {
    toggleIcon: string;
    items?: PopoverItem[];
}

interface HeaderPopoverWithTab {
    toggleIcon: string;
    tabs?: PopoverTab[];
}

type AdminHeaderProps = {
    brandImg: string;
    results?: SearchItem[];
    free?: string;
    pro?: string;

    showProfile?: boolean;
    profileItems?: ProfileItem[];
    search?: {
        placeholder?: string;
        options?: { label: string; value: string }[];
    };

    onQueryUpdate: (payload: {
        searchValue: string;
        searchAction?: string;
    }) => void;

    onResultClick: (res: SearchItem) => void;
    utilityList?: HeaderPopover[];
    utilityListWithTab?: HeaderPopoverWithTab[],
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
    brandImg,
    results = [],
    search,
    onQueryUpdate,
    onResultClick,
    free,
    pro,
    utilityList = [],
    utilityListWithTab = [],
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [notices, setNotices] = React.useState<string[]>([]);
    useEffect(() => {
        const captureNotices = () => {
            const noticeNodes = document.querySelectorAll(
                '#screen-meta + .wrap .notice, #wpbody-content .notice'
            );

            if (noticeNodes.length > 0) {
                const htmlArray: string[] = [];
                noticeNodes.forEach((node) => {
                    htmlArray.push(node.outerHTML);
                    node.remove(); // remove from DOM so we control rendering
                });
                setNotices(htmlArray);
            }
        };
        captureNotices();
    }, []);

    return (
        <>
            <NoticeReceiver position="banner" />
            <div className="admin-header" ref={wrapperRef}>
                <div className="left-section">
                    <img className="brand-logo" src={brandImg} alt="Logo" />

                    <div className="version-tag">
                        <span className="admin-badge purple">
                            <i className="adminfont-info"></i> <b>Free:</b>
                            {free}
                        </span>
                        <span className="admin-badge red">
                            <i className="adminfont-pro-tag"></i> Pro:
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
                    {/* it will render header icon with tab */}
                    {utilityListWithTab.map((list, index) => (
                        <PopupUI
                            key={index}
                            position="menu-dropdown"
                            toggleIcon={list?.toggleIcon}
                            width={24}
                        >
                            {list?.tabs && <TabsUI tabs={list.tabs} />}
                        </PopupUI>

                    ))}
                    {/* it will render header icon without tab and list of items */}
                    {utilityList.map((list, index) => (
                        <PopupUI
                            key={index}
                            position="menu-dropdown"
                            toggleIcon={list.toggleIcon}
                        >
                            <ItemListUI items={list.items} />
                        </PopupUI>
                    ))}

                </div>
            </div>
            {notices.length > 0 &&
                notices.map((html, i) => (
                    <>
                        <div
                            key={i}
                            className="wp-admin-notice"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                        <NoticeReceiver position="notice" />
                    </>
                ))}
                <NoticeReceiver position="float" />
        </>
    );
};

export default AdminHeader;