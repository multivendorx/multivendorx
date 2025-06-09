import TimePicker from "../src/components/TimePicker";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TimePicker> = {
  title: "Zyra/Components/Form/TimePicker",
    component: TimePicker,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const TestTimePicker : Story = {
    args : {
        formField: {
            label: "Select Time",
        },
        onChange: ( field, value ) => {
            console.log( `Field: ${ field }, Value: ${ value }` );
        },
    },
    render:(args)=>{
        return <TimePicker { ...args } />;
    }
};
