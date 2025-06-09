import ShortCodeTable from "../src/components/ShortCodeTable";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ShortCodeTable> = {
  title: "Zyra/Components/ShortCodeTable",
    component: ShortCodeTable,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ShortCodeTable>;

export const TestShortCodeTable : Story= {
    args : {
        wrapperClass: "shortcode-table-wrapper",
        descClass: "shortcode-description",
        description: "Here are the available shortcode options:",
        options: [
            { label: "Shortcode 1", desc: "[shortcode_1]" },
            { label: "Shortcode 2", desc: "[shortcode_2]" },
        ],
        optionLabel: [ "Shortcode 1", "Shortcode 2" ],
    },
    render:(args)=>{
        return <ShortCodeTable { ...args } />;
    }
};
