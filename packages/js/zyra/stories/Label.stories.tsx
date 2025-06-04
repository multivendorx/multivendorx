import Label from "../src/components/Label";

export default {
    title: "Zyra/Components/Label",
    component: Label,
};

export const TestLabel = () => {
    const demoLabelProps = {
        wrapperClass: "label-wrapper",
        descClass: "label-description",
        description: "This is a sample label description.",
        value: "Label Text",
    };

    return <Label { ...demoLabelProps } />;
};
