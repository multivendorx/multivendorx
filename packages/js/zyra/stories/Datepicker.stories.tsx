import Datepicker from "../src/components/DatePicker";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Datepicker> = {
  title: "Zyra/Components/Form/DatePicker",
  component: Datepicker,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Datepicker>;

export const TestDatepicker : Story = {
    args : {
        formField: {
            label: "Select Date",
        },
        onChange: ( field, value ) => {
            console.log( `Changed ${ field } to ${ value }` );
        },
    },
    render:(args)=>{
        return <Datepicker { ...args } />;
    }
};
