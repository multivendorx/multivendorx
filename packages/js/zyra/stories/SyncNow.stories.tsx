import SyncNow from "../src/components/SyncNow";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SyncNow> = {
  title: "Zyra/Components/SyncNow",
    component: SyncNow,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SyncNow>;

export const TestSyncNow : Story = {
    args : {
        buttonKey: "sync_now_button",
        interval: 15,
        proSetting: true,
        proSettingChanged: () => true,
        value: "sync_triggered",
        description:
            "Click the button to manually trigger data synchronization.",
        apilink: "https://api.example.com/sync",
        parameter: "force=true",
        tasks: [
            {
                action: "sync_courses",
                message: "Syncing courses from the server...",
                cache: "course_id" as "course_id",
            },
            {
                action: "sync_users",
                message: "Syncing user data...",
                cache: "user_id" as "user_id",
            },
        ],
        appLocalizer: {
            nonce: "abc123",
            ajax_url: "https://example.com/wp-admin/admin-ajax.php",
        },
    },
    render:(args)=>{
        return <SyncNow { ...args } />;
    }
};
