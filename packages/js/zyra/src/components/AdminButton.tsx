import "../styles/web/UI/AdminButton.scss";
import React, { useState } from "react";
import { FieldComponent } from './types';
import { BlockStyle } from './CanvasEditor/blockStyle';

type CustomStyle = {
    button_border_size: number;
    button_border_color: string;
    button_background_color: string;
    button_text_color: string;
    button_border_radious: number; 
    button_font_size: number;
    button_font_width: number; 
    button_margin: number;
    button_padding: number;
    button_border_color_onhover: string;
    button_text_color_onhover: string;
    button_background_color_onhover: string;
    button_text: string;
};

type ButtonConfig = {
    icon: string;
    text: string; 
    onClick: React.MouseEventHandler<HTMLButtonElement>; 
    color: string;
    children: React.ReactNode;
    customStyle: CustomStyle;
    disabled: boolean;
    style: BlockStyle;
};

type AdminButtonProps = {
    buttons: ButtonConfig | ButtonConfig[];
    wrapperClass: string;
    position: 'left' | 'right' | 'center';
};

const mapBlockStyleToCustomStyle = (style: BlockStyle): Partial<CustomStyle> => ({
    button_background_color: style.backgroundColor,
    button_text_color: style.color,
    button_border_color: style.borderColor,
    button_border_radious: style.borderRadius,
    button_font_size: style.fontSize,
    button_font_width: Number(style.fontWeight),
    button_border_size: style.borderWidth,
    button_padding: style.paddingTop,
    button_margin: style.marginTop,
});

export const AdminButtonUI: React.FC<AdminButtonProps> = ({
    buttons,
    wrapperClass = "",
    position = ""
}) => {
    const buttonsArray = Array.isArray(buttons) ? buttons : [buttons];
    
    const renderedButtons = buttonsArray.map((btn, index) => {
        const [hovered, setHovered] = useState(false);
        
        const styleFromBlock = btn.style ? mapBlockStyleToCustomStyle(btn.style) : {};
        const customStyle = {  ...styleFromBlock, ...(btn.customStyle || {}) };
        
        const buttonStyle: React.CSSProperties = {
            border: hovered 
                ? `${customStyle.button_border_size}px solid ${customStyle.button_border_color_onhover}`
                : `${customStyle.button_border_size}px solid ${customStyle.button_border_color}`,
            backgroundColor: hovered 
                ? customStyle.button_background_color_onhover
                : customStyle.button_background_color,
            color: hovered 
                ? customStyle.button_text_color_onhover
                : customStyle.button_text_color,
            borderRadius: `${customStyle.button_border_radious}px`,
            fontSize: `${customStyle.button_font_size}px`,
            fontWeight: customStyle.button_font_width,
            margin: `${customStyle.button_margin}px`,
            padding: `${customStyle.button_padding}px`,
        };

        return (
            <button
                key={index}
                className={`admin-btn btn-${btn.color || 'purple-bg'}`}
                onClick={btn.onClick}
                disabled={btn.disabled}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={buttonStyle}
            >
                {btn.children || (
                    <>
                        {btn.icon && <i className={`adminfont-${btn.icon}`} />}
                        {customStyle.button_text || btn.text}
                    </>
                )}
            </button>
        );
    });

    const wrapperClasses = `buttons-wrapper${wrapperClass ? ` ${wrapperClass}` : ""}`;

    return <div className={wrapperClasses} data-position={position}>{renderedButtons}</div>;
};

const AdminButton: FieldComponent = {
    render: ({ field, onChange, canAccess }) => {
        const baseConfig = {
            color: field.color || 'purple-bg',
            style: field.style,
            customStyle: field.customStyle,
        };

        const resolvedButtons = (Array.isArray(field.options) && field.options.length > 0)
            ? field.options.map((btn: any) => ({
                ...baseConfig,
                text: btn.label,
                onClick: btn.onClick,
                disabled: btn.disabled,
                icon: btn.icon,
            }))
            : [{
                ...baseConfig,
                text: field.text || field.placeholder || field.name || 'Click',
                onClick: () => { onChange(true); },
                disabled: field.disabled,
                icon: field.icon,
            }];

        return (
            <AdminButtonUI
                wrapperClass={field.wrapperClass || ''}
                buttons={resolvedButtons}
                position={field.position || 'left'}
            />
        );
    },

    validate: (field, value) => {
        const error = field.required && !value ? `${field.label} is required` : null;
        return error;
    },
};

export default AdminButton;