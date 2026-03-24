
import { useState } from "react";
import { StoryObj, Meta } from "@storybook/react-vite";

import { RandomInputKeyGeneratorUI } from "../src/components/RandomInputKeyGenerator";

const meta: Meta<typeof RandomInputKeyGeneratorUI> = {
    title: 'Zyra/Components/RandomInputKeyGenerator',
    component: RandomInputKeyGeneratorUI,
    tags: ['autodocs'],
}

export default meta;

type Story = StoryObj<typeof RandomInputKeyGeneratorUI>;

export const Default : Story = {
    render: () => {

        return (
            <>
                <RandomInputKeyGeneratorUI
                    onChange={(value: string): void => { }}
                />
            </>

        )
    }
}

export const RandomInputKeyGenerator: Story = {
    render: () => {
        const [title, setTitle] = useState<string>('');

        return (
            <>
                <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <hr />
                <RandomInputKeyGeneratorUI
                    value={title}
                    length={10}
                    onChange={setTitle}
                />
            </>

        )
    }
}


export const UiWithEmptyValue: Story = {
    render: () => {

        return (
            <>
                <RandomInputKeyGeneratorUI
                    value=''
                    length={10}
                    onChange={(value: string): void => { }}
                />
            </>

        )
    }
}

export const UiWithNonEmptyValue: Story = {
    render: () => {

        return (
            <>
                <RandomInputKeyGeneratorUI
                    value='randomtitle'
                    length={10}
                    onChange={(value: string): void => { }}
                />
            </>

        )
    }
}
