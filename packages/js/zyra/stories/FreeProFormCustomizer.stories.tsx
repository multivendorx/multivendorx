import FreeProFormCustomizer from "../src/components/FreeProFormCustomizer";

export default {
    title: "Zyra/Components/FreeProFormCustomizer",
    component: FreeProFormCustomizer,
};

export const TestFreeProFormCustomizer = () => {
    const demoFreeProFormCustomizerProps = {
        setting: {
            freefromsetting: [
                {
                    key: "emailNotifications",
                    label: "Enable Email Notifications",
                    active: true,
                    desc: "Receive updates via email",
                },
                {
                    key: "smsAlerts",
                    label: "Enable SMS Alerts",
                    active: false,
                    desc: "Get alerts via SMS",
                },
            ],
        },
        proSetting: {
            isPro: true,
            features: [ "advancedReports", "prioritySupport" ],
        },
        proSettingChange: () => {
            console.log( "Toggled Pro setting" );
            return true;
        },
        moduleEnabledChange: () => {
            console.log( "Toggled Module" );
            return false;
        },
        onChange: ( key, value ) => {
            console.log( `Changed ${ key } to`, value );
        },
    };

    return <FreeProFormCustomizer { ...demoFreeProFormCustomizerProps } />;
};
