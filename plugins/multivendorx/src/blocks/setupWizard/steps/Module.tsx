import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import Loading from './Loading';
import { getApiLink } from 'zyra';

interface ModulesProps {
    onNext: () => void;
    onPrev: () => void;
}

interface SelectedModules {
    catalog: boolean;
    enquiry: boolean;
    quote: boolean;
    wholesale: boolean;
}

const Modules: React.FC<ModulesProps> = ({ onNext, onPrev }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedModules, setSelectedModules] = useState<SelectedModules>({
        catalog: false,
        enquiry: false,
        quote: false,
        wholesale: false
    });

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setSelectedModules(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };

    const moduleSave = () => {
        setLoading(true);
        const modulesToSave = Object.keys(selectedModules).filter(
            key => selectedModules[key as keyof SelectedModules]
        );
        
        axios.post(
            getApiLink('modules'),
            { modules: modulesToSave },
            { headers: { "X-WP-Nonce": (window as any).appLocalizer?.nonce } }
        ).then(() => {
            setLoading(false);
            onNext();
        }).catch(() => {
            setLoading(false);
        });
    };

    return (
        <section>
            <h2>Modules</h2>
            <article className='module-wrapper'>
                <div className="module-items">
                    <div className="module-details">
                        <h3>Enquiry</h3>
                        <p className='module-description'>
                            Add a button for customers to submit inquiries, sending their details and message to the admin for a response.
                        </p>
                    </div>
                    <div className='toggle-checkbox'>
                        <input
                            type="checkbox"
                            id="enquiry"
                            name="enquiry"
                            checked={selectedModules.enquiry}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="enquiry"></label>
                    </div>
                </div>

                <div className="module-items">
                    <div className="module-details">
                        <h3>Quote</h3>
                        <p className='module-description'>
                            Include a quotation button for customers to request personalized product quotes via email.
                        </p>
                    </div>
                    <div className='toggle-checkbox'>
                        <input
                            type="checkbox"
                            id="quote"
                            name="quote"
                            checked={selectedModules.quote}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="quote"></label>
                    </div>
                </div>
            </article>

            <footer className='setup-footer-btn-wrapper'>
                <div>
                    <button className='footer-btn pre-btn' onClick={onPrev}>Prev</button>
                    <button className='footer-btn' onClick={onNext}>Skip</button>
                </div>
                <button className='footer-btn next-btn' onClick={moduleSave}>Next</button>
            </footer>

            {loading && <Loading />}
        </section>
    );
};

export default Modules;
