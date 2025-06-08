import AdminFooter from "../src/components/AdminFooter";
import type { Meta, StoryObj } from '@storybook/react';
import "../src/styles/common.scss";

const meta: Meta<typeof AdminFooter> = {
  title: "Zyra/Components/AdminFooter",
  component: AdminFooter,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AdminFooter>;

const supportLintData = [
    {
        title: "This is admin footer 1",
        icon: "adminLib-person",
        description: "This is admin footer description 1",
        link: "#",
    },
    {
        title: "This is admin footer 2",
        icon: "adminLib-vpn-key",
        description: "This is admin footer description 2",
        link: "#",
    },
    {
        title: "This is admin footer 3",
        icon: "adminLib-mail",
        description: "This is admin footer description 3",
        link: "#",
    },
]

export const TestAdminFooter: Story = {
    args: {
        supportLink: supportLintData
    },
    render: (args) => (
        <AdminFooter {...args} />
    ),
};
