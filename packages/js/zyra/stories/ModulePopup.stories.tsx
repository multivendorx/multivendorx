import ModulePopup from "../src/components/ModulePopup";

export default {
    title: "Zyra/Components/ModulePopup",
    component: ModulePopup,
};

export const TestModulePopup = () => {
    const demoData = {
        moduleName: "SEO Optimizer",
        moduleMessage: "This module helps optimize your site's SEO.",
        moduleButton: "Enable Module",
        modulePageUrl: "/modules/seo-optimizer",
    };

    return <ModulePopup { ...demoData } />;
};

export const TestSettingPopup = () => {
    const demoData = {
        settings: "Advanced Settings",
        SettingDescription:
            "Configure title tags, meta descriptions, and more.",
        SettingMessage: "Customize how your site appears in search results.",
    };

    return <ModulePopup { ...demoData } />;
};
export const TestPluginPopup = () => {
    const demoData = {
        plugin: "Yoast SEO",
        pluginDescription:
            "Yoast SEO is a comprehensive tool for search engine optimization.",
        pluginMessage: "Activate the plugin to unlock all SEO features.",
        pluginButton: "Install Plugin",
        pluginUrl: "https://wordpress.org/plugins/yoast-seo/",
    };

    return <ModulePopup { ...demoData } />;
};
