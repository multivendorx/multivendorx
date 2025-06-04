import SettingMetaBox from "../src/components/SettingMetaBox";

export default {
    title: "Zyra/Components/SettingMetaBox",
    component: SettingMetaBox,
};

export const TestSettingMetaBox = () => {
    const demoSettingMetaBoxProps = {
        formField: {
            type: "text",
            name: "username",
            placeholder: "Enter your username",
            charlimit: 100,
            row: 1,
            column: 2,
            sitekey: "site-key-example",
            filesize: 2,
            required: true,
            disabled: false,
        },
        inputTypeList: [
            { value: "text", label: "Text" },
            { value: "number", label: "Number" },
            { value: "email", label: "Email" },
        ],
        onChange: (field, value) => {
            console.log(`Changed ${field} to`, value);
        },
        onTypeChange: (value) => {
            console.log("Type changed to:", value);
        },
        opened: { click: true },
    };


    return <SettingMetaBox {...demoSettingMetaBoxProps} />;
};