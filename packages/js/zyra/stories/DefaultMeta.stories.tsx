import DefaultMeta from "../src/components/DefaultMeta";

export default {
    title: "Zyra/Components/DefaultMeta",
    component: DefaultMeta,
};

export const TestDefaultMeta = () => {
    const demoDefaultMetaProps = {
        defaultvalue: "Default Text",
        name: "meta_name",
        deactive: false,
        onChange: ( field, value ) => {
            console.log( `Field changed: ${ field } = ${ value }` );
        },
        hideDefaultValue: false,
        hideName: false,
        hideDeactive: false,
    };

    return <DefaultMeta { ...demoDefaultMetaProps } />;
};
