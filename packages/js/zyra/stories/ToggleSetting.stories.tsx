import ToggleSetting from "../src/components/ToggleSetting";

export default {
    title: "Zyra/Components/ToggleSetting",
    component: ToggleSetting,
};

export const TestToggleSetting = () => {
    const demoToggleSettingProps = {
        description: "Choose your preferred option",
        options: [
            { key: "opt1", value: "yes", label: "Yes" },
            { key: "opt2", value: "no", label: "No" },
        ],
        wrapperClass: "toggle-wrapper",
        descClass: "toggle-description",
        value: "yes",
        onChange: ( value ) => {
            console.log( "Selected value:", value );
        },
        proSetting: false,
    };

    return <ToggleSetting { ...demoToggleSettingProps } />;
};
