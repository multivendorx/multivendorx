import BlockText from "../src/components/BlockText";
export default {
    title: "Zyra/Components/BlockText",
    component: BlockText,
};

export const TestBlockText = () => {
    const demoBlockTextProps = {
        wrapperClass: "blocktext-class",
        blockTextClass: "settings-metabox-description-code",
        value: "This is a demo block of text.",
    };

    return <BlockText { ...demoBlockTextProps } />;
};
