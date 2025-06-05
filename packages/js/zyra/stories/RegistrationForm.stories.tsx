import CustomFrom from "../src/components/RegistrationForm";

export default {
    title: "Zyra/Components/RegistrationForm",
    component: CustomFrom,
};

export const TestRegistrationForm = () => {
    const formfieldlist = [
        {
            id: 1,
            type: "text",
            label: "Full Name",
            required: true,
            name: "fullName",
            placeholder: "Enter your full name"
        },
        {
            id: 2,
            type: "email",
            label: "Email Address",
            required: true,
            name: "email",
            placeholder: "Enter your email"
        },
        {
            id: 3,
            type: "select",
            label: "Choose a Plan",
            required: false,
            name: "plan",
            options: [
            { label: "Basic", value: "basic", isdefault: true },
            { label: "Pro", value: "pro" },
            { label: "Enterprise", value: "enterprise" }
            ]
        },
        {
            id: 4,
            type: "recaptcha",
            label: "Security Check",
            required: true,
            name: "recaptcha",
            sitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Google test sitekey
        }
    ];

    const demoCustomFormProps = {
        onChange: ({ formfieldlist, butttonsetting }) => {
            console.log("Form updated:", formfieldlist, butttonsetting);
        },
        name: "registrationForm",
        proSettingChange: () => {
            console.log("Pro setting checked.");
            return true;
        },
        formTitlePlaceholder: "Enter your form title here",
        setting: {
            fullName: "",
            email: "",
            plan: "basic",
            recaptcha: ""
        }
    };

    return <CustomFrom { ...demoCustomFormProps } />;
};
