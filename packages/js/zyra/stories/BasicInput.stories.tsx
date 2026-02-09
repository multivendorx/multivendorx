// BasicInputProProps.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import BasicInput, { BasicInputUI } from '../src/components/BasicInput';

const meta: Meta<typeof BasicInput> = {
    title: 'Zyra/Components/BasicInput/ProExamples',
    component: BasicInput,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BasicInput>;

export const AllInteractiveProps: Story = {
    render: () => {
        const [textValue, setTextValue] = useState('');
        const [passwordValue, setPasswordValue] = useState('');
        const [rangeValue, setRangeValue] = useState(50);

        return (
            <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
                {/* Text Input with pre/post text */}
                <BasicInputUI
                    wrapperClass="input-wrapper"
                    inputLabel="Text Input"
                    value={textValue}
                    placeholder="Enter text"
                    preText="<b>PreText:</b>"
                    postText="<i>:PostText</i>"
                    preInsideText="@"
                    postInsideText=".com"
                    size="100%"
                    onChange={(e) => setTextValue(e.target.value)}
                    description="Text input demonstrating preText, postText, and inside text"
                    proSetting
                />

                {/* Password with Generate / Copy / Clear */}
                <BasicInputUI
                    wrapperClass="input-wrapper"
                    inputLabel="Password Input"
                    type="text"
                    value={passwordValue}
                    generate="true"
                    size="100%"
                    onChange={(e) => setPasswordValue(e.target.value)}
                    description="Generate a random key and copy/clear functionality"
                    proSetting
                />

                {/* Range input with unit */}
                <BasicInputUI
                    wrapperClass="input-wrapper"
                    inputLabel="Range Input"
                    type="range"
                    value={rangeValue}
                    min={0}
                    max={100}
                    rangeUnit="%"
                    size="100%"
                    onChange={(e) => setRangeValue(Number(e.target.value))}
                    description="Range input with unit and live output"
                    proSetting
                />

                {/* Button Input */}
                <BasicInputUI
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
                <BasicInputUI
                    wrapperClass="input-wrapper"
                    inputLabel="Disabled Input"
                    value="Disabled"
                    disabled
                    description="Disabled input field"
                />
                <BasicInputUI
                    wrapperClass="input-wrapper"
                    inputLabel="ReadOnly Input"
                    value="Read Only"
                    readOnly
                    description="Read-only input field"
                />

                {/* Feedback Example */}
                <BasicInputUI
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
