import React, { useState } from 'react';

interface Tab {
    label: string;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultActiveIndex?: number;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultActiveIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

    return (
        <div className="tabs-wrapper">
            <div className="tabs-header">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`tab-title ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => setActiveIndex(index)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>
            <div className="tabs-content">
                {tabs[activeIndex] && tabs[activeIndex].content}
            </div>
        </div>
    );
};

export default Tabs;
