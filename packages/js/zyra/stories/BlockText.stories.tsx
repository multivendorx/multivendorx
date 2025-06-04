import BlockText from "../src/components/BlockText";

export default {
    title: "Zyra/Components/BlockText",
    component: BlockText,
};

export const TestBlockText = () => {
    const demoBlockTextProps = {
        wrapperClass: "block-wrapper",
        blockTextClass: "block-text",
        value: "This is a demo block of text.",
    };

    return <BlockText {...demoBlockTextProps} />;
};

