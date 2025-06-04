import MergeComponent from "../src/components/MergeComponent";

export default {
    title: "Zyra/Components/MergeComponent",
    component: MergeComponent,
};

export const TestMergeComponent = () => {
    const demoMergeComponentProps = {
        wrapperClass: "merge-wrapper",
        descClass: "merge-description",
        description: "Merge multiple fields into one value.",
        onChange: (data) => {
            console.log("Merge data changed:", data);
        },
        value: {
            field1: "option1",
            field2: 5,
            field3: "Sample Text",
        },
        proSetting: true,
        fields: [
            {
                name: "field1",
                type: "select" as "select",
                options: [
                    { value: "option1", label: "Option 1" },
                    { value: "option2", label: "Option 2" },
                ],
                placeholder: "Select an option",
            },
            {
                name: "field2",
                type: "number" as "number",
                placeholder: "Enter a number",
            },
            {
                name: "field3",
                type: "text" as "text",
                placeholder: "Enter text",
            },
        ],
    };


    return <MergeComponent {...demoMergeComponentProps} />;
};
