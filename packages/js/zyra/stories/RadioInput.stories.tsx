import RadioInput from "../src/components/RadioInput";

export default {
    title: "Zyra/Components/RadioInput",
    component: RadioInput,
};

export const TestRadioInput = () => {
    const demoRadioInputProps = {
        wrapperClass: "settings-form-group-radio",
        inputWrapperClass: "radio-input-label-wrap",
        inputClass: "setting-form-input",
        descClass: "settings-metabox-description",
        activeClass: "radio-select-active",
        description: "Choose your preferred theme color.",
        value: "dark",
        name: "themeColor",
        keyName: "themeColorOption",
        options: [
            {
            key: "light",
            value: "light",
            label: "Light Mode",
            name: "themeColor",
            color: "#ffffff"
            },
            {
            key: "dark",
            value: "dark",
            label: "Dark Mode",
            name: "themeColor",
            color: "#000000"
            },
            {
            key: "custom",
            value: "custom",
            label: "Custom Theme",
            name: "themeColor",
            color: ["#ff0000", "#00ff00", "#0000ff"] // multiple colors
            }
        ],
        proSetting: false,
        onChange: (e) => {
            console.log("Radio changed:", e.target.value);
        }
    };


    return <RadioInput { ...demoRadioInputProps } />;
};
