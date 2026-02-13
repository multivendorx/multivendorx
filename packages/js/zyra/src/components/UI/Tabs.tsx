import React, { useState } from 'react';
interface TabFooter {
    url: string;
    icon?: string;
    text: string;
}

interface Tab {
    label: string;
    content: React.ReactNode;
    footer?: TabFooter;
}

interface TabsProps {
    tabs: Tab[];
    defaultActiveIndex?: number;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultActiveIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
    return (
        <>
            <div className="tabs-wrapper">
                <div className="tabs-item">
                    {tabs.map((tab, index) => (
                        <div
                            key={index}
                            className={`tab ${index === activeIndex ? 'active-tab' : ''}`}
                            onClick={() => setActiveIndex(index)}
                        >
                           <span className="tab-name"> {tab.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="tabs-content">
                {tabs[activeIndex] && tabs[activeIndex].content}
            </div>

            {/* Footer */}
            {tabs[activeIndex]?.footer && (
                <div className="footer">
                    <a
                        href={tabs[activeIndex].footer.url}
                        className="admin-btn btn-purple"
                    >
                        {tabs[activeIndex].footer.icon && (
                            <i className={tabs[activeIndex].footer.icon}></i>
                        )}
                        {tabs[activeIndex].footer.text}
                    </a>
                </div>
            )}
        </>
    );
};

export default Tabs;
