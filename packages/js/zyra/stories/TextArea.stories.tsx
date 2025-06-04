import TextArea from "../src/components/TextArea";

export default {
    title: "Zyra/Components/TextArea",
    component: TextArea,
};

export const TestTextArea = () => {
    const demoTextAreaProps = {
        key: "comments",
        id: "comments-textarea",
        name: "comments",
        value: "Initial comment text",
        maxLength: 500,
        placeholder: "Write your comments here...",
        wrapperClass: "textarea-wrapper",
        inputClass: "textarea-input",
        rowNumber: 5,
        colNumber: 50,
        proSetting: false,
        description: "Please enter your detailed comments.",
        descClass: "textarea-description",
        onChange: ( e ) => console.log( "Changed:", e.target.value ),
        onClick: ( e ) => console.log( "Clicked" ),
        onMouseOver: ( e ) => console.log( "Mouse Over" ),
        onMouseOut: ( e ) => console.log( "Mouse Out" ),
        onFocus: ( e ) => console.log( "Focused" ),
    };

    return <TextArea { ...demoTextAreaProps } />;
};
