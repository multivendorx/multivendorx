import AdminForm from "../src/components/AdminForm";

export default {
    title: "Zyra/Components/AdminForm",
    component: AdminForm,
};

export const TestAdminForm = () => {
    const adminFormProps = {
        settings: {
            modal: [
                {
                    key: "user_email",
                    id: "user_email",
                    class: "input-email",
                    name: "email",
                    type: "email" as "email", // must match one of the allowed InputField types
                    desc: "Enter your email address",
                    inputLabel: "Email",
                    placeholder: "example@example.com",
                    proSetting: false,
                    rows: [
                        {
                            key: "emailRow",
                            label: "Email Options",
                            options: [
                                { value: "opt1", label: "Option 1" },
                                { value: "opt2", label: "Option 2" },
                            ],
                        },
                    ],
                    columns: [ { key: "emailCol", label: "Email Column" } ],
                    fields: [
                        {
                            name: "emailField",
                            type: "text" as "text", // must match one of the allowed InputField types
                            placeholder: "Type something...",
                        },
                    ],
                    tasks: [
                        {
                            action: "notify",
                            message: "Send notification",
                            cache: "user_id" as "user_id",
                        },
                    ],
                    syncDirections: [
                        {
                            value: "sync-now",
                            img1: "path/to/img1.png",
                            img2: "path/to/img2.png",
                            label: "Sync Data",
                        },
                    ],
                    center: {
                        lat: 40.7128,
                        lng: -74.006,
                    },
                },
            ],
            submitUrl: "/api/save-settings",
            id: "settings_form_001",
        },
        vendorId: "vendor_123",
        announcementId: "announcement_456",
        knowladgebaseId: "kb_789",
        proSetting: {
            modal: [
                {
                    key: "pro_api_key",
                    id: "pro_api_key",
                    class: "input-api",
                    name: "apiKey",
                    type: "text" as "text",
                    inputLabel: "API Key",
                    desc: "Enter your API key for Pro features",
                    placeholder: "Enter API Key",
                    proSetting: true,
                    rows: [],
                    columns: [],
                    fields: [
                        {
                            name: "apiKeyField",
                            type: "text" as "text",
                            placeholder: "API Key",
                        },
                    ],
                    tasks: [],
                    syncDirections: [],
                    center: {
                        lat: 51.5074,
                        lng: -0.1278,
                    },
                },
            ],
            submitUrl: "/api/save-pro-settings",
            id: "pro_settings_form_001",
        },
        setting: {
            theme: "light",
            notifications: true,
        },
        updateSetting: ( key: string, value: any ) => {
            console.log( "Updating setting:", key, value );
        },
        modules: {
            inventory: true,
            reports: false,
        },
        appLocalizer: {
            locale: "en_US",
            strings: {
                save: "Save Settings",
                cancel: "Cancel",
            },
        },
        ProPopup: () => <div>This is a ProPopup Component</div>,
        modulePopupFields: {
            // Optional: only if you have ModulePopupProps defined
        },
    };
    return <AdminForm { ...adminFormProps } />;
};
