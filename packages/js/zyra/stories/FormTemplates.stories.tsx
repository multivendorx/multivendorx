// FormTemplates.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import FormTemplates from '../src/components/FormTemplates';

const meta: Meta<typeof FormTemplates> = {
    title: 'Zyra/Components/FormTemplates',
    component: FormTemplates,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormTemplates>;

// Default story: select template
export const Default: Story = {
    render: () => {
        const [selectedTemplate, setSelectedTemplate] = useState<
            any | null
        >(null);

        return (
            <div>
                <FormTemplates onTemplateSelect={setSelectedTemplate} />
                {selectedTemplate && (
                    <div style={{ marginTop: '20px' }}>
                        <strong>Selected Template:</strong>
                        <pre>
                            {JSON.stringify(selectedTemplate, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    },
};
