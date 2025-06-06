import MultipleOptions from "../src/components/MultipleOption";

export default {
    title: "Zyra/Components/Form/MultipleOptions",
    component: MultipleOptions,
};

export const TestLog = () => {
    const options = [
        { id: "opt1", label: "Option A", value: "A", isdefault: true },
        { id: "opt2", label: "Option B", value: "B" },
        { id: "opt3", label: "Option C", value: "C" }
    ];

    const formField = {
        id: 101,
        type: "dropdown",
        label: "Select an Option",
        required: true,
        name: "selection",
        placeholder: "Choose one",
        options: options
    };

    const demoMultipleOptionsProps = {
        formField: formField,
        onChange: (key, value) => {
            console.log(`Field ${key} changed to`, value);
        },
        type: "dropdown" as "dropdown",
        selected: true
    };


    return <MultipleOptions { ...demoMultipleOptionsProps } />;
};
