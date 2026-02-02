// External dependencies
import React from 'react';
import { TourProvider, ProviderProps, StepType } from '@reactour/tour';

// Internal dependencies
import Tour from './TourSteps';

// AppLocalizer interface
export interface AppLocalizer {
    enquiry_form_settings_url?: string;
    module_page_url?: string;
    settings_page_url?: string;
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
        <TourProvider steps={ [] } { ...rest }>
            <Tour
                appLocalizer={ appLocalizer }
                steps={ steps }
                forceOpen={ forceOpen }
            />
        </TourProvider>
    );
};

export default TourSetup;
