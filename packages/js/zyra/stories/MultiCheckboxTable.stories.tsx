import MultiCheckboxTable from "../src/components/MultiCheckboxTable";

export default {
    title: "Zyra/Components/MultiCheckboxTable",
    component: MultiCheckboxTable,
};

export const TestMultiCheckboxTable = () => {
    const rows = [
        {
            key: "trackUsers",
            label: "Track Logged-in Users",
            options: [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
            ],
        },
        {
            key: "enableEvents",
            label: "Enable Event Tracking",
            options: [
                { value: 1, label: "Enabled" },
                { value: 0, label: "Disabled" },
            ],
        },
        {
            key: "anonymizeIp",
            label: "Anonymize IP Address",
        },
    ];

    const columns = [
        {
            key: "default",
            label: "Default Settings",
        },
        {
            key: "pro",
            label: "Pro Settings",
            moduleEnabled: "analytics",
        },
    ];

    const demoTableProps = {
        rows: rows,
        columns: columns,
        description: "Configure analytics and tracking settings below.",
        onChange: ( key: string, value: any ) => {
            console.log( `Setting changed: ${ key } = ${ value }` );
        },
        setting: {
            trackUsers: "yes",
            enableEvents: 1,
            anonymizeIp: true,
        },
        proSetting: true,
        modules: [ "analytics", "events" ],
        moduleChange: ( module: string ) => {
            console.log( `Module toggled: ${ module }` );
        },
    };
    return <MultiCheckboxTable { ...demoTableProps } />;
};
