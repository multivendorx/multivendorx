import SelectInput from "../src/components/SelectInput";

export default {
    title: "Zyra/Components/SelectInput",
    component: SelectInput,
};

export const TestSelectInput = () => {
    const props = {
        wrapperClass: "form-select-field-wrapper",
        descClass: "settings-metabox-description",
        name: "test_select",
        description: "",
        inputClass: "test_select",
        options: [
            {
                label: "test1",
                value: "1",
            },
            {
                label: "test2",
                value: "2",
            },
        ],
        value: "2",
        proSetting: false,
        onChange: ( value ) => console.log( "Selected:", value ),
    };

    return <SelectInput { ...props } />;
};
