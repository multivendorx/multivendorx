import TemplateSection from "../src/components/TemplateSection";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TemplateSection> = {
  title: "Zyra/Components/Form/TemplateSection",
    component: TemplateSection,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TemplateSection>;

export const TestTemplateSection : Story = {
    args : {
        formField: {
            label: "Email Template",
        },
        onChange: ( key, value ) => {
            console.log( `Field: ${ key }, New Value: ${ value }` );
        },
    },
    render: (args)=>{
        return <TemplateSection { ...args } />;
    }
};
