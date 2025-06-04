import SubTabSection from "../src/components/SubTabSection";

export default {
    title: "Zyra/Components/SubTabSection",
    component: SubTabSection,
};

export const TestSubTabSection = () => {
    const demoSubTabSectionProps = {
        menuitem: [
            {
                id: "general",
                name: "General",
                icon: "icon-general",
                link: "/general",
            },
            {
                id: "advanced",
                name: "Advanced",
                icon: "icon-advanced",
                link: "/advanced",
            },
        ],
        currentTab: {
            id: "general",
            name: "General",
            icon: "icon-general",
            link: "/general",
        },
        setCurrentTab: ( tab ) => {
            console.log( "Current tab set to:", tab );
        },
        setting: {
            general: { optionA: true },
            advanced: { optionB: false },
        },
    };

    return <SubTabSection { ...demoSubTabSectionProps } />;
};
