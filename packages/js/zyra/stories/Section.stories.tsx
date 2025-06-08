import Section from "../src/components/Section";

export default {
    title: "Zyra/Components/Section",
    component: Section,
};

export const TestSection = () => {
    const demoSectionProps = {
        wrapperClass: "setting-section-divider",
        hint: "Fill in all required fields carefully.",
        value: "User Registration",
    };

    return <Section { ...demoSectionProps } />;
};
