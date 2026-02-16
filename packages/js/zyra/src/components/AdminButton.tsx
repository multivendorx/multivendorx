import "../styles/web/UI/AdminButton.scss";
import React, { useState } from "react";
import { FieldComponent } from './types';
import axios from 'axios';
import { getApiLink } from '../utils/apiService';

type CustomStyle = {
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

type ButtonConfig = {
    icon?: string;
    text: string; 
    onClick?: React.MouseEventHandler<HTMLButtonElement>; 
    color?: string;
    children?: React.ReactNode;
    customStyle?: CustomStyle;
    disabled?: boolean;
};

type AdminButtonProps = {
  buttons: ButtonConfig | ButtonConfig[];
  wrapperClass?: string;
  position?: 'left' | 'right' | 'center';
};

export const AdminButtonUI: React.FC<AdminButtonProps> = ({
    buttons,
    wrapperClass = "",
    position = ""
}) => {
    const buttonsArray = Array.isArray(buttons) ? buttons : [buttons];
    const renderedButtons = buttonsArray.map((btn, index) => {
        const [hovered, setHovered] = useState(false);
        const baseStyle = btn.customStyle
            ? {
                  border: `${btn.customStyle.button_border_size ?? ""}px solid ${
                      btn.customStyle.button_border_color ?? ""
                  }`,
                  backgroundColor:
                      btn.customStyle.button_background_color ?? "",
                  color: btn.customStyle.button_text_color ?? "",
                  borderRadius: `${
                      btn.customStyle.button_border_radious ?? ""
                  }px`,
                  fontSize: `${
                      btn.customStyle.button_font_size ?? ""
                  }px`,
                  fontWeight: btn.customStyle.button_font_width,
                  margin: `${btn.customStyle.button_margin ?? ""}px`,
                  padding: `${btn.customStyle.button_padding ?? ""}px`,
              }
            : {};

        const hoverStyle =
            btn.customStyle && hovered
                ? {
                      border: `1px solid ${
                          btn.customStyle.button_border_color_onhover ?? ""
                      }`,
                      color:
                          btn.customStyle.button_text_color_onhover ?? "",
                      backgroundColor:
                          btn.customStyle
                              .button_background_color_onhover ?? "",
                  }
                : {};              
        return (
            <button
                key={index}
                className={`admin-btn ${
                    btn.color ? `btn-${btn.color}` : "btn-purple-bg"
                }`}
                onClick={btn.onClick}
                disabled={ btn.disabled }
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={hoverStyle ?? baseStyle}
            >
                {btn.children ?? (
                    <>
                        {btn.icon && (
                            <i className={`adminfont-${btn.icon}`} />
                        )}
                        {btn.customStyle?.button_text ?? btn.text}
                    </>
                )}
            </button>
        );
    });

    const wrapperClasses = `buttons-wrapper${
        wrapperClass ? ` ${wrapperClass}` : ""
    }`;

    return <div className={wrapperClasses} data-position={position}>{renderedButtons}</div>;
};


const AdminButton: FieldComponent = {
     render: ({ field, onChange, canAccess, appLocalizer }) => {
        const randomKey = (len: number): string =>
            Array.from({ length: len }, () =>
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
                    Math.floor(Math.random() * 62)
                )
            ).join('');

        const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
            if (!canAccess) return;

            if (field.generate) {
                const generatedValue = randomKey(8);
                 onChange({
                    key: field.responseKey,
                    value: generatedValue,
                });
            }
            
            if (field.apilink) {
                axios({
                    url: getApiLink(
                        appLocalizer,
                        String(field.apilink)
                    ),
                    method: field.method ?? 'GET',
                    headers: {
                        'X-WP-Nonce': appLocalizer.nonce,
                    },
                    params: {
                        key: field.key,
                    },
                }).then(() => {
                    console.log('hittt')
                });
            }

            if (field.link) {
                window.open(field.link, '_blank');
            }

        };

        const resolvedButtons: ButtonConfig | ButtonConfig[] =
            Array.isArray(field.options) && field.options.length > 0
                ? field.options.map((btn: any) => ({
                        text: btn.label,
                        color: field.color,
                        onClick: (e) => {
                            btn.onClick?.(e);
                        },
                    }))
                : {
                        text: field.text || field.placeholder || field.name || 'Click',
                        color: field.color,
                        onClick: handleClick,
                    };

        return (
            <AdminButtonUI
                wrapperClass={field.wrapperClass}
                buttons={resolvedButtons}
            />
        );
    },

    validate: (field, value) => {
        if (field.required && !value?.[field.key]) {
        	return `${field.label} is required`;
        }

        return null;
    },

};

export default AdminButton;