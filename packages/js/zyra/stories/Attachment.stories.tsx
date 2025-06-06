import Attachment from "../src/components/Attachment";
import "./global.scss";

export default {
    title: "Zyra/Components/Attachment",
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
