import ModulePopup from "../src/components/ModulePopup";

export default {
    title: "Zyra/Components/ModulePopup",
    component: ModulePopup,
};

export const TestModulePopup = () => {
    const demoData = {
        moduleName: "SEO Optimizer",
        settings: "Advanced Settings",
        plugin: "Yoast SEO",
        moduleMessage: "This module helps optimize your site's SEO.",
        moduleButton: "Enable Module",
        pluginDescription: "Yoast SEO is a comprehensive tool for search engine optimization.",
        pluginMessage: "Activate the plugin to unlock all SEO features.",
        pluginButton: "Install Plugin",
        SettingDescription: "Configure title tags, meta descriptions, and more.",
        SettingMessage: "Customize how your site appears in search results.",
        pluginUrl: "https://wordpress.org/plugins/yoast-seo/",
        modulePageUrl: "/modules/seo-optimizer"
    };

    return <ModulePopup { ...demoData } />;
};
