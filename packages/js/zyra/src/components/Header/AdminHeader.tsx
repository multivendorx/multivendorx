// External Dependencies
import React, { useRef } from 'react';

// Internal Dependencies
import Popover from '../UI/Popover';
import HeaderSearch from './HeaderSearch';
import SupportChat from './SupportChat';
import { AdminHeaderProps } from '../types';
import ItemList from '../UI/ItemList';
import Tabs from '../UI/Tabs';


const AdminHeader: React.FC<AdminHeaderProps> = ({
    brandImg,
    results = [],
    search,
    onQueryUpdate,
    onResultClick,
    free,
    pro,
    chatUrl,
    utilityList = [],
    utilityListWithTab = [],
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

                    {utilityListWithTab.map((headerPopover, index) => (
                        <Popover
                            key={index}
                            toggleIcon={headerPopover.toggleIcon}
                            toggleContent={
                                /* Pass the nested tabs array directly to your Tabs component */
                                <Tabs
                                    tabs={headerPopover?.tabs?.map(tab => ({
                                        label: tab.label,
                                        content: (
                                            <div>
                                                {tab.content}
                                            </div>
                                        )
                                    }))}
                                />
                            }
                        />
                    ))}
                    {utilityList.map((headerPopover, popoverIndex) => (
                        <Popover
                            key={popoverIndex}
                            toggleIcon={headerPopover.toggleIcon}
                            toggleContent={
                                headerPopover.items && (
                                    <ItemList
                                        items={headerPopover.items.map((item) => ({
                                            title: item.title,
                                            icon: item.icon,
                                            link: item.link,
                                            targetBlank: item.targetBlank,
                                            action: item.action,
                                            desc: item.desc,
                                            time: item.time,
                                            className: item.className,
                                        }))}
                                    />
                                )
                            }
                        />
                    ))}

                </div>
            </div>

            {chatUrl && <SupportChat chatUrl={chatUrl} />}

        </>
    );
};

export default AdminHeader;
