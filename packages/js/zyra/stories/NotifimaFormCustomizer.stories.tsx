import FormCustomizer from "../src/components/NotifimaFormCustomizer";

export default {
    title: "Zyra/Components/Notifima/FormCustomizer",
    component: FormCustomizer,
};

export const TestFormCustomizer = () => {
    const demoFormCustomizerProps = {
        value: "default value",
        buttonText: "Submit",
        setting: {
            field1: "value1",
            field2: true,
        },
        proSetting: {
            enabled: true,
            tier: "pro",
        },
        onChange: ( key, value, isRestoreDefaults ) => {
            console.log(
                `Changed ${ key } to`,
                value,
                "Restore defaults:",
                isRestoreDefaults
            );
        },
    };

    return <FormCustomizer { ...demoFormCustomizerProps } />;
};
