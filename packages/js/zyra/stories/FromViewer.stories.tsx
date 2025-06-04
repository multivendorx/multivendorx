import FormViewer from "../src/components/FormViewer";

export default {
    title: "Zyra/Components/FormViewer",
    component: FormViewer,
};

export const TestFormViewer = () => {
    const demoFormViewerProps = {
        formFields: {
            formfieldlist: [
                {
                    type: "text",
                    name: "username",
                    label: "Username",
                    placeholder: "Enter your username",
                    required: true,
                    charlimit: 50,
                },
                {
                    type: "textarea",
                    name: "bio",
                    label: "Bio",
                    row: 4,
                    col: 50,
                },
                {
                    type: "select",
                    name: "country",
                    label: "Country",
                    options: [
                        {
                            value: "us",
                            label: "United States",
                            isdefault: true,
                        },
                        { value: "ca", label: "Canada" },
                        { value: "uk", label: "United Kingdom" },
                    ],
                },
            ],
            butttonsetting: {
                text: "Submit",
                style: "primary",
            },
        },
        onSubmit: ( data: FormData ) => {
            console.log(
                "Form submitted:",
                Object.fromEntries( data.entries() )
            );
        },
    };

    return <FormViewer { ...demoFormViewerProps } />;
};
