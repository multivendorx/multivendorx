import React, { useState } from 'react';
import { FieldComponent } from './types';
import { FIELD_REGISTRY } from './FieldRegistry';

interface TabFooter {
    url: string;
    icon?: string;
    text: string;
}

interface Tab {
    label: string;
    content?: React.ReactNode;
    footer?: TabFooter;
    type?: string;
    value?: any;
    key?: string;
}

interface TabsProps {
    tabs: Tab[];
    defaultActiveIndex?: number;
    value?: any;
    onChange?: (value: any) => void;
    canAccess?: (capability: string) => boolean;
}

const TabsUI: React.FC<TabsProps> = ({ 
    tabs, 
    defaultActiveIndex = 0, 
    value, 
    onChange, 
    canAccess, 
}) => {
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
    
    // Helper function to render tab content
    const renderTabContent = () => {
        const currentTab = tabs[activeIndex];
        
        if (!currentTab) return null;
        
        // If type exists, render the registered field component
        if (currentTab.type) {
            const registeredField = FIELD_REGISTRY[currentTab.type];
            const Render = registeredField?.render;
            
            if (registeredField && Render) {
                // Create a field object that combines tab data with field properties
                const tabAsField = {
                    ...currentTab,
                    type: currentTab.type,
                    key: currentTab.key || `tab-${activeIndex}`,
                };
                
                // Get the value for this specific tab from the parent value
                const tabValue = value?.[currentTab.key || `tab-${activeIndex}`] || currentTab.value || '';
                
                // Handle onChange for this specific tab
                const handleTabChange = (newValue: any) => {
                    if (onChange) {
                        onChange({
                            ...value,
                            [currentTab.key || `tab-${activeIndex}`]: newValue
                        });
                    }
                };
                
                return (
                    <Render
                        field={tabAsField}
                        value={tabValue}
                        onChange={handleTabChange}
                        canAccess={canAccess}
                    />
                );
            }
            
            return null;
        }
        
        // Otherwise render the content directly
        return currentTab.content;
    };
    
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
                            <span className="tab-name">{tab.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="tabs-content">
                {renderTabContent()}
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

const Tabs: FieldComponent = {
    render: ({ field, value, onChange, canAccess }) => (
        <TabsUI
            tabs={field.tabs || []}
            value={value}
            onChange={onChange}
            canAccess={canAccess}
        />
    ),

    validate: (field, value) => {
        return null;
    },
};

export default Tabs;