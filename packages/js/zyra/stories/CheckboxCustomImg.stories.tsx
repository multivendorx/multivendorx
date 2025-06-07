import CheckboxCustomImg from "../src/components/CheckboxCustomImg";

export default {
    title: "Zyra/Components/CheckboxCustomImg",
    component: CheckboxCustomImg,
};

export const TestCheckboxCustomImg = () => {
    const demoCheckboxCustomImgProps = {
        value: [ "sync-1" ],
        onChange: ( updatedValue ) => {
            console.log( "Updated sync directions:", updatedValue );
        },
        syncDirections: [
            {
                value: "sync-1",
                img1: "http://localhost/wordpress/wp-content/plugins/plugin-elements/src/assets/images/WordPress.png",
                img2: "http://localhost/wordpress/wp-content/plugins/plugin-elements/src/assets/images/WordPress.png",
                label: "Sync Option 1",
            },
            {
                value: "sync-2",
                img1: "http://localhost/wordpress/wp-content/plugins/plugin-elements/src/assets/images/WordPress.png",
                img2: "http://localhost/wordpress/wp-content/plugins/plugin-elements/src/assets/images/WordPress.png",
                label: "Sync Option 2",
            },
        ],
        description: "Choose how you want to sync",
        proSetting: true,
    };

    return <CheckboxCustomImg { ...demoCheckboxCustomImgProps } />;
};
