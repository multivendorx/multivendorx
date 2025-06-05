import Modules from "../src/components/Modules";

export default {
    title: "Zyra/Components/Modules",
    component: Modules,
};

export const TestModules = () => {
    const modulesArray = [
        {
            id: "analytics",
            name: "Analytics Tracker",
            desc: "Track user behavior and site metrics.",
            icon: "https://example.com/icons/analytics.svg",
            doc_link: "https://docs.example.com/modules/analytics",
            settings_link: "/settings/analytics",
            pro_module: false,
        },
        {
            id: "cache",
            name: "Cache Booster",
            desc: "Speed up your website with smart caching.",
            icon: "https://example.com/icons/cache.svg",
            doc_link: "https://docs.example.com/modules/cache",
            settings_link: "/settings/cache",
            pro_module: true,
        },
        {
            id: "seo",
            name: "SEO Optimizer",
            desc: "Improve your search engine visibility.",
            icon: "https://example.com/icons/seo.svg",
            doc_link: "https://docs.example.com/modules/seo",
            settings_link: "/settings/seo"
        }
    ];

    const demoModuleProps = {
        insertModule: (moduleId: string) => console.log(`Insert module: ${moduleId}`),
        removeModule: (moduleId: string) => console.log(`Remove module: ${moduleId}`),
        modulesArray: modulesArray,
        appLocalizer: {
            siteUrl: "https://mywordpresssite.com",
            user: {
            id: 1,
            name: "Admin"
            },
            isProUser: true
        }
    };


    return <Modules { ...demoModuleProps } />;
};
