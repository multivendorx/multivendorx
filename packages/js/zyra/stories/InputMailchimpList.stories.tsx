import InputMailchimpList from "../src/components/InputMailchimpList";

export default {
    title: "Zyra/Components/InputMailchimpList",
    component: InputMailchimpList,
};

export const TestInputMailchimpList = () => {
    const demoInputMailchimpListProps = {
        mailchimpKey: "abc123-us6",
        optionKey: "mailchimp_list",
        settingChanged: { current: false },
        apiLink: "https://api.mailchimp.com/3.0/lists",
        proSettingChanged: () => {
            console.log("Checked pro setting change");
            return true;
        },
        onChange: (event, key) => {
            console.log(`Changed key ${key} to`, event.target.value);
        },
        selectKey: "newsletterList",
        value: "list_001",
        setting: {
            mailchimp_list: "list_001",
        },
        updateSetting: (key: string, value: any) => {
            console.log(`Updated setting ${key} to`, value);
        },
        appLocalizer: {
            someFlag: true,
            someText: "Localized string",
        },
    };

    return <InputMailchimpList {...demoInputMailchimpListProps} />;
};
