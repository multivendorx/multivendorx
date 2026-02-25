// External dependencies
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { StepType, useTour } from '@reactour/tour';

// Internal dependencies
import { getApiLink } from '../utils/apiService';
import { AdminButtonUI } from './AdminButton';

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

interface TourContent {
    title: string;
    description: string;
    nextBtn?: {
        link: string;
        step: number;
    };
    finishBtn?: boolean;
}

interface TourProps {
    appLocalizer: AppLocalizer;
    steps: StepType[];
    forceOpen: boolean;
}

const Tour: React.FC< TourProps > = ( { appLocalizer, steps, forceOpen } ) => {
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const [ isNavigating, setIsNavigating ] = useState<boolean>( false );

    const waitForElement = ( selector: string ): Promise< Element > =>
        new Promise( ( resolve ) => {
            const checkElement = () => {
                const element = document.querySelector( selector );
                if ( element ) {
                    resolve( element );
                } else {
                    setTimeout( checkElement, 100 );
                }
            };
            if ( document.readyState === 'complete' ) {
                checkElement();
            } else {
                window.addEventListener( 'load', checkElement, { once: true } );
            }
        } );

    const navigateTo = async (
        url: string,
        step: number,
        selector?: string
    ) => {
        setIsNavigating( true );
        setIsOpen( false );
        window.open( url, '_self' );
        if ( selector ) {
            await waitForElement( selector );
        }

        setTimeout( () => {
            setCurrentStep( step );
            setIsOpen( true );
            setIsNavigating( false );
        }, 500 );
    };

    const finishTour = async () => {
        setIsOpen( false );
        try {
            await axios.post(
                getApiLink( appLocalizer, 'tour' ),
                { active: true },
                { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
            );
        } catch ( e ) {
            console.error( 'Error updating tour flag:', e );
        }
    };

    const processedSteps = useMemo( () => {
        return steps.map( ( step, index ) => {
            const isLastStep = index === steps.length - 1;
            
            return {
                ...step,
                content: () => {
                    const content = step.content( {
                        navigateTo,
                        finishTour,
                        appLocalizer,
                    } ) as TourContent;
                    
                    // Prepare buttons array based on step type
                    const buttons = [];
                    // Add End Tour button for all steps except last
                    if (!isLastStep) {
                        buttons.push({
                            text: 'End Tour',
                            color: 'red',
                            onClick: finishTour,
                        });
                    }
                    // Add Next button if not last step and has nextBtn
                    if (!isLastStep && content.nextBtn) {
                        buttons.push({
                            text: 'Next',
                            color: 'purple',
                            onClick: () => navigateTo(
                                content.nextBtn!.link,
                                content.nextBtn!.step
                            ),
                        });
                    }
                    
                    // Add Finish button for last step
                    if (isLastStep && content.finishBtn) {
                        buttons.push({
                            text:'Finish Tour',
                            color: 'purple',
                            onClick: finishTour,
                        });
                    }
                    
                    return (
                        <div className="tour-box">
                            <div className="title">{content.title}</div>
                            <div className="desc">{content.description}</div>
                            <AdminButtonUI buttons={buttons} />
                        </div>
                    );
                },
            };
        } );
    }, [ steps ] );

    useEffect( () => {
        if ( forceOpen ) {
            if ( 
                setSteps && 
                setIsOpen 
            ) {
                setSteps( processedSteps );
                setIsOpen( true );
            }
            return;
        }
        const fetchTourState = async () => {
            if ( window.location.href === `${appLocalizer.admin_dashboard_url}#&tab=dashboard` ) {
                try {
                    const response = await axios.get(
                        getApiLink( appLocalizer, 'tour' ),
                        { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                    );

                    if ( response.data.active === false ) {
                        if ( 
                            setSteps && 
                            setIsOpen 
                        ) {
                            setSteps( processedSteps );
                            setIsOpen( true );
                        }
                    }
                } catch ( error ) {
                    console.error( 'Error fetching tour flag:', error );
                }
            }
        };

        if ( ! isNavigating ) {
            fetchTourState();
        }
    }, [ isNavigating ] );

    return null;
};

export default Tour;