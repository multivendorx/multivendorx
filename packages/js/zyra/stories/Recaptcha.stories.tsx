import Recaptcha from "../src/components/Recaptcha";

export default {
    title: "Zyra/Components/Form/Recaptcha",
    component: Recaptcha,
};

export const TestRecaptcha = () => {
    const demoRecaptchaProps = {
        formField: {
            sitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Google test sitekey
        },
        onChange: (field, value) => {
            console.log(`Recaptcha response for field "${field}":`, value);
        }
    };

    return <Recaptcha { ...demoRecaptchaProps } />;
};
