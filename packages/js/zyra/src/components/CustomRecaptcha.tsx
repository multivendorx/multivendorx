import { useState, useEffect } from 'react';

const CustomRecaptcha = ( props: any ) => {
    const { captchaValid, submitted, field } = props;
    const [ securityCode, setSecurityCode ] = useState( '' );
    const [ userInput, setUserInput ] = useState( '' );
    const [ isCaptchaValid, setIsCaptchaValid ] = useState( true );

    useEffect( () => {
        // Generate a cryptographically secure random 6-digit code without modulo bias
        const generateCode = () => {
            const range = 900000; // 100000..999999 inclusive
            const maxUnbiased = Math.floor( 0x100000000 / range ) * range;
            let randomValue = 0;

            do {
                randomValue = window.crypto.getRandomValues( new Uint32Array( 1 ) )[ 0 ];
            } while ( randomValue >= maxUnbiased );

            return ( 100000 + ( randomValue % range ) ).toString();
        };

        setSecurityCode( generateCode() );
    }, [] );

    const captchCheck = ( e: React.ChangeEvent< HTMLInputElement > ) => {
        e.preventDefault();
        const value = e.target.value;
        setUserInput( value );

        // Check if the input matches the generated security code
        const isValid = value === securityCode;
        setIsCaptchaValid( isValid );
        captchaValid( isValid );
    };

    return (
        <>
            <input
                type="text"
                id="securityCode"
                className="basic-input"
                name="securityCode"
                onChange={ captchCheck }
                value={ userInput }
                placeholder={field.placeholder}
            />
            <p>
                { 'Your security code is:' } { securityCode }
            </p>

            { ! isCaptchaValid && (
                <p style={ { color: 'red' } }>
                    { 'Invalid security code, please try again.' }
                </p>
            ) }
            { submitted && ! userInput && (
                <p style={ { color: 'red' } }>
                    { 'Recaptcha is required.' }
                </p>
            ) }
        </>
    );
};

export default CustomRecaptcha;
