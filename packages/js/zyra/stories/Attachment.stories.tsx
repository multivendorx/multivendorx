import Attachment from "../src/components/Attachment";

export default {
    title: "Zyra/Components/Form/Attachment",
    component: Attachment,
};

export const TestAttachmentInput = () => {
    const demoAttachmentProps = {
        formField: {
            label: "Upload Document",
            placeholder: "Choose a file...",
        },
        onChange: ( field, value ) => {
            console.log( `Field changed: ${ field } = ${ value }` );
        },
    };

    return <Attachment { ...demoAttachmentProps } />;
};
