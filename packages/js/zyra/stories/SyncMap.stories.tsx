import SyncMap from "../src/components/SyncMap";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SyncMap> = {
  title: "Zyra/Components/SyncMap",
    component: SyncMap,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SyncMap>;

export const TestSyncMap:Story = {
    args : {
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
                heading: "WordPress",
                fields: {
                    firstname: "First name",
                    lastname: "Last name",
                    username: "User name",
                    password: "Password",
                },
            },
            moodle: {
                heading: "Moodle",
                fields: {
                    firstname: "First name",
                    lastname: "Last name",
                    username: "User name",
                    password: "Password",
                },
            },
        },
    },
    render:(args)=>{
        return <SyncMap { ...args } />;
    }
};
