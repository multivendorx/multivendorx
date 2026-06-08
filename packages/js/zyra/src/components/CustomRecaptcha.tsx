import { useState, useEffect } from 'react';

const CustomRecaptcha = ( props: any ) => {
    console.log('hitttt')
    const { captchaValid } = props;
    const [ securityCode, setSecurityCode ] = useState( '' );
    const [ userInput, setUserInput ] = useState( '' );
    const [ isCaptchaValid, setIsCaptchaValid ] = useState( true );

    useEffect( () => {
        // Generate a random 6-digit code
        const generateCode = () => {
            return Math.floor( 100000 + Math.random() * 900000 ).toString();
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
                placeholder="Enter security code"
            />
            <p>
                { 'Your security code is:' } { securityCode }
            </p>

            { ! isCaptchaValid && (
                <p style={ { color: 'red' } }>
                    { 'Invalid security code, please try again.' }
                </p>
            ) }
            { isCaptchaValid && ! userInput && (
                <p style={ { color: 'red' } }>
                    { 'Recaptcha is required.' }
                </p>
            ) }
        </>
    );
};

export default CustomRecaptcha;
