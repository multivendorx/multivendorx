import TemplateSection from "../src/components/TemplateSection";

export default {
    title: "Zyra/Components/TemplateSection",
    component: TemplateSection,
};

export const TestTemplateSection = () => {
    const demoTemplateSectionProps = {
        formField: {
            label: "Email Template",
        },
        onChange: (key, value) => {
            console.log(`Field: ${key}, New Value: ${value}`);
        },
    };
    return <TemplateSection {...demoTemplateSectionProps} />;
};
