/**
 * External dependencies
 */
import React, { useState } from 'react';

// Types
interface DisplayButtonProp {
    customStyle?: {
        button_border_size?: number;
        button_border_color?: string;
        button_background_color?: string;
        button_text_color?: string;
        button_border_radious?: number;
        button_font_size?: number;
        button_font_width?: number;
        button_margin?: number;
        button_padding?: number;
        button_border_color_onhover?: string;
        button_text_color_onhover?: string;
        button_background_color_onhover?: string;
        button_text?: string;
    };
    wraperClass?: string;
    children?: React.ReactNode;
    onClick?: ( e: React.MouseEvent< HTMLButtonElement > ) => void;
    btnType?: 'submit' | 'reset' | 'button';
}

const DisplayButton: React.FC< DisplayButtonProp > = ( {
    customStyle,
    wraperClass,
    children,
    onClick,
    btnType = 'submit',
} ) => {
    const style = {
        border: `${ customStyle?.button_border_size ?? '' }px solid ${
            customStyle?.button_border_color ?? ''
        }`,
        backgroundColor: customStyle?.button_background_color ?? '',
        color: customStyle?.button_text_color ?? '',
        borderRadius: `${ customStyle?.button_border_radious ?? '' }px`,
        fontSize: `${ customStyle?.button_font_size ?? '' }px`,
        fontWeight: `${ customStyle?.button_font_width ?? '' }`,
        margin: `${ customStyle?.button_margin ?? '' }px`,
        padding: `${ customStyle?.button_padding ?? '' }px`,
    };

    const hoverStyle = {
        border: `${ customStyle?.button_border_size ?? '' }px solid ${
            customStyle?.button_border_color_onhover ?? ''
        }`,
        color: customStyle?.button_text_color_onhover ?? '',
        backgroundColor:
            customStyle?.button_background_color_onhover ?? '',
    };

    const [ hovered, setHovered ] = useState( false );
    let computedStyle;
    if ( ! wraperClass && hovered ) {
        computedStyle = hoverStyle;
    } else if ( ! wraperClass && ! hovered ) {
        computedStyle = style;
    }
    return (
        <button
            type={btnType}
            className={ wraperClass ?? '' }
            onMouseEnter={ () => setHovered( true ) }
            onMouseLeave={ () => setHovered( false ) }
            style={ computedStyle }
            onClick={ onClick }
        >
            { customStyle?.button_text ?? children }
        </button>
    );
};

export default DisplayButton;
