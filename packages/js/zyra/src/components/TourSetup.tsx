// External dependencies
import React from 'react';
import { TourProvider, ProviderProps, StepType } from '@reactour/tour';

// Internal dependencies
import Tour from './TourSteps';

interface AppLocalizer {
    enquiry_form_settings_url?: string;
    page_url?: string;
    settings_page_url?: string;
    site_url?: string;
    module_page_url?: string;
    customization_settings_url?: string;
    apiUrl: string;
    nonce: string;
    restUrl: string;
}

// Props for TourSetup
interface TourSetupProps extends Omit< ProviderProps, 'steps' > {
    appLocalizer: AppLocalizer;
    steps: StepType[];
    forceOpen: boolean;
}

/**
 * Wraps the Tour component with context
 */
const TourSetup: React.FC< TourSetupProps > = ( {
    appLocalizer,
    steps,
    forceOpen = false,
    ...rest
} ) => {
    return (
        <TourProvider
            steps={[]}
            showNavigation={false}
            className="tour-content"
            styles={{
                popover: (base) => ({
                    ...base,
                    padding: '1.125rem',
                    borderRadius: '0.313rem',
                })
            }}
            showPrevNextButtons={false}
            showDots={false}
            showBadge={false}
            {...rest}
        >
            <Tour
                appLocalizer={ appLocalizer }
                steps={ steps }
                forceOpen={ forceOpen }
            />
        </TourProvider>
    );
};

export default TourSetup;
