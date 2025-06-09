import MultipleOptions from "../src/components/MultipleOption";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MultipleOptions> = {
  title: "Zyra/Components/Form/MultipleOptions",
  component: MultipleOptions,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MultipleOptions>;
const options = [
        { id: "opt1", label: "Option A", value: "A", isdefault: true },
        { id: "opt2", label: "Option B", value: "B" },
        { id: "opt3", label: "Option C", value: "C" },
    ];

    const formField = {
        id: 101,
        type: "dropdown",
        label: "Select an Option",
        required: true,
        name: "selection",
        placeholder: "Choose one",
        options: options,
    };

export const TestLog : Story = {
    
    args : {
        formField: formField,
        onChange: ( key, value ) => {
            console.log( `Field ${ key } changed to`, value );
        },
        type: "dropdown" as "dropdown",
        selected: true,
    },
    render:(args)=>{
        return <MultipleOptions { ...args } />;
    }
};
