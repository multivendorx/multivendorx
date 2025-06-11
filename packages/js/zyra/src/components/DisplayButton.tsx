/**
 * External dependencies
 */
import React, { useState } from 'react';

// Types
export interface DisplayButtonProp {
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
}

const DisplayButton: React.FC< DisplayButtonProp > = ( {
	customStyle,
	wraperClass,
	children,
	onClick,
} ) => {
	const style = {
		border: `${ customStyle?.button_border_size ?? 1 }px solid ${
			customStyle?.button_border_color ?? '#000000'
		}`,
		backgroundColor: customStyle?.button_background_color ?? '#ffffff',
		color: customStyle?.button_text_color ?? '#000000',
		borderRadius: `${ customStyle?.button_border_radious ?? 0 }px`,
		fontSize: `${ customStyle?.button_font_size ?? 20 }px`,
		fontWeight: `${ customStyle?.button_font_width ?? 1 }rem`,
		margin: `${ customStyle?.button_margin ?? 0 }px`,
		padding: `${ customStyle?.button_padding ?? 0 }px`,
	};

	const hoverStyle = {
		border: `1px solid ${
			customStyle?.button_border_color_onhover ?? '#000000'
		}`,
		color: customStyle?.button_text_color_onhover ?? '#000000',
		backgroundColor:
			customStyle?.button_background_color_onhover ?? '#ffffff',
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
