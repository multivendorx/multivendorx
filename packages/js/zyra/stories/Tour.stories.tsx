/**
 * External dependencies
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { StepType } from '@reactour/tour';

/**
 * Internal dependencies
 */
import TourSetup from '../src/components/TourSetup';

/**
 * Dummy appLocalizer for Storybook
 */
const mockAppLocalizer = {
    enquiry_form_settings_url: window.location.href,
    module_page_url: window.location.href,
    settings_page_url: window.location.href,
    customization_settings_url: window.location.href,
    apiUrl: '',
    restUrl: '',
    nonce: 'storybook-nonce',
};

/**
 * Dummy steps
 */
const steps: StepType[] = [
    {
        selector: '#tour-step-1',
        content: ({ finishTour }) => (
            <div>
                <h4>Welcome</h4>
                <p>This is the first step of the tour.</p>
                <button onClick={finishTour}>Finish</button>
            </div>
        ),
    },
    {
        selector: '#tour-step-2',
        content: () => (
            <div>
                <h4>Second Step</h4>
                <p>This step highlights another UI element.</p>
            </div>
        ),
    },
];

const meta: Meta<typeof TourSetup> = {
    title: 'Zyra/Components/Tour',
    component: TourSetup,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Product tour powered by Reactour. This Storybook example uses dummy data and local DOM targets.',
            },
        },
    },
};

export default meta;

type Story = StoryObj<typeof TourSetup>;

export const DefaultTour: Story = {
    args: {
        appLocalizer: mockAppLocalizer,
        steps,
    },
    render: (args) => (
        <>
            {/* Dummy UI targets */}
            <div style={{ padding: 40 }}>
                <h2 id="tour-step-1">Module Dashboard</h2>
                <p>This section is highlighted in step one.</p>

                <button id="tour-step-2" style={{ marginTop: 20 }}>
                    Settings Button
                </button>
            </div>

            {/* Tour */}
            <TourSetup
                {...args}
                defaultOpen={true}
                showBadge={false}
                forceOpen={true}
            />
        </>
    ),
};
