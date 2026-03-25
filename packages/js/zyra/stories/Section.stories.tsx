import { SectionUI } from '../src/components/Section';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SectionUI> = {
    title: 'Zyra/Components/Section',
    component: SectionUI,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SectionUI>;

export const Default : Story = {
    render:()=>{
        return (
            <SectionUI 
                wrapperClass='setting-section-divider'
                title='User Registration'
                desc='This section contains user registration settings.'
            />
        )
    }
}

export const SectionJustWithTitle : Story = {
    render:()=>{
        return (
            <SectionUI 
                title='User Registration'
            />
        )
    }
}

export const SectionJustWithDescription : Story = {
    render:()=>{
        return (
            <SectionUI 
                desc='This section contains user registration settings.'
            />
        )
    }
}

export const SectionWithoutBorder : Story = {
    render:()=>{
        return (
            <SectionUI 
                wrapperClass='setting-section-divider'
                title='User Registration'
                desc='This section contains user registration settings.'
                withoutBorder={true}
            />
        )
    }
}

