import React from 'react';

interface IntroProps {
    onNext: () => void;
}

const Intro: React.FC<IntroProps> = ({ onNext }) => {
    return (
        <section>
            <h2>Welcome to the CatalogX family!</h2>
            <p>
                Thank you for choosing CatalogX! This quick setup wizard will help you configure the basic settings and you will have your marketplace ready in no time. 
                <strong> It’s completely optional and shouldn’t take longer than five minutes.</strong>
            </p>
            <p>
                If you don't want to go through the wizard right now, you can skip and return to the WordPress dashboard. Come back anytime if you change your mind!
            </p>
            <button className='footer-btn next-btn' onClick={onNext}>Next</button>
        </section>
    );
};

export default Intro;
