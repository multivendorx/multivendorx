/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";

// Types
interface Option {
    label: string;
    value: string;
    isdefault?: boolean;
}

interface OptionMetaBoxProps {
    option: Option;
    onChange: ( key: keyof Option, value: string ) => void;
    setDefaultValue: () => void;
    hasOpen: boolean;
}

const OptionMetaBox: React.FC< OptionMetaBoxProps > = ( {
    option,
    onChange,
    setDefaultValue,
    hasOpen,
} ) => {
    const [ hasOpened, setHasOpened ] = useState( hasOpen );
    const modalRef = useRef< HTMLDivElement >( null ); // Use HTMLDivElement instead of HTMLElement

    useEffect( () => {
        setHasOpened( hasOpen );
    }, [ hasOpen ] );

    return (
        <div
            role="button"
            tabIndex={ 0 }
            onClick={ ( event ) => {
                setHasOpened( true );
                event.stopPropagation();
            } }
        >
            <i className="admin-font adminLib-menu"></i>
            { hasOpened && (
                <Draggable
                    nodeRef={
                        modalRef as unknown as React.RefObject< HTMLElement >
                    }
                >
                    <div ref={ modalRef } className="meta-setting-modal">
                        { " " }
                        { /* Change from <section> to <div> */ }
                        { /* Close button */ }
                        <button
                            className="meta-setting-modal-button"
                            onClick={ ( event ) => {
                                event.stopPropagation();
                                setHasOpened( false );
                            } }
                        >
                            <i className="admin-font adminLib-cross"></i>
                        </button>
                        { /* Main content */ }
                        <main className="meta-setting-modal-content">
                            <h3>Input Field Settings</h3>

                            <div className="setting-modal-content-section">
                                <article className="modal-content-section-field">
                                    <p>Value</p>
                                    <input
                                        type="text"
                                        value={ option.value }
                                        onChange={ ( e ) =>
                                            onChange( "value", e.target.value )
                                        }
                                    />
                                </article>

                                <article className="modal-content-section-field">
                                    <p>Label</p>
                                    <input
                                        type="text"
                                        value={ option.label }
                                        onChange={ ( e ) =>
                                            onChange( "label", e.target.value )
                                        }
                                    />
                                </article>
                            </div>
                            <div className="setting-modal-content-section">
                                <article className="modal-content-section-field">
                                    <p>Set default</p>
                                    <input
                                        type="checkbox"
                                        checked={ option.isdefault || false }
                                        onChange={ () => setDefaultValue() }
                                    />
                                </article>
                            </div>
                        </main>
                    </div>
                </Draggable>
            ) }
        </div>
    );
};

export default OptionMetaBox;
