import '../styles/web/UI/ButtonInput.scss';
import React, { useState } from 'react';
import { FieldComponent, ZyraVariable } from './fieldUtils';
import { BlockStyle } from './CanvasEditor/blockStyle';
import axios from 'axios';
import { getApiLink } from '../utils/apiService';

type CustomStyle = {
    button_border_size: number;
    button_border_color: string;
    button_background_color: string;
    button_text_color: string;
    button_border_radious: number;
    button_font_size: number;
    button_font_width: number;
    button_margin_top: number;
    button_margin_right: number;
    button_margin_bottom: number;
    button_margin_left: number;
    button_padding_top: number;
    button_padding_right: number;
    button_padding_bottom: number;
    button_padding_left: number;
    button_border_color_onhover: string;
    button_text_color_onhover: string;
    button_background_color_onhover: string;
    button_text: string;
};

export type ButtonConfig = {
    icon: string;
    text: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    color: string;
    children?: React.ReactNode;
    customStyle?: CustomStyle;
    disabled?: boolean;
    style?: BlockStyle;
};

type ButtonInputProps = {
    buttons: ButtonConfig | ButtonConfig[];
    wrapperClass?: string;
    position: 'left' | 'right' | 'center';
};

type ButtonOption = {
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    icon?: string;
};

const mapBlockStyleToCustomStyle = (
    style: BlockStyle
): Partial<CustomStyle> => ({
    button_background_color: style.backgroundColor,
    button_text_color: style.color,
    button_border_color: style.borderColor,
    button_border_radious: style.borderRadius,
    button_font_size: style.fontSize,
    button_font_width: Number(style.fontWeight),
    button_border_size: style.borderWidth,
    // Map all padding sides
    button_padding_top: style.paddingTop,
    button_padding_right: style.paddingRight,
    button_padding_bottom: style.paddingBottom,
    button_padding_left: style.paddingLeft,

    // Map all margin sides
    button_margin_top: style.marginTop,
    button_margin_right: style.marginRight,
    button_margin_bottom: style.marginBottom,
    button_margin_left: style.marginLeft,
});

const SingleButton: React.FC<{ btn: ButtonConfig; index: number }> = ({
    btn,
    index,
}) => {
    const [hovered, setHovered] = useState(false);

    const styleFromBlock = btn.style
        ? mapBlockStyleToCustomStyle(btn.style)
        : {};
    const customStyle = { ...styleFromBlock, ...(btn.customStyle || {}) };
    const padding = `${customStyle.button_padding_top}px ${customStyle.button_padding_right}px ${customStyle.button_padding_bottom}px ${customStyle.button_padding_left}px`;

    // Build margin string with all four values
    const margin = `${customStyle.button_margin_top}px ${customStyle.button_margin_right}px ${customStyle.button_margin_bottom}px ${customStyle.button_margin_left}px`;

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
        margin: margin,
        padding: padding,
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
};

export const ButtonInputUI: React.FC<ButtonInputProps> = ({
    buttons,
    wrapperClass = '',
    position = '',
}) => {
    const buttonsArray = Array.isArray(buttons) ? buttons : [buttons];
    const wrapperClasses = `buttons-wrapper${
        wrapperClass ? ` ${wrapperClass}` : ''
    }`;

    return (
        <div className={wrapperClasses} data-position={position}>
            {buttonsArray.map((btn, index) => (
                <SingleButton key={index} btn={btn} index={index} />
            ))}
        </div>
    );
};

const ButtonInput: FieldComponent = {
    render: ({ field, onChange, canAccess }) => {
        const [apiMessage, setApiMessage] = useState<string>('');

        const handleClick = () => {
            if (!canAccess) {
                return;
            }
            if (field.action === 'open_modal') {
                window.dispatchEvent(
                    new CustomEvent('multivendorx:action', {
                        detail: {
                            type: 'open_modal',
                            key: field.key,
                        },
                    })
                );
                return;
            }
            // Redirect url
            if (field.redirect_url) {
                window.open(field.redirect_url, '_self');
                return;
            }
            // REST API
            if (field.apilink) {
                axios({
                    url: getApiLink(ZyraVariable, String(field.apilink)),
                    method: field.method ?? 'GET',
                    headers: {
                        'X-WP-Nonce': ZyraVariable.nonce,
                    },
                    ...(field.method === 'GET' && {
                        params: {
                            key: field.key,
                        },
                    }),
                    ...(field.method === 'POST' && {
                        data: {
                            action: field.action || [],
                        },
                    }),
                }).then((res) => {
                    if (res.data.message) {
                        const msg = res?.data?.message;
                        setApiMessage(msg);
                    }
                });

                return;
            }

            onChange(true);
        };

        const baseConfig = {
            color: field.color || 'purple-bg',
            style: field.style,
            customStyle: field.customStyle,
        };

        const resolvedButtons =
            Array.isArray(field.options) && field.options.length > 0
                ? field.options.map((btn: ButtonOption) => ({
                      ...baseConfig,
                      text: btn.label,
                      onClick: btn.onClick,
                      disabled: btn.disabled,
                      icon: btn.icon,
                  }))
                : [
                      {
                          ...baseConfig,
                          text:
                              field.text ||
                              field.placeholder ||
                              field.name ||
                              'Click',
                          disabled: field.disabled,
                          onClick: field.onClick || handleClick,
                          icon: field.icon,
                      },
                  ];

        return (
            <>
                <ButtonInputUI
                    wrapperClass={field.wrapperClass || ''}
                    buttons={resolvedButtons}
                    position={field.position || 'left'}
                />
                {apiMessage && (
                    <p className="api-message">
                        {apiMessage}
                    </p>
                )}
            </>
        );
    },

    validate: (field, value) => {
        const error =
            field.required && !value ? `${field.label} is required` : null;
        return error;
    },
};

export default ButtonInput;
