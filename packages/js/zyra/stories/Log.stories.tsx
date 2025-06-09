import Log from "../src/components/Log";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Log> = {
  title: "Zyra/Components/Log",
  component: Log,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Log>;

export const TestLog : Story = {
    args : {
        apiLink: "https://api.example.com/logs",
        downloadFileName: "app-log.txt",
        appLocalizer: {
            locale: "en-US",
            timezone: "UTC",
        },
    },
    render:(args)=>{
        return <Log { ...args } />;
    }
};
