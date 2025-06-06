import HoverInputRender from "../src/components/HoverInputRender";

export default {
    title: "Zyra/Components/Form/HoverInputRender",
    component: HoverInputRender,
};

export const TestHoverInputRender = () => {
    const demoHoverInputRenderProps = {
        label: "Username",
        placeholder: "Enter your username",
        onLabelChange: ( newLabel ) => {
            console.log( "Label changed to:", newLabel );
        },
        renderStaticContent: ( {
            label,
            placeholder,
        }: {
            label: string;
            placeholder?: string;
        } ) => <div title={ placeholder }>{ label }</div>,
        renderEditableContent: ( {
            label,
            onLabelChange,
            placeholder,
        }: {
            label: string;
            onLabelChange: ( newLabel: string ) => void;
            placeholder?: string;
        } ) => (
            <input
                type="text"
                value={ label }
                placeholder={ placeholder }
                onChange={ ( e ) => onLabelChange( e.target.value ) }
            />
        ),
    };

    return <HoverInputRender { ...demoHoverInputRenderProps } />;
};
