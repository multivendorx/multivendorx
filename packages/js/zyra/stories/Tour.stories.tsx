
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepType } from '@reactour/tour';
import "../src/styles/common.scss";

/**
 * Internal dependencies
 */
import TourSetup from '../src/components/TourSetup';

const mockAppLocalizer = {
    enquiry_form_settings_url: window.location.href,
    module_page_url: window.location.href,
    settings_page_url: window.location.href,
    customization_settings_url: window.location.href,
    apiUrl: '',
    restUrl: '',
    nonce: 'storybook-nonce',
};


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

const singleStep: StepType[] = [
    {
        selector: '#step-1',
        content: () => (
            <div>
                <h4>Single Step Tour</h4>
                <p>This is a tour with only one step.</p>
            </div>
        ),
    },
];

const meta: Meta<typeof TourSetup> = {
    title: 'Zyra/Components/TourSetup',
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
    tags: ['autodocs'],
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
            <div className = 'multivendorx-main-wrapper'>
                <h2 id="tour-step-1">Module Dashboard</h2>
                <p>This section is highlighted in step one.</p>

                <button id="tour-step-2">
                    Settings Button
                </button>
            </div>

            <TourSetup
                {...args}
                defaultOpen={true}
                showBadge={false}
                forceOpen={true}
            />
        </>
    ),
};

export const TourDisabled: Story = {
    args: {
        appLocalizer: mockAppLocalizer,
        steps,
    },
    render: (args) => (
        <>
            <div className = 'multivendorx-main-wrapper'>
                <h2 id="tour-step-1">Module Dashboard</h2>
                <p>This section is highlighted in step one.</p>

                <button id="tour-step-2">
                    Settings Button
                </button>
            </div>

            <TourSetup
                {...args}
                defaultOpen={false}
                forceOpen={false}
            />
        </>
    ),
};

export const SingleStepTour: Story = {
    args: {
        appLocalizer: mockAppLocalizer,
        steps: singleStep,
    },
    render: (args) => (
        <>
            <div className = 'multivendorx-main-wrapper'>
                <h2 id="step-1">Single Step Target</h2>
                <p>This section is highlighted in the single step tour.</p>
            </div>

            <TourSetup
                {...args}
                defaultOpen={true}
                showBadge={false}
                forceOpen={true}
            />
        </>
    ),
};

