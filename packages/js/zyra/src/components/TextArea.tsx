/**
 * External dependencies
 */
import React, { ChangeEvent, MouseEvent, FocusEvent } from "react";

// Types
export interface TextAreaProps {
    id?: string;
    key: string;
    name?: string;
    value?: string | number;
    maxLength?: number;
    placeholder?: string;
    wrapperClass?: string;
    inputClass?: string;
    rowNumber?: number;
    colNumber?: number;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    onChange?: ( e: ChangeEvent< HTMLTextAreaElement > ) => void;
    onClick?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onMouseOver?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onMouseOut?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onFocus?: ( e: FocusEvent< HTMLTextAreaElement > ) => void;
}

export const TextArea: React.FC< TextAreaProps > = ( {
    wrapperClass,
    inputClass,
    id,
    key,
    name,
    value,
    maxLength,
    placeholder,
    rowNumber = 4,
    colNumber = 50,
    proSetting,
    description,
    descClass,
    onChange,
    onClick,
    onMouseOver,
    onMouseOut,
    onFocus,
} ) => {
    return (
        <div className={ wrapperClass }>
            <textarea
                className={ inputClass }
                id={ id }
                key={ key }
                name={ name }
                value={ value }
                maxLength={ maxLength }
                placeholder={ placeholder }
                rows={ rowNumber }
                cols={ colNumber }
                onChange={ onChange }
                onClick={ onClick }
                onMouseOver={ onMouseOver }
                onMouseOut={ onMouseOut }
                onFocus={ onFocus }
            />
            { proSetting && <span className="admin-pro-tag">pro</span> }
            { description && (
                <p
                    className={ descClass }
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </div>
    );
};

export default TextArea;
