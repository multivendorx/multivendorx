import React, { useState } from 'react';
import Intro from './steps/Intro';
import Modules from './steps/Module';
import Enquiry from './steps/Enquiry';
import Quote from './steps/Quote';
import './SetupWizard.scss';
import Logo from '../../assets/images/Brand.png';

const SetupWizard = () => {
    const [ currentStep, setCurrentStep ] = useState( 0 );
    const onPrev = () => {
        setCurrentStep( Math.max( 0, currentStep - 1 ) );
    };

    const onNext = () => {
        setCurrentStep( currentStep + 1 );
    };

    const onFinish = () => {
        window.location.href = appLocalizer.redirect_url;
    };

    const steps = [
        { component: <Intro onNext={ onNext } />, title: 'Intro' },
        {
            component: <Modules onPrev={ onPrev } onNext={ onNext } />,
            title: 'Modules',
        },
        {
            component: <Enquiry onPrev={ onPrev } onNext={ onNext } />,
            title: 'Enquiry',
        },
        {
            component: <Quote onPrev={ onPrev } onFinish={ onFinish } />,
            title: 'Quote',
        },
    ];

    return (
        <>
            <main className="catalogx-setup-wizard-main-wrapper">
                <img src={ Logo } alt="Logo" />
                <nav className="step-count">
                    <ul>
                        { steps.map( ( step, index ) => {
                            return (
                                <li
                                    key={ index }
                                    className={
                                        currentStep >= index ? 'active' : ''
                                    }
                                >
                                    { step.title }
                                </li>
                            );
                        } ) }
                    </ul>
                </nav>
                <main className="setup-container">
                    { steps[ currentStep ].component }
                </main>
            </main>
        </>
    );
};
export default SetupWizard;
