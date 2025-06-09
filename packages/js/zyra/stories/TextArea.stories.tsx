import TextArea from "../src/components/TextArea";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TextArea> = {
  title: "Zyra/Components/TextArea",
    component: TextArea,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TextArea>;

export const TestTextArea : Story = {
    args : {
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
        descClass: "settings-metabox-description",
        onChange: ( e ) => console.log( "Changed:", e.target.value ),
        onClick: ( e ) => console.log( "Clicked" ),
        onMouseOver: ( e ) => console.log( "Mouse Over" ),
        onMouseOut: ( e ) => console.log( "Mouse Out" ),
        onFocus: ( e ) => console.log( "Focused" ),
    },
    render:(args)=>{
        return <TextArea { ...args } />;
    }
};
