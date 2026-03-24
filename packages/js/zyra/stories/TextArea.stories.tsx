/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import { TextAreaUI } from '../src/components/TextArea';
import TextArea from '../src/components/TextArea';

const meta: Meta<typeof TextAreaUI> = {
    title: 'Zyra/Components/TextArea',
    component: TextAreaUI,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TextAreaUI>;

/**
 * 1. Plain TextArea (Controlled)
 */
export const PlainText: Story = {
    render: () => {
        const [value, setValue] = useState('Initial comment text');

        return (
            <TextAreaUI
                id="comments-textarea"
                name="comments"
                value={value}
                rowNumber={5}
                colNumber={50}
                usePlainText = {true}
                proSetting={true}
                onChange={(val) => {
                    console.log('Changed:', val);
                    setValue(val);
                }}
                onFocus={(e) => console.log('Focused', e.target)}
                onBlur={(e) => console.log('Blurred', e.target)}
            />
        );
    },
};

/**
 * 2. TinyMCE Editor (Controlled)
 */
export const TinyMCEEditor: Story = {
    render: () => {
        const [value, setValue] = useState('<p>Initial editor content</p>');

        return (
            <TextAreaUI
                name="editor"
                value={value}
                tinymceApiKey="no-api-key-needed-for-storybook"
                rowNumber={8}
                onChange={(val) => {
                    console.log('Editor Changed:', val);
                    setValue(val);
                }}
            />
        );
    },
};

export const ReadOnly: Story = {
    render: () => {
        const [value, setValue] = useState('for read only purpose');

        return (
            <TextAreaUI
                id="comments-textarea"
                name="comments"
                placeholder='write comment'
                value={value}
                rowNumber={5}
                colNumber={50}
                usePlainText = {true}
                readOnly= {true}
                onChange={(val) => {
                    console.log('Changed:', val);
                    setValue(val);
                }}
                
                onFocus={(e) => console.log('Focused', e.target)}
                onBlur={(e) => console.log('Blurred', e.target)}
            />
        );
    },
};
