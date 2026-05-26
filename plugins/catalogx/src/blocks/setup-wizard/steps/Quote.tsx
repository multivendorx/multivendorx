import React, { useState } from 'react';
import { getApiLink } from 'zyra';
import axios from 'axios';

const Quote = ( props: any ) => {
    const { onFinish, onPrev } = props;
    const [ restrictUserQuote, setRestrictUserQuote ] = useState< string[] >(
        []
    );

    const handleRestrictUserQuoteChange = (
        event: React.ChangeEvent< HTMLInputElement >
    ) => {
        const { checked, name } = event.target;
        setRestrictUserQuote( ( prevState ) =>
            checked
                ? [ ...prevState, name ]
                : prevState.filter( ( value ) => value !== name )
        );
    };

    const saveQuoteSettings = () => {
        const data = {
            action: 'quote',
            restrictUserQuote,
        };

        axios( {
            method: 'post',
            url: getApiLink( appLocalizer, 'settings' ),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data,
        } ).then( () => {
            onFinish();
        } );
    };

    return (
        <section>
            <h2>Quote</h2>
            <article className="module-wrapper">
                <div className="module-items">
                    <div className="module-details">
                        <h3>Restrict for logged-in user</h3>
                        <p className="module-description">
                            If enabled, non-logged-in users cannot submit
                            quotation requests.
                        </p>
                    </div>
                    <div className="toggle-checkbox">
                        <input
                            type="checkbox"
                            id="logged-out"
                            name="logged_out"
                            checked={ restrictUserQuote.includes(
                                'logged_out'
                            ) }
                            onChange={ handleRestrictUserQuoteChange }
                        />
                        { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                        <label htmlFor="logged-out"></label>
                    </div>
                </div>
            </article>

            <footer className="setup-footer-btn-wrapper">
                <div>
                    <button className="footer-btn pre-btn" onClick={ onPrev }>
                        Prev
                    </button>
                    <button className="footer-btn" onClick={ onFinish }>
                        Skip
                    </button>
                </div>
                <button
                    className="footer-btn next-btn"
                    onClick={ saveQuoteSettings }
                >
                    Finish
                </button>
            </footer>
        </section>
    );
};

export default Quote;
