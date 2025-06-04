import SyncNow from "../src/components/SyncNow";

export default {
    title: "Zyra/Components/SyncNow",
    component: SyncNow,
};

export const TestSyncNow = () => {
    const demoSyncNowProps = {
        buttonKey: "sync_now_button",
        interval: 15,
        proSetting: true,
        proSettingChanged: () => true,
        value: "sync_triggered",
        description: "Click the button to manually trigger data synchronization.",
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
    };



    return <SyncNow {...demoSyncNowProps} />;
};