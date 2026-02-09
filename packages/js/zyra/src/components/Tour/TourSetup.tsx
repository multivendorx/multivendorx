// External dependencies
import React from 'react';
import { TourProvider, ProviderProps, StepType } from '@reactour/tour';

// Internal dependencies
import Tour from './TourSteps';
import { AppLocalizer } from '../types';


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
