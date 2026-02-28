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
    headerExtra?: React.ReactNode;
}

export const TabsUI: React.FC<TabsProps> = ({
    tabs,
    defaultActiveIndex = 0,
    value,
    onChange,
    canAccess,
    headerExtra,
}) => {
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

    // Helper function to render a field from configuration
    const renderFieldFromConfig = (fieldConfig: any, index: number) => {
        const registeredField = FIELD_REGISTRY[fieldConfig.type];
        const Render = registeredField?.render;

        if (!registeredField || !Render) {
            return null;
        }

        // Get the value for this specific field
        const fieldValue = value?.[fieldConfig.key] || '';

        // Handle onChange for this specific field
        const handleFieldChange = (newValue: any) => {
            if (onChange) {
                onChange({
                    ...value,
                    [fieldConfig.key]: newValue
                });
            }
        };

        return (
            // <div key={fieldConfig.key || index} className="tab-field-wrapper">
            //     {fieldConfig.label && <label className="tab-field-label">{fieldConfig.label}</label>}
            <Render
                field={fieldConfig}
                value={fieldValue}
                onChange={handleFieldChange}
                canAccess={canAccess}
            />
            // </div>
        );
    };

    // Helper function to process content recursively
    const processContent = (content: any): React.ReactNode => {
        // If content is an array, map through it
        if (Array.isArray(content)) {
            return content.map((item, index) => {
                // Only treat plain objects with a string `type` as field configs.
                // React elements also have `.type` but React.isValidElement catches those.
                if (item && typeof item === 'object' && !React.isValidElement(item) && typeof item.type === 'string') {
                    return renderFieldFromConfig(item, index);
                }
                // React element, primitive, etc. — render as-is
                return item;
            });
        }

        // If content is a plain field config object (not a React element)
        if (content && typeof content === 'object' && !React.isValidElement(content) && typeof content.type === 'string') {
            return renderFieldFromConfig(content, 0);
        }

        // Return as is (string, number, React element, etc.)
        return content;
    };

    // Helper function to render tab content
    const renderTabContent = () => {
        const currentTab = tabs[activeIndex];

        if (!currentTab) return null;

        // If type exists (legacy support), render the registered field component
        if (currentTab.type) {
            const registeredField = FIELD_REGISTRY[currentTab.type];
            const Render = registeredField?.render;

            if (registeredField && Render) {
                const tabAsField = {
                    ...currentTab,
                    type: currentTab.type,
                    key: currentTab.key || `tab-${activeIndex}`,
                };

                const tabValue = value?.[currentTab.key || `tab-${activeIndex}`] || currentTab.value || '';

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

        // Process the content (can be array of fields, single field, or any React node)
        return processContent(currentTab.content);
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
                {headerExtra && (
                    <div className="tabs-header-extra">
                        {headerExtra}
                    </div>
                )}
            </div>

            {renderTabContent()}

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