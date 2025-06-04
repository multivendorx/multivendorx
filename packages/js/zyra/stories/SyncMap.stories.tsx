import SyncMap from "../src/components/SyncMap";

export default {
    title: "Zyra/Components/SyncMap",
    component: SyncMap,
};

export const TestSyncMap = () => {
    const demoSyncMapProps: React.ComponentProps< typeof SyncMap > = {
        description: "Map fields between systems to keep data in sync.",
        proSetting: true,
        proSettingChanged: () => true,
        value: [
            [ "email", "user_email" ],
            [ "name", "full_name" ],
        ] as [ string, string ][],
        onChange: ( newValue ) => {
            console.log( "Sync map changed:", newValue );
        },
        syncFieldsMap: {
            wordpress: {
                heading: 'WordPress',
                fields: {
                firstname: 'First name',
                lastname: 'Last name',
                username: 'User name',
                password: 'Password'
                }
            },
            moodle: {
                heading: 'Moodle',
                fields: {
                firstname: 'First name',
                lastname: 'Last name',
                username: 'User name',
                password: 'Password'
                }
            }
        },
    };

    return <SyncMap { ...demoSyncMapProps } />;
};
