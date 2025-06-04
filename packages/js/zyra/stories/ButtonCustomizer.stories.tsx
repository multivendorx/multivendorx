import ButtonCustomizer from "../src/components/ButtonCustomiser";

export default {
    title: "Zyra/Components/ButtonCustomizer",
    component: ButtonCustomizer,
};

export const TestButtonCustomizer = () => {
    const demoButtonCustomizerProps = {
        onChange: (key, value, isRestoreDefaults) => {
            console.log("Changed:", key, value, isRestoreDefaults);
        },
        setting: {
            color: "blue",
            size: "large",
        },
        className: "custom-button",
        text: "Customize",
        proSetting: true,
    };

    return <ButtonCustomizer {...demoButtonCustomizerProps} />;
};


