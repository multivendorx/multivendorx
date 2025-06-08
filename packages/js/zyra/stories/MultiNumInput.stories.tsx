import MultiNumInput from "../src/components/MultiNumInput";

export default {
    title: "Zyra/Components/MultiNumInput",
    component: MultiNumInput,
};

export const TestMultiNumInput = () => {
    const demoMultiNumInputProps = {
        parentWrapperClass: "settings-basic-input-class",
        childWrapperClass: "settings-basic-child-wrap",
        inputWrapperClass: "settings-basic-input-child-class",
        innerInputWrapperClass: "setting-form-input",
        inputLabelClass: "setting-form-input-label",
        inputClass: "form-control",
        idPrefix: "setting-integer-input",
        keyName: "maxUsers",
        value: [
            { key: "basic", value: 100 },
            { key: "pro", value: 500 },
        ],
        options: [
            {
                key: "basic",
                value: 100,
                label: "Basic Plan",
                type: "number",
            },
            {
                key: "pro",
                value: 500,
                label: "Pro Plan",
                type: "number",
            },
        ],
        description: "Set the maximum number of users allowed for each plan.",
        descClass: "input-description",
        proSetting: true,
        onChange: ( e, keyName, optionKey, index ) => {
            console.log( "Changed:", {
                keyName,
                optionKey,
                index,
                value: e.target.value,
            } );
        },
    };

    return <MultiNumInput { ...demoMultiNumInputProps } />;
};
