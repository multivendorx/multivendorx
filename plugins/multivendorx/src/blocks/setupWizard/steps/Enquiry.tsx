import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import Loading from './Loading';
import { getApiLink } from 'zyra';

interface EnquiryProps {
    onNext: () => void;
    onPrev: () => void;
}

const Enquiry: React.FC<EnquiryProps> = ({ onNext, onPrev }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [displayOption, setDisplayOption] = useState<'popup' | 'inline'>('popup');
    const [restrictUserEnquiry, setRestrictUserEnquiry] = useState<string[]>([]);

    const handleRestrictUserEnquiryChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { checked, name } = event.target;
        setRestrictUserEnquiry(prevState =>
            checked ? [...prevState, name] : prevState.filter(value => value !== name)
        );
    };

    const saveEnquirySettings = () => {
        setLoading(true);
        const data = {
            action: 'enquiry',
            displayOption: displayOption,
            restrictUserEnquiry: restrictUserEnquiry
        };

        axios.post(
            getApiLink('settings'),
            data,
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
            <h2>Enquiry</h2>
            <article className='module-wrapper'>
                <div className='module-items'>
                    <div className="module-details">
                        <h3>Display Enquiry Form:</h3>
                        <p className='module-description'>
                            Select whether the form is displayed directly on the page or in a pop-up window.
                        </p>
                    </div>
                    <ul>
                        <li>
                            <input
                                className="toggle-setting-form-input"
                                type="radio"
                                id="popup"
                                name="approve_vendor"
                                value="popup"
                                checked={displayOption === 'popup'}
                                onChange={() => setDisplayOption('popup')}
                            />
                            <label htmlFor="popup">Popup</label>
                        </li>
                        <li>
                            <input
                                className="toggle-setting-form-input"
                                type="radio"
                                id="inline"
                                name="approve_vendor"
                                value="inline"
                                checked={displayOption === 'inline'}
                                onChange={() => setDisplayOption('inline')}
                            />
                            <label htmlFor="inline">Inline In-page</label>
                        </li>
                    </ul>
                </div>
            </article>

            <article className='module-wrapper'>
                <div className="module-items">
                    <div className="module-details">
                        <h3>Restrict for logged-in user</h3>
                        <p className='module-description'>
                            If enabled, non-logged-in users can't access the enquiry flow.
                        </p>
                    </div>
                    <div className='toggle-checkbox'>
                        <input
                            type="checkbox"
                            id="enquiry_logged_out"
                            name="enquiry_logged_out"
                            checked={restrictUserEnquiry.includes('enquiry_logged_out')}
                            onChange={handleRestrictUserEnquiryChange}
                        />
                        <label htmlFor='enquiry_logged_out'></label>
                    </div>
                </div>
            </article>

            <footer className='setup-footer-btn-wrapper'>
                <div>
                    <button className='footer-btn pre-btn' onClick={onPrev}>Prev</button>
                    <button className='footer-btn' onClick={onNext}>Skip</button>
                </div>
                <button className='footer-btn next-btn' onClick={saveEnquirySettings}>Next</button>
            </footer>
            {loading && <Loading />}
        </section>
    );
};

export default Enquiry;
