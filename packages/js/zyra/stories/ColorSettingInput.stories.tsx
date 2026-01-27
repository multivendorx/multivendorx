// ColorSettingInput.stories.tsx
import React, { useState } from 'react';
import ColorSettingInput from '../src/components/ColorSettingInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import "../src/styles/common.scss";

const meta: Meta<typeof ColorSettingInput> = {
    title: 'Zyra/Components/ColorSettingInput',
    component: ColorSettingInput,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ColorSettingInput>;

// Sample predefined palettes
const predefinedPalettes = [
    {
        key: 'palette1',
        value: 'palette1',
        label: 'Red & Yellow',
        colors: {
            colorPrimary: '#FF5959',
            colorSecondary: '#FADD3A',
            colorAccent: '#49BEB6',
            colorSupport: '#075F63',
        },
    },
    {
        key: 'palette2',
        value: 'palette2',
        label: 'Blue & Green',
        colors: {
            colorPrimary: '#0057FF',
            colorSecondary: '#00FF57',
            colorAccent: '#FF00AA',
            colorSupport: '#FFAA00',
        },
    },
    {
        key: 'custom',
        value: 'custom',
        label: 'Custom',
        colors: {},
    },
];

// Sample image-based palettes
const imagePalettes = [
    {
        key: 'img1',
        value: 'img1',
        label: 'Template 1',
        img: 'https://via.placeholder.com/80x60/FF5959/FFFFFF?text=T1',
    },
    {
        key: 'img2',
        value: 'img2',
        label: 'Template 2',
        img: 'https://via.placeholder.com/80x60/0057FF/FFFFFF?text=T2',
    },
];

export const PredefinedPalette: Story = {
    render: () => {
        const [value, setValue] = useState({ selectedPalette: 'palette1', colors: {} });

        return (
            <div className='multivendorx-main-wrapper'>
            <ColorSettingInput
                wrapperClass="color-setting-wrapper"
                predefinedOptions={predefinedPalettes}
                images={[]}
                value={value}
                onChange={(e) => setValue(e.target.value as any)}
            />
            </div>
        );
    },
};

export const CustomPalette: Story = {
    render: () => {
        const [value, setValue] = useState({ selectedPalette: 'custom', colors: {} });

        return (
            <div className='multivendorx-main-wrapper'>
            <ColorSettingInput
                wrapperClass="color-setting-wrapper"
                predefinedOptions={predefinedPalettes}
                images={[]}
                value={value}
                onChange={(e) => setValue(e.target.value as any)}
            />
            </div>
        );
    },
};

export const ImagePalette: Story = {
    render: () => {
        const [value, setValue] = useState({ selectedPalette: 'img1', colors: {} });

        return (
            <div className='multivendorx-main-wrapper'>
            <ColorSettingInput
                wrapperClass="color-setting-wrapper"
                predefinedOptions={predefinedPalettes}
                images={imagePalettes}
                value={value}
                onChange={(e) => setValue(e.target.value as any)}
                showPreview
            />
            </div>
        );
    },
};

export const WithPreview: Story = {
    render: () => {
        const [value, setValue] = useState({ selectedPalette: 'palette1', colors: {} });

        return (
            <div className='multivendorx-main-wrapper'>
            <ColorSettingInput
                wrapperClass="color-setting-wrapper"
                predefinedOptions={predefinedPalettes}
                images={imagePalettes}
                value={value}
                onChange={(e) => setValue(e.target.value as any)}
                showPreview
                description="Select a color palette for your store. Preview updates live."
            />
            </div>
        );
    },
};
