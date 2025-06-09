import Divider from "../src/components/Divider";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Divider> = {
  title: "Zyra/Components/Form/Divider",
  component: Divider,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Divider>;


export const TestDivider : Story = {
    render:()=>{
        return <Divider />;
    }
};
