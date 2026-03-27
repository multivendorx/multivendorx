import React from 'react';
import {FileInputUI} from '../src/components/FileInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof FileInputUI> = {
    title: 'Zyra/Components/FileInput',
    component: FileInputUI,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FileInputUI>;

export const TestFileInput: Story = {
    args: {
        wrapperClass: 'setting-file-uploader-class',
        inputClass: 'sample_file form-input',
        imageSrc: 'https://example.com/preview.jpg',
        imageWidth: 100,
        imageHeight: 100,
        openUploader: 'Upload Image',
        name: 'userFile',
        placeholder: 'Choose a file',
        onChange: (e) => {
            console.log('File changed:');
        },
        onClick: (e) => {
            console.log('Input clicked', e);
        },
        onMouseOver: (e) => {
            console.log('Mouse over input', e);
        },
        onMouseOut: (e) => {
            console.log('Mouse out of input', e);
        },
        onFocus: (e) => {
            console.log('Input focused', e);
        },
    },
    render: (args) => {
        return <FileInputUI key={'sample_file'} {...args} />;
    },
};

export const MultipleFileUpload : Story = {
    args: {
        wrapperClass: 'setting-file-uploader-class',
        inputClass: 'sample_file form-input',
        imageSrc: 'https://example.com/preview.jpg',
        imageWidth: 100,
        imageHeight: 100,
        openUploader: 'Upload Image',
        name: 'userFile',
        placeholder: 'Choose a file',
        onChange: (e) => {
            console.log('File changed:');
        },
        onClick: (e) => {
            console.log('Input clicked', e);
        },
        onMouseOver: (e) => {
            console.log('Mouse over input', e);
        },
        onMouseOut: (e) => {
            console.log('Mouse out of input', e);
        },
        onFocus: (e) => {
            console.log('Input focused', e);
        },
        multiple : true,
    },
    render: (args) => {
        return <FileInputUI key={'sample_file'} {...args} />;
    },
};
