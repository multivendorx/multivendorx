import MergeComponent from "../src/components/MergeComponent";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MergeComponent> = {
  title: "Zyra/Components/MergeComponent",
    component: MergeComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MergeComponent>;

export const TestMergeComponent: Story = {
    args : {
        wrapperClass: "merge-wrapper",
        descClass: "merge-description",
        description: "Merge multiple fields into one value.",
        onChange: ( data ) => {
            console.log( "Merge data changed:", data );
        },
        value: {
            field1: "option1",
            field2: 5,
            field3: "Sample Text",
        },
        proSetting: true,
        fields: [
            {
                name: "field1",
                type: "select" as "select",
                options: [
                    { value: "option1", label: "Option 1" },
                    { value: "option2", label: "Option 2" },
                ],
                placeholder: "Select an option",
            },
            {
                name: "field2",
                type: "number" as "number",
                placeholder: "Enter a number",
            },
            {
                name: "field3",
                type: "text" as "text",
                placeholder: "Enter text",
            },
        ],
    },
    render:(args)=>{
        return <MergeComponent { ...args } />;
    }
};
