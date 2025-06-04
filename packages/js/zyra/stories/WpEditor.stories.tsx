import WpEditor from "../src/components/WpEditor";

export default {
    title: "Zyra/Components/WpEditor",
    component: WpEditor,
};

export const TestWpEditor = () => {
    const demoWpEditorProps = {
        apiKey: "your-api-key",
        value: "<p>Initial content</p>",
        onEditorChange: (content) => {
            console.log("Editor content changed:", content);
        },
    };

    return <WpEditor {...demoWpEditorProps} />;
};
