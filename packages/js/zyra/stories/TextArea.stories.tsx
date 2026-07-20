/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import TextArea from '../src/components/TextArea';

const meta: Meta<typeof TextArea> = {
    title: 'Zyra/Components/TextArea',
    component: TextArea,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TextArea>;

/**
 * 1. Plain TextArea (Controlled)
 */
export const PlainText: Story = {
    render: () => {
        const [value, setValue] = useState('Initial comment text');

        return (
            <TextArea
                id="comments-textarea"
                name="comments"
                value={value}
                rowNumber={5}
                colNumber={50}
                usePlainText
                description="Please enter your detailed comments."
                descClass="settings-metabox-description"
                onChange={(e) => {
                    console.log('Changed:', e.target.value);
                    setValue(e.target.value);
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
            <TextArea
                name="editor"
                value={value}
                tinymceApiKey="no-api-key-needed-for-storybook"
                rowNumber={8}
                description="Rich text editor using TinyMCE"
                descClass="settings-metabox-description"
                onChange={(e) => {
                    console.log('Editor Changed:', e.target.value);
                    setValue(e.target.value);
                }}
            />
        );
    },
};
