import FileInput from "../src/components/FileInput";

export default {
    title: "Zyra/Components/FileInput",
    component: FileInput,
};

export const TestFileInput = () => {
    const demoFileInputProps = {
        wrapperClass: "file-input-wrapper",
        inputClass: "file-input",
        id: "upload-file",
        type: "file",
        name: "userFile",
        value: "",
        placeholder: "Choose a file",
        onChange: ( e ) => {
            console.log( "File changed:", e.target.files );
        },
        onClick: ( e ) => {
            console.log( "Input clicked", e );
        },
        onMouseOver: ( e ) => {
            console.log( "Mouse over input", e );
        },
        onMouseOut: ( e ) => {
            console.log( "Mouse out of input", e );
        },
        onFocus: ( e ) => {
            console.log( "Input focused", e );
        },
        proSetting: true,
        imageSrc: "https://example.com/preview.jpg",
        imageWidth: 100,
        imageHeight: 100,
        buttonClass: "upload-btn",
        onButtonClick: ( e ) => {
            console.log( "Upload button clicked", e );
        },
        openUploader: "cloudUploader",
        descClass: "file-desc",
        description: "Upload your profile picture",
    };

    return <FileInput { ...demoFileInputProps } />;
};
