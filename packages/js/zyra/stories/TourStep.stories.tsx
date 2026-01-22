
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TourProvider, StepType } from '@reactour/tour';
import "../src/styles/common.scss";


import Tour from '../src/components/TourSteps';

const meta: Meta<typeof Tour> = {
    title: 'Zyra/Components/TourSteps',
    component: Tour,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Guided product tour using Reactour with API-backed state.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tour>;


// Mock AppLocalizer
const appLocalizer = {
    enquiry_form_settings_url: window.location.href,
    page_url: window.location.href,
    settings_page_url: window.location.href,
    customization_settings_url: window.location.href,
    site_url: window.location.href,
    apiUrl: '',
    restUrl: '',
    nonce: 'storybook-nonce',
};

/**
 * Tour Steps
 */
const steps: StepType[] = [
    {
        selector: '#tour-step-1',
        content: ({ finishTour }) => (
            <div>
                <h4>Welcome</h4>
                <p>This is the first step</p>
                <button onClick={finishTour}>Finish</button>
            </div>
        ),
    },
    {
        selector: '#tour-step-2',
        content: ({ navigateTo }) => (
            <div>
                <h4>Settings</h4>
                <p>Navigate to settings page</p>
                <button
                    onClick={() =>
                        navigateTo(window.location.href, 1, '#tour-step-2')
                    }
                >
                    Go
                </button>
            </div>
        ),
    },
];

export const Default: Story = {
    render: () => (
        <>
            <div className = 'multivendorx-main-wrapper'>
                <h2 id="tour-step-1">Dashboard Section</h2>
                <button id="tour-step-2">
                    Settings Button
                </button>
            </div>

            {/* Provider REQUIRED */}
            <TourProvider steps={[]}>
                <Tour
                    appLocalizer={appLocalizer}
                    steps={steps}
                    forceOpen={true}
                />
            </TourProvider>
        </>
    ),
};



