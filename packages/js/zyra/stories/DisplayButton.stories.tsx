import DisplayButton from "../src/components/DisplayButton";

export default {
    title: "Zyra/Components/DisplayButton",
    component: DisplayButton,
};

export const TestDisplayButton = () => {
    const demoDisplayButtonProp = {
        customStyle: {
            button_border_size: 2,
            button_border_color: "#000000",
            button_background_color: "#ffffff",
            button_text_color: "#000000",
            button_border_radious: 4,
            button_font_size: 16,
            button_font_width: 600,
            button_margin: 8,
            button_padding: 12,
            button_border_color_onhover: "#333333",
            button_text_color_onhover: "#ffffff",
            button_background_color_onhover: "#0073e6",
            button_text: "Click Me",
        },
        children: <span>Button Content</span>,
        onClick: (e) => {
            console.log("Button clicked", e);
        },
    };


    return <DisplayButton {...demoDisplayButtonProp} />;
};

