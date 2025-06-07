import Label from "../src/components/Label";
import "./global.scss";

export default {
    title: "Zyra/Components/Label",
    component: Label,
};

export const TestLabel = () => {
    const demoLabelProps = {
        wrapperClass: "form-group-only-label",
        descClass: "settings-metabox-description",
        description: "This is a sample label description.",
        value: "Label Text",
    };

    return <Label { ...demoLabelProps } />;
};
