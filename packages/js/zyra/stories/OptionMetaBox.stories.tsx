import OptionMetaBox from "../src/components/OptionMetaBox";

export default {
    title: "Zyra/Components/Form/OptionMetaBox",
    component: OptionMetaBox,
};

export const TestOptionMetaBox = () => {
    const option = {
        label: "Enable Notifications",
        value: "true",
        isdefault: true
    };
    const demoOptionMetaBoxProps = {
        option: option,
        onChange: (key, value) => {
            console.log(`Changed ${key} to ${value}`);
        },
        setDefaultValue: () => {
            console.log("Default value has been set.");
        },
        hasOpen: true
    };


    return <OptionMetaBox { ...demoOptionMetaBoxProps } />;
};
