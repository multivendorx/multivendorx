import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Input from '../src/components/input/Input';

const meta: Meta<typeof Input> = {
    title: 'Zyra/Components/Input',
    component: Input,
    tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const InputPreText: Story = {
    render: () => {
        const [textValue, setTextValue] = useState('');

        return (
            <div>
                {/* Text Input with pre/post text */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Text Input"
                    value={textValue}
                    placeholder="Enter text"
                    preText="<b>PreText:</b>"
                    preInsideText="@"
                    size="20rem"
                    onChange={(value: string) => setTextValue(value)}
                    description="Text input demonstrating PreText and Inside Text"
                />
            </div>
        );
    },
};

export const InputGeneratePassword: Story = {
    render: () => {
        const [passwordValue, setPasswordValue] = useState('');

        return (
            <div>
                {/* Password with Generate / Copy / Clear */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Password Input"
                    type="text"
                    value={passwordValue}
                    generate="true"
                    size="20rem"
                    onChange={(value: string) => setPasswordValue(value)}
                    description="Generate a random key and copy/clear functionality"
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
        const [selectValue, setValue] = useState<Record<string, string>>({
            value: '100',
            unit: 'px',
        });

        return (
            <div>
                {/* Text Input with pre/post text */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Text Input"
                    value={textValue}
                    placeholder="Enter text"
                    preText="<b>PreText:</b>"
                    postText="<i>:PostText</i>"
                    preInsideText="@"
                    postInsideText=".com"
                    size="25rem"
                    onChange={(value: string) => setTextValue(value)}
                    description="Text input demonstrating preText, postText, and inside text"
                />

                {/* Password with Generate / Copy / Clear */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Password Input"
                    type="text"
                    value={passwordValue}
                    generate="true"
                    size="20rem"
                    onChange={(value: string) => setPasswordValue(value)}
                    description="Generate a random key and copy/clear functionality"
                />

                {/* Input with Click Button */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Input with Action Button"
                    value={textValue}
                    placeholder="Enter text"
                    clickBtnName="Apply"
                    size="20rem"
                    onChange={(value: string) => setTextValue(value)}
                    onclickCallback={() => alert(`Applied: ${textValue}`)}
                    description="Input with custom action button inside"
                />

                {/* Range input with unit */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Range Input"
                    type="range"
                    value={rangeValue}
                    min={0}
                    max={100}
                    rangeUnit="px"
                    size="20rem"
                    onChange={(value: string) => setRangeValue(Number(value))}
                    description="Range input with unit and live output"
                />

                {/* Color Input */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Color Input"
                    type="color"
                    value="#ff5733"
                    size="20rem"
                    onChange={(value: string) => console.log('Color changed:', value)}
                    description="Color picker input showing hex value"
                />

                {/* Button Input */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Custom Button Input"
                    type="button"
                    name="Click Me"
                    onclickCallback={() =>
                        alert(`Button clicked with current value: ${textValue}`)
                    }
                    description="Button input with click callback"
                />

                {/* Disabled / ReadOnly */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Disabled Input"
                    value="Disabled"
                    disabled
                    description="Disabled input field"
                />
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="ReadOnly Input"
                    value="Read Only"
                    readOnly
                    description="Read-only input field"
                />

                {/* Feedback Example */}
                <Input
                    wrapperClass="input-wrapper"
                    inputLabel="Input with Feedback"
                    value={textValue}
                    onChange={(value: string) => setTextValue(value)}
                    feedback={{ type: 'error', message: 'Invalid input' }}
                    description="Shows feedback message below input"
                />
            </div>
        );
    },
};
