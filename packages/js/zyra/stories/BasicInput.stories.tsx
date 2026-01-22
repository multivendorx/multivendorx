// BasicInputProProps.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import BasicInput from '../src/components/BasicInput';

const meta: Meta<typeof BasicInput> = {
    title: 'Zyra/Components/BasicInput/ProExamples',
    component: BasicInput,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BasicInput>;

export const BasicInputPreText: Story = {
    render: () => {
        const [textValue, setTextValue] = useState('');

        return (
            <div>
                {/* Text Input with pre/post text */}
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="Text Input"
                    value={textValue}
                    placeholder="Enter text"
                    preText="<b>PreText:</b>"
                    preInsideText="@"
                    size="20rem"
                    onChange={(e) => setTextValue(e.target.value)}
                    description="Text input demonstrating PreText and Inside Text"
                    proSetting
                />
            </div>
        );
    },
};

export const BasicInputGeneratePassword: Story = {
    render: () => {
        const [passwordValue, setPasswordValue] = useState('');

        return (
            <div>
                {/* Password with Generate / Copy / Clear */}
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="Password Input"
                    type="text"
                    value={passwordValue}
                    generate="true"
                    size="20rem"
                    onChange={(e) => setPasswordValue(e.target.value)}
                    description="Generate a random key and copy/clear functionality"
                    proSetting
                />
            </div>
        );
    },
};

export const AllInteractiveProps: Story = {
    render: () => {
        const [textValue, setTextValue] = useState('');
        const [passwordValue, setPasswordValue] = useState('');
        const [rangeValue, setRangeValue] = useState(50);

        return (
            <div>
                {/* Text Input with pre/post text */}
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="Text Input"
                    value={textValue}
                    placeholder="Enter text"
                    preText="<b>PreText:</b>"
                    postText="<i>:PostText</i>"
                    preInsideText="@"
                    postInsideText=".com"
                    size="25rem"
                    onChange={(e) => setTextValue(e.target.value)}
                    description="Text input demonstrating preText, postText, and inside text"
                    proSetting
                />

                {/* Password with Generate / Copy / Clear */}
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="Password Input"
                    type="text"
                    value={passwordValue}
                    generate="true"
                    size="20rem"
                    onChange={(e) => setPasswordValue(e.target.value)}
                    description="Generate a random key and copy/clear functionality"
                    proSetting
                />

                {/* Range input with unit */}
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="Range Input"
                    type="range"
                    value={rangeValue}
                    min={0}
                    max={100}
                    size="20rem"
                    onChange={(e) => setRangeValue(Number(e.target.value))}
                    description="Range input with unit and live output"
                    proSetting
                />

                {/* Button Input */}
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="Custom Button Input"
                    type="button"
                    clickBtnName="Click Me"
                    onclickCallback={() =>
                        alert(`Button clicked with current value: ${textValue}`)
                    }
                    description="Button input with click callback"
                    proSetting
                />

                {/* Disabled / ReadOnly */}
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="Disabled Input"
                    value="Disabled"
                    disabled
                    description="Disabled input field"
                />
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="ReadOnly Input"
                    value="Read Only"
                    readOnly
                    description="Read-only input field"
                />

                {/* Feedback Example */}
                <BasicInput
                    wrapperClass="input-wrapper"
                    inputLabel="Input with Feedback"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    feedback={{ type: 'error', message: 'Invalid input' }}
                    description="Shows feedback message below input"
                    proSetting
                />
            </div>
        );
    },
};
