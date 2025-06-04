import SyncMap from "../src/components/SyncMap";

export default {
    title: "Zyra/Components/SyncMap",
    component: SyncMap,
};

export const TestSyncMap = () => {
    const demoSyncMapProps: React.ComponentProps<typeof SyncMap> = {
        value: [
            ["email", "user_email"],
            ["name", "full_name"],
        ] as [string, string][],
        onChange: (newValue) => {
            console.log("Sync map changed:", newValue);
        },
        proSetting: true,
        proSettingChanged: () => true,
        description: "Map fields between systems to keep data in sync.",
        syncFieldsMap: {
            sourceSystem: {
            heading: "Source Fields",
            fields: {
                email: "Email Address",
                name: "Full Name",
                phone: "Phone Number",
            },
            },
            targetSystem: {
            heading: "Target Fields",
            fields: {
                user_email: "User Email",
                full_name: "User Full Name",
                contact_number: "Contact Number",
            },
            },
        },
    };


    return <SyncMap {...demoSyncMapProps} />;
};


