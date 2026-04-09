// External dependencies
import React, { useEffect, useCallback } from 'react';
import axios from 'axios';
import { TourProvider, ProviderProps, StepType, useTour } from '@reactour/tour';

// Internal dependencies
import { getApiLink } from '../utils/apiService';
import { ButtonInputUI, ButtonConfig } from './ButtonInput';
import { ZyraVariable } from './fieldUtils';

interface GuidedTourStep extends StepType {
    title: string;
    description: string;
    next?: {
        link: string;
        step: number;
    };
    finish?: boolean;
}

interface GuidedTourProviderProps extends Omit<ProviderProps, 'steps'> {
    steps: GuidedTourStep[];
    storeId?: number;
}

const headers = { headers: { 'X-WP-Nonce': ZyraVariable.nonce } };

const TourApi = {
    fetchTourStatus: async (storeId?: number) => {
        const res = await axios.get(getApiLink(ZyraVariable, 'tour'),
            {
                ...headers,
                params: {
                    store_id: storeId ,
                },
            });
        return res.data;
    },

    updateTourStatus: async (completed: boolean, storeId?: number) => {
        try {
            await axios.post(
                getApiLink(ZyraVariable, 'tour'),
                {
                    completed,
                    store_id: storeId,
                },
                headers
            );
        } catch (e) {
            console.error('Error updating tour status:', e);
        }
    },
};

const STORAGE_KEY = 'guided_tour_step';

/**
 * Controller that runs the tour
 */
const GuidedTourController = ({ steps, storeId }: { steps: GuidedTourStep[]; storeId?: number; }) => {
    const { setIsOpen, setSteps, setCurrentStep } = useTour();

    const handleFinishTour = useCallback(async () => {
        setIsOpen(false);
        sessionStorage.removeItem(STORAGE_KEY);
        await TourApi.updateTourStatus(true, storeId);
    }, [setIsOpen]);

    const handleTourNavigation = useCallback(
        (url: string, step: number) => {
            const currentUrl = window.location.href;

            if (currentUrl === url) {
                // same page → just move to next selector
                setCurrentStep(step);
            } else {
                sessionStorage.setItem(STORAGE_KEY, String(step));
                window.location.href = url;
            }
        },
        [setCurrentStep]
    );

    useEffect(() => {
        const initializeTour = async () => {
            try {
                const data = await TourApi.fetchTourStatus(storeId);

                if (!data.completed) {
                    const savedStep = sessionStorage.getItem(STORAGE_KEY);
                    const startStep = savedStep ? parseInt(savedStep) : 0;

                    const processedSteps = steps.map((step, index) => {
                        const isLast = index === steps.length - 1;

                        return {
                            ...step,
                            content: () => {
                                const buttons: ButtonConfig[] = [];

                                if (!isLast) {
                                    buttons.push({
                                        text: 'End Tour',
                                        color: 'red',
                                        onClick: handleFinishTour,
                                    });
                                }

                                if (!isLast && step.next) {
                                    buttons.push({
                                        text: 'Next',
                                        color: 'purple',
                                        onClick: () =>
                                            handleTourNavigation(
                                                step.next!.link,
                                                step.next!.step
                                            ),
                                    });
                                }

                                if (isLast || step.finish) {
                                    buttons.push({
                                        text: 'Finish Tour',
                                        color: 'purple',
                                        onClick: handleFinishTour,
                                    });
                                }

                                return (
                                    <div className="tour-box">
                                        <div className="title">
                                            {step.title}
                                        </div>
                                        <div className="desc">
                                            {step.description}
                                        </div>
                                        <ButtonInputUI buttons={buttons} />
                                    </div>
                                );
                            },
                        };
                    });

                    setSteps(processedSteps);
                    setCurrentStep(startStep);
                    setIsOpen(true);
                }
            } catch (e) {
                console.error('Error loading tour:', e);
            }
        };

        initializeTour();
    }, [
        steps,
        setSteps,
        setIsOpen,
        setCurrentStep,
        handleTourNavigation,
        handleFinishTour,
    ]);

    return null;
};

/**
 * Provider wrapper
 */
const GuidedTourProvider: React.FC<GuidedTourProviderProps> = ({
    steps,
    storeId,
    ...rest
}) => {
    return (
        <TourProvider
            steps={[]}
            showNavigation={false}
            showPrevNextButtons={false}
            showDots={false}
            showBadge={false}
            className="tour-content"
            styles={{
                popover: (base) => ({
                    ...base,
                    padding: '1.125rem',
                    borderRadius: '0.313rem',
                }),
            }}
            onClickClose={({ setIsOpen }) => {
                setIsOpen(false);
                TourApi.updateTourStatus(true, storeId);
                sessionStorage.removeItem(STORAGE_KEY);
            }}
            onClickMask={({ setIsOpen }) => {
                setIsOpen(false);
                TourApi.updateTourStatus(true, storeId);
                sessionStorage.removeItem(STORAGE_KEY);
            }}
            {...rest}
        >
            <GuidedTourController steps={steps} storeId={storeId} />
        </TourProvider>
    );
};

export default GuidedTourProvider;
