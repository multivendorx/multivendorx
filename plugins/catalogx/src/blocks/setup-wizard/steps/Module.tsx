import React, { useState } from 'react';
import { getApiLink } from 'zyra';
import axios from 'axios';
import Loading from './Loading';

type ModuleKey = 'catalog' | 'enquiry' | 'quote' | 'wholesale';

const Modules = ( props: any ) => {
    const { onNext, onPrev } = props;
    const [ loading, setLoading ] = useState( false );
    const [ selectedModules, setSelectedModules ] = useState<
        Record< ModuleKey, boolean >
    >( {
        catalog: false,
        enquiry: false,
        quote: false,
        wholesale: false,
    } );

    const handleCheckboxChange = (
        event: React.ChangeEvent< HTMLInputElement >
    ) => {
        const { name, checked } = event.target;
        setSelectedModules( ( prevState ) => ( {
            ...prevState,
            [ name ]: checked,
        } ) );
    };

    const moduleSave = () => {
        setLoading( true );
        const modulesToSave = (
            Object.keys( selectedModules ) as ModuleKey[]
         ).filter( ( key ) => selectedModules[ key ] );
        axios( {
            method: 'post',
            url: getApiLink( appLocalizer, 'modules' ),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: { modules: modulesToSave },
        } ).then( () => {
            setLoading( false );
            onNext();
        } );
    };

    return (
        <section>
            <h2>Modules</h2>
            <article className="module-wrapper">
                <div className="module-items">
                    <div className="module-details">
                        <h3>Enquiry </h3>
                        <p className="module-description">
                            Add a button for customers to submit inquiries,
                            sending their details and message to the admin for a
                            response.
                        </p>
                    </div>
                    <div className="toggle-checkbox">
                        <input
                            type="checkbox"
                            id="enquiry"
                            name="enquiry"
                            checked={ selectedModules.enquiry }
                            onChange={ handleCheckboxChange }
                        />
                        { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                        <label htmlFor="enquiry"></label>
                    </div>
                </div>

                <div className="module-items">
                    <div className="module-details">
                        <h3>Quote</h3>
                        <p className="module-description">
                            Include a quotation button for customers to request
                            personalized product quotes via email.
                        </p>
                    </div>
                    <div className="toggle-checkbox">
                        <input
                            type="checkbox"
                            id="quote"
                            name="quote"
                            checked={ selectedModules.quote }
                            onChange={ handleCheckboxChange }
                        />
                        { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                        <label htmlFor="quote"></label>
                    </div>
                </div>
            </article>
            <footer className="setup-footer-btn-wrapper">
                <div>
                    <button className="footer-btn pre-btn" onClick={ onPrev }>
                        Prev
                    </button>
                    <button className="footer-btn " onClick={ onNext }>
                        Skip
                    </button>
                </div>
                <button className="footer-btn next-btn" onClick={ moduleSave }>
                    Next
                </button>
            </footer>
            { loading && <Loading /> }
        </section>
    );
};

export default Modules;
