import Attachment from "../src/components/Attachment";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Attachment> = {
  title: "Zyra/Components/Form/Attachment",
  component: Attachment,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Attachment>;

export const TestAttachmentInput: Story = {
    args: {
        formField: {
            label: "Upload Document",
            placeholder: "Choose a file...",
        },
        onChange: ( field, value ) => {
            console.log( `Field changed: ${ field } = ${ value }` );
        },
    },
    render: (args)=>{
        return(
            <Attachment { ...args } />
        )
    }
};
