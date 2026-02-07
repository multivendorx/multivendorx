import React, { useState, useEffect, useRef } from 'react';

interface InputWithSuggestionsProps {
    suggestions: string[];
    value?: string[];
    onChange?: ( list: string[] ) => void;
    placeholder?: string;
    addButtonLabel?: string;
}

const InputWithSuggestions: React.FC< InputWithSuggestionsProps > = ( {
    suggestions = [],
    value = [],
    onChange,
    placeholder = 'Type something...',
    addButtonLabel = 'Add',
} ) => {
    const [ inputValue, setInputValue ] = useState( '' );
    const [ items, setItems ] = useState< string[] >( value );
    const wrapperRef = useRef< HTMLDivElement >( null );

    // Sync internal list with parent value
    useEffect( () => {
        setItems( value );
    }, [ value ] );

     const filteredSuggestions =
        inputValue.trim() === ''
            ? []
            : suggestions.filter(
                  (suggestion) =>
                      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
                      !items.includes(suggestion)
              );

    useEffect( () => {
        const handleClickOutside = ( e: MouseEvent ) => {
            if (
                wrapperRef.current &&
                ! wrapperRef.current.contains( e.target as Node )
            ) {
                [] ;
            }
        };
        document.addEventListener( 'mousedown', handleClickOutside );
        return () =>
            document.removeEventListener( 'mousedown', handleClickOutside );
    }, [] );

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if ( ! trimmed || items.includes( trimmed ) ) {
            return;
        } // prevent duplicates
        const newList = [ ...items, trimmed ];
        setItems( newList );
        setInputValue( '' );
        if ( onChange ) {
            onChange( newList );
        }
    };

    const handleSelectSuggestion = ( suggestion: string ) => {
        if ( ! items.includes( suggestion ) ) {
            const newList = [ ...items, suggestion ];
            setItems( newList );
            if ( onChange ) {
                onChange( newList );
            }
        }
        setInputValue( '' );
    };

    const handleRemove = ( item: string ) => {
        const newList = items.filter( ( i ) => i !== item );
        setItems( newList );
        if ( onChange ) {
            onChange( newList );
        }
    };

    return (
        <div className="input-with-suggestions-wrapper" ref={ wrapperRef }>
            <div className="input-row">
                <input
                    type="text"
                    value={ inputValue }
                    placeholder={ placeholder }
                    onChange={ ( e ) => setInputValue( e.target.value ) }
                />
                <button type="button" onClick={ handleAdd }>
                    { addButtonLabel }
                </button>
            </div>

            { /* Suggestions dropdown */ }
            { filteredSuggestions.length > 0 && (
                <ul className="suggestions-list">
                    { filteredSuggestions.map( ( suggestion ) => (
                        <li
                            key={ suggestion }
                            onClick={ () => handleSelectSuggestion( suggestion ) }
                        >
                            { suggestion }
                        </li>
                    ) ) }
                </ul>
            ) }

            { /* Added items list */ }
            <div className="added-list">
                { items.map( ( item ) => (
                    <span key={ item } className="added-item">
                        { item }
                        <span
                            className="remove-item"
                            onClick={ () => handleRemove( item ) }
                        >
                            ×
                        </span>
                    </span>
                ) ) }
            </div>
        </div>
    );
};

export default InputWithSuggestions;
