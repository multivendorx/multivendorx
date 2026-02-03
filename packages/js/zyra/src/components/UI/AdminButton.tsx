import "../../styles/web/UI/AdminButton.scss";
import React, { useState } from "react";

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
    onClick?: React.MouseEventHandler<HTMLDivElement>; 
    className?: string;
    children?: React.ReactNode;
    customStyle?: CustomStyle;
};

type AdminButtonProps = {
  buttons: ButtonConfig | ButtonConfig[];
  wrapperClass?: 'left' | 'right' | 'center';
};

const AdminButton: React.FC<AdminButtonProps> = ({
    buttons,
    wrapperClass = "",
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
            : undefined;

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
                : undefined;

        return (
            <div
                key={index}
                className={`admin-btn ${
                    btn.className ? `btn-${btn.className}` : ""
                }`}
                onClick={btn.onClick} // Now TypeScript is happy with this
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
            </div>
        );
    });

    const wrapperClasses = `buttons-wrapper${
        wrapperClass ? ` ${wrapperClass}` : ""
    }`;

    return <div className={wrapperClasses}>{renderedButtons}</div>;
};

export default AdminButton;