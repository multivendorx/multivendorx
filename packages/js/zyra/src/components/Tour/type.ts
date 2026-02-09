import { StepType } from '@reactour/tour';

// Types
export interface AppLocalizer {
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

export interface TourProps {
    appLocalizer: AppLocalizer;
    steps: StepType[];
    forceOpen: boolean;
}

