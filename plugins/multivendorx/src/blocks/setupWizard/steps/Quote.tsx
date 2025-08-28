import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import Loading from './Loading';
import { getApiLink } from 'zyra';

interface QuoteProps {
    onFinish: () => void;
    onPrev: () => void;
}

const Quote: React.FC<QuoteProps> = ({ onFinish, onPrev }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [restrictUserQuote, setRestrictUserQuote] = useState<string[]>([]);

    const handleRestrictUserQuoteChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { checked, name } = event.target;
        setRestrictUserQuote((prevState) =>
            checked ? [...prevState, name] : prevState.filter(value => value !== name)
        );
    };

    const saveQuoteSettings = () => {
        setLoading(true);
        const data = {
            action: 'quote',
            restrictUserQuote: restrictUserQuote
        };

        axios.post(
            getApiLink('settings'),
            data,
            { headers: { "X-WP-Nonce": (window as any).appLocalizer?.nonce } }
        ).then(() => {
            setLoading(false);
            onFinish();
        }).catch(() => {
            setLoading(false);
        });
    };

    return (
        <section>
            <h2>Quote</h2>
            <article className='module-wrapper'>
                <div className="module-items">
                    <div className="module-details">
                        <h3>Restrict for logged-in user</h3>
                        <p className='module-description'>
                            If enabled, non-logged-in users cannot submit quotation requests.
                        </p>
                    </div>
                    <div className='toggle-checkbox'>
                        <input
                            type="checkbox"
                            id="logged_out"
                            name="logged_out"
                            checked={restrictUserQuote.includes('logged_out')}
                            onChange={handleRestrictUserQuoteChange}
                        />
                        <label htmlFor='logged_out'></label>
                    </div>
                </div>
            </article>

            <footer className='setup-footer-btn-wrapper'>
                <div>
                    <button className='footer-btn pre-btn' onClick={onPrev}>Prev</button>
                    <button className='footer-btn' onClick={onFinish}>Skip</button>
                </div>
                <button className='footer-btn next-btn' onClick={saveQuoteSettings}>Finish</button>
            </footer>

            {loading && <Loading />}
        </section>
    );
};

export default Quote;
