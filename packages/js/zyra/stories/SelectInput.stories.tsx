import SelectInput from "../src/components/SelectInput";

export default {
    title: "Zyra/Components/SelectInput",
    component: SelectInput,
};

const commonProps = {
    descClass: "settings-metabox-description",
    onChange: ( value ) => console.log( "Selected:", value ),
};

export const TestSingleSelectInput = () => {
    const props = {
        wrapperClass: "form-select-field-wrapper",
        name: "test_select",
        type: "single-select" as "single-select",
        description: "",
        inputClass: "test_select",
        options: [
            {
                key: "test1",
                label: "Test 1",
                value: "1",
            },
            {
                key: "test2",
                label: "Test 2",
                value: "2",
            },
        ],
        value: "2",
        proSetting: false,
        ...commonProps,
    };

    return <SelectInput { ...props } />;
};

export const TestMultiSelectInput = () => {
    // const handlMultiSelectDeselectChange = (key, options, type='') => {
    //     const newValue = options
    //       .filter((option) => type === 'multi-select')
    //       .map(({ value }) => value);
    //     }
    // };
    const props = {
        wrapperClass: "settings-from-multi-select",
        selectDeselectClass: "btn-purple select-deselect-trigger",
        selectDeselectValue: "Select / Deselect All",
        selectDeselect: true,
        name: "Sample Multi Select",
        type: "multi-select" as "multi-select",
        description:
            "This is a multi-select input example. You can select multiple options.",
        options: [
            {
                key: "option1",
                label: "Cart",
                value: "option1",
            },
            {
                key: "option2",
                label: "Checkout",
                value: "option2",
            },
            {
                key: "option3",
                label: "Shop",
                value: "option3",
            },
        ],
        proSetting: false,
        ...commonProps,
    };

    return <SelectInput { ...props } />;
};
