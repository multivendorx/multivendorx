import TemplateTextArea from "../src/components/TemplateTextArea";

export default {
    title: "Zyra/Components/Form/TemplateTextArea",
    component: TemplateTextArea,
};

export const TestTemplateTextArea = () => {
    const demoTextareaProps = {
        formField: {
            label: "Description",
            placeholder: "Enter your description here...",
        },
        onChange: ( field, value ) => {
            console.log( `Field: ${ field }, Value: ${ value }` );
        },
    };

    return <TemplateTextArea { ...demoTextareaProps } />;
};
