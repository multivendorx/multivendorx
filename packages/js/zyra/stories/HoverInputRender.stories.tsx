import HoverInputRender from "../src/components/HoverInputRender";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof HoverInputRender> = {
  title: "Zyra/Components/Form/HoverInputRender",
  component: HoverInputRender,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof HoverInputRender>;


export const TestHoverInputRender : Story = {
    args : {
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
    },
    render:(args)=>{
        return <HoverInputRender { ...args } />;
    }
};
