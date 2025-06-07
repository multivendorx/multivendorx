/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from "react";

/**
 * Internal dependencies
 */
import "../styles/web/ButtonCustomizer.scss";

// Types
interface ButtonCustomizerProps {
    onChange: ( key: string, value: any, isRestoreDefaults?: boolean ) => void;
    setting?: Record< string, any >;
    className?: string;
    text: string;
    proSetting?: any;
}

interface CustomizerProps {
    onChange: ( key: string, value: any, isRestoreDefaults?: boolean ) => void;
    setting: Record< string, any >;
    setHoverOn: ( hover: boolean ) => void;
}

const Customizer: React.FC< CustomizerProps > = ( {
    onChange,
    setting,
    setHoverOn,
} ) => {
    const [ select, setSelect ] = useState< string >( "" );
    const [ buttonLink, setButtonLink ] = useState< string >(
        setting.button_link || ""
    );

    useEffect( () => {
        setButtonLink( setting.button_link || "" );
    }, [ setting.button_link ] );

    return (
        <>
            { /* Heading section */ }
            <div className="btn-customizer-menu">
                { [
                    {
                        title: "Change Colors",
                        iconClass: "color-img",
                        type: "color",
                    },
                    {
                        title: "Border Style",
                        iconClass: "adminLib-crop-free",
                        type: "border",
                    },
                    {
                        title: "Text Style",
                        iconClass: "adminLib-text-fields",
                        type: "font",
                    },
                    {
                        title: "Change Size",
                        iconClass: "adminLib-resize",
                        type: "size",
                    },
                    {
                        title: "Add Url",
                        iconClass: "adminLib-link",
                        type: "link",
                    },
                    {
                        title: "Settings",
                        iconClass: "adminLib-setting",
                        type: "setting",
                    },
                ].map( ( { title, iconClass, type } ) => (
                    <div
                        key={ type }
                        title={ title }
                        className="btn-customizer-menu-items"
                        onClick={ () => setSelect( type ) }
                    >
                        <i className={ `admin-font ${ iconClass }` }></i>
                    </div>
                ) ) }
            </div>

            { select && (
                <div className="customizer-setting-wrapper">
                    { /* Wrapper close button */ }
                    <button
                        onClick={ () => setSelect( "" ) }
                        className="wrapper-close"
                    >
                        <i className="admin-font adminLib-cross"></i>
                    </button>

                    { /* Render selected setting */ }
                    { select === "color" && (
                        <div className="section-wrapper color">
                            <div className="simple">
                                { [
                                    {
                                        label: "Background Color",
                                        key: "button_background_color",
                                    },
                                    {
                                        label: "Font Color",
                                        key: "button_text_color",
                                    },
                                ].map( ( { label, key } ) => (
                                    <div key={ key } className="section">
                                        <span className="label">{ label }</span>
                                        <div className="property-section">
                                            <input
                                                type="color"
                                                value={
                                                    setting[ key ] || "#000000"
                                                }
                                                onChange={ ( e ) =>
                                                    onChange(
                                                        key,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="text"
                                                value={
                                                    setting[ key ] || "#000000"
                                                }
                                                onChange={ ( e ) =>
                                                    onChange(
                                                        key,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                ) ) }
                            </div>

                            <div
                                className="hover"
                                onMouseEnter={ () => setHoverOn( true ) }
                                onMouseLeave={ () => setHoverOn( false ) }
                            >
                                { [
                                    {
                                        label: "Background Color On Hover",
                                        key: "button_background_color_onhover",
                                    },
                                    {
                                        label: "Font Color On Hover",
                                        key: "button_text_color_onhover",
                                    },
                                ].map( ( { label, key } ) => (
                                    <div key={ key } className="section">
                                        <span className="label">{ label }</span>
                                        <div className="property-section">
                                            <input
                                                type="color"
                                                value={
                                                    setting[ key ] || "#000000"
                                                }
                                                onChange={ ( e ) =>
                                                    onChange(
                                                        key,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="text"
                                                value={
                                                    setting[ key ] || "#000000"
                                                }
                                                onChange={ ( e ) =>
                                                    onChange(
                                                        key,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </div>
                    ) }

                    { select === "link" && (
                        <div className="section-wrapper link">
                            <div className="simple">
                                <div className="link-box">
                                    <input
                                        className="link-input"
                                        type="text"
                                        value={ buttonLink }
                                        onChange={ ( e ) =>
                                            setButtonLink( e.target.value )
                                        }
                                        placeholder="Paste your URL/link"
                                    />
                                    <button
                                        onClick={ ( e ) => {
                                            e.preventDefault();
                                            onChange(
                                                "button_link",
                                                buttonLink
                                            );
                                        } }
                                    >
                                        <i className="admin-font adminLib-send"></i>
                                    </button>
                                </div>
                            </div>
                            <p>
                                <span>*</span> Keep it blank for default button
                                behavior
                            </p>
                        </div>
                    ) }

                    { select === "setting" && (
                        <div className="section-wrapper settings">
                            <div className="section">
                                <span className="label">
                                    { "System settings" }
                                </span>
                                <div className="property-section">
                                    <button
                                        onClick={ ( e ) => {
                                            e.preventDefault();
                                            onChange( "", {}, true );
                                        } }
                                    >
                                        Restore default
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) }
                </div>
            ) }
        </>
    );
};

const ButtonCustomizer: React.FC< ButtonCustomizerProps > = ( {
    onChange,
    setting = {},
    className,
    text,
} ) => {
    const [ hoverOn, setHoverOn ] = useState( false );
    const [ buttonHoverOn, setButtonHoverOn ] = useState( false );
    const buttonRef = useRef< HTMLDivElement | null >( null );

    // Set button styles based on hover state
    const style: React.CSSProperties = {
        border: "1px solid transparent",
        backgroundColor: buttonHoverOn
            ? setting.button_background_color_onhover
            : setting.button_background_color,
        color: buttonHoverOn
            ? setting.button_text_color_onhover
            : setting.button_text_color,
        borderColor: buttonHoverOn
            ? setting.button_border_color_onhover
            : setting.button_border_color,
        borderRadius: setting.button_border_radious
            ? `${ setting.button_border_radious }px`
            : "0px",
        borderWidth: setting.button_border_size
            ? `${ setting.button_border_size }px`
            : "0px",
        fontSize: setting.button_font_size,
        fontWeight: setting.button_font_width,
        padding: setting.button_padding
            ? `${ setting.button_padding }px`
            : "0px",
        margin: setting.button_margin ? `${ setting.button_margin }px` : "0px",
    };

    useEffect( () => {
        const handleClickOutside = ( event: MouseEvent ) => {
            if ( ! buttonRef.current?.contains( event.target as Node ) ) {
                setHoverOn( false );
            }
        };

        document.body.addEventListener( "click", handleClickOutside );
        return () => {
            document.body.removeEventListener( "click", handleClickOutside );
        };
    }, [] );

    return (
        <div
            ref={ buttonRef }
            className={ `${ className ? `${ className } ` : "" }btn-wrapper` }
        >
            <button
                onClick={ ( e ) => {
                    e.preventDefault();
                    setHoverOn( ! hoverOn );
                } }
                className={ `btn-preview ${ hoverOn ? "active" : "" }` }
                style={ style }
                onMouseEnter={ () => setButtonHoverOn( true ) }
                onMouseLeave={ () => setButtonHoverOn( false ) }
            >
                { text }
            </button>

            { hoverOn && (
                <div className="btn-customizer">
                    <Customizer
                        onChange={ onChange }
                        setHoverOn={ setButtonHoverOn }
                        setting={ setting }
                    />
                </div>
            ) }
        </div>
    );
};

export default ButtonCustomizer;
