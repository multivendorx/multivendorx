import { StoryObj, Meta } from "@storybook/react-vite";

import { PrePostTextUI } from "../src/components/PrePostText";

const meta: Meta<typeof PrePostTextUI> = {
    title: 'Zyra/Components/PrePostText',
    component: PrePostTextUI,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PrePostTextUI>;

export const PreText: Story = {
    render: () => {

        return (
            <PrePostTextUI
                type="text"
                textType="pre"
                preText="Pre Text"
            />
        );
    }
}

export const PostText: Story = {
    render: () => {

        return (
            <PrePostTextUI
                type="text"
                textType="post"
                postText="Post Text"
            />
        );
    }
}