// External dependencies
import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';

// Internal dependencies
import '../styles/web/EmailsInput.scss';

export interface EmailsInputProps {
    mode?: 'single' | 'multiple';
    max?: number;
    value?: string[];
    primary?: string | null;
    enablePrimary?: boolean;
    placeholder?: string;
    onChange?: ( emails: string[], primary: string | null ) => void;
}

const EmailsInput = forwardRef< HTMLInputElement, EmailsInputProps >(
    (
        {
            mode = 'multiple',
            max,
            value = [],
            primary = null,
            enablePrimary = true,
            placeholder = 'Enter email...',
            onChange,
        },
        ref
    ) => {
        const [ emails, setEmails ] = useState< string[] >( value );
        const [ primaryEmail, setPrimaryEmail ] = useState< string | null >(
            enablePrimary ? primary : null
        );

        const [ inputValue, setInputValue ] = useState( '' );

        const inputRef = useRef< HTMLInputElement >( null );

        // Sync when parent updates props
        useEffect( () => {
            setEmails( value );
        }, [ value ] );

        useEffect( () => {
            setPrimaryEmail( enablePrimary ? primary : null );
        }, [ primary, enablePrimary ] );

        // expose inputRef externally
        useImperativeHandle( ref, () => inputRef.current as HTMLInputElement );

        const isValidEmail = useCallback(( email: string ) =>
            /^\S+@\S+\.\S+$/.test( email ),[]);

        const addEmail = useCallback(
            ( email: string ) => {
            email = email.trim();
            if ( 
                ! email || 
                ! isValidEmail( email ) || 
                emails.includes( email ) || 
                ( max && emails.length >= max )
            ) {
                return;
            }

            const updated = [ ...emails, email ];
            setEmails( updated );

            const newPrimary = enablePrimary ? primaryEmail || email : null;
            if ( enablePrimary && ! primaryEmail ) {
                setPrimaryEmail( email );
            }

            setInputValue( '' );
            onChange?.( updated, newPrimary );
        });

        const removeEmail = ( email: string ) => {
            const updated = emails.filter( ( e ) => e !== email );

            let newPrimary = primaryEmail;
            if ( enablePrimary && primaryEmail === email ) {
                newPrimary = updated[ 0 ] || null;
                setPrimaryEmail( newPrimary );
            }

            setEmails( updated );
            onChange?.( updated, enablePrimary ? newPrimary : null );
        };

        const togglePrimary = ( email: string ) => {
            if ( ! enablePrimary || mode === 'single' ) {
                return;
            }
            setPrimaryEmail( email );
            onChange?.( emails, email );
        };

        const handleKeyDown = (
            e: React.KeyboardEvent< HTMLInputElement >
        ) => {
            if ( [ 'Enter', ',', ' ' ].includes( e.key ) ) {
                e.preventDefault();
                addEmail( inputValue );
            }
        };

        // SINGLE MODE
        if ( mode === 'single' ) {
            return (
                <input
                    type="email"
                    value={ emails[ 0 ] || '' }
                    placeholder={ placeholder }
                    onChange={ ( e ) => {
                        const v = e.target.value.trim();
                        const updated = isValidEmail( v ) ? [ v ] : [];
                        setEmails( updated );
                        onChange?.( updated, null );
                    } }
                />
            );
        }

        // MULTI MODE
        return (
            <div
                className="emails-section"
                onClick={ () => inputRef.current?.focus() }
            >
                { emails.map( ( email ) => (
                    <div
                        className={ `email ${
                            enablePrimary && primaryEmail === email
                                ? 'primary'
                                : ''
                        }` }
                        key={ email }
                    >
                        { enablePrimary && (
                            <i
                                className={ `stat-icon adminfont-star${
                                    primaryEmail === email ? ' primary' : '-o'
                                }` }
                                onClick={ ( e ) => {
                                    e.stopPropagation();
                                    togglePrimary( email );
                                } }
                            ></i>
                        ) }
                        <span>{ email }</span>
                        <i
                            className="adminfont-close close-icon"
                            onClick={ ( e ) => {
                                e.stopPropagation();
                                removeEmail( email );
                            } }
                        ></i>
                    </div>
                ) ) }

                <div className="input-wrapper">
                    <input
                        ref={ inputRef }
                        type="text"
                        value={ inputValue }
                        onChange={ ( e ) => setInputValue( e.target.value ) }
                        onKeyDown={ handleKeyDown }
                        placeholder={ emails.length === 0 ? placeholder : '' }
                    />

                    { /* MAGIC INLINE SUGGESTION */ }
                    { inputValue &&
                        ! inputValue.endsWith( ' ' ) &&
                        ! inputValue.endsWith( ',' ) &&
                        isValidEmail( inputValue ) &&
                        ! emails.includes( inputValue.trim() ) && (
                            <div
                                className="inline-suggestion"
                                onClick={ () => addEmail( inputValue.trim() ) }
                            >
                                <i className="adminfont-mail orange"></i>{ ' ' }
                                { inputValue.trim() }
                            </div>
                        ) }
                </div>
            </div>
        );
    }
);

export default EmailsInput;
