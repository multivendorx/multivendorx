import React, { useState } from 'react';
import { __ } from "@wordpress/i18n";
import Intro from './steps/Intro';
import Modules from './steps/Module';
import Enquiry from './steps/Enquiry';
import Quote from './steps/Quote';
import './SetupWizard.scss';
// import Logo from '../../assets/images/Brand.png';

interface Step {
    component: React.ReactNode;
    title: string;
}

const SetupWizard: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<number>(0);

    const onPrev = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const onNext = () => {
        setCurrentStep(prev => prev + 1);
    };

    const onFinish = () => {
        window.location.href = (window as any).appLocalizer?.redirect_url;
    };

    const steps: Step[] = [
        { component: <Intro onNext={onNext} />, title: 'Intro' },
        { component: <Modules onPrev={onPrev} onNext={onNext} />, title: 'Modules' },
        { component: <Enquiry onPrev={onPrev} onNext={onNext} />, title: 'Enquiry' },
        { component: <Quote onPrev={onPrev} onFinish={onFinish} />, title: 'Quote' },
    ];

    return (
        <main className='catalogx-setup-wizard-main-wrapper'>
            {/* <img src={Logo} alt="Logo" /> */}
            <nav className='step-count'>
                <ul>
                    {steps.map((step, index) => (
                        <li key={index} className={currentStep >= index ? 'active' : ''}>
                            {step.title}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className='setup-container'>
                {steps[currentStep].component}
            </div>
        </main>
    );
};

export default SetupWizard;
