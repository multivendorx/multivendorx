import React, { MouseEvent } from "react";

export interface ButtonProps {
    wrapperClass?: string;
    inputClass?: string;
    type?: "button" | "submit" | "reset";
    value?: string;
    onClick?: ( e: MouseEvent< HTMLInputElement > ) => void;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
}

const Button: React.FC< ButtonProps > = ( {
    wrapperClass,
    inputClass,
    type = "button",
    value,
    onClick,
    proSetting,
    description,
    descClass,
} ) => {
    return (
        <div className={ wrapperClass }>
            <input
                className={ inputClass }
                type={ type }
                value={ value }
                onClick={ ( e ) => onClick?.( e ) }
            />
            { proSetting && <span className="admin-pro-tag">pro</span> }
            { description && (
                <p
                    className={ descClass }
                    dangerouslySetInnerHTML={ { __html: description } }
                />
            ) }
        </div>
    );
};

export default Button;
