import ShortCodeTable from "../src/components/ShortCodeTable";

export default {
    title: "Zyra/Components/ShortCodeTable",
    component: ShortCodeTable,
};

export const TestShortCodeTable = () => {
    const demoShortCodeTableProps = {
        wrapperClass: "shortcode-table-wrapper",
        descClass: "shortcode-description",
        description: "Here are the available shortcode options:",
        options: [
            { label: "Shortcode 1", desc: "[shortcode_1]" },
            { label: "Shortcode 2", desc: "[shortcode_2]" },
        ],
        optionLabel: ["Shortcode 1", "Shortcode 2"],
    };

    return <ShortCodeTable {...demoShortCodeTableProps} />;
};