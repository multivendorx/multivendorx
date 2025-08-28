/**
 * External dependencies
 */
import React, { ChangeEvent, MouseEvent, FocusEvent } from 'react';

// Types
interface TextAreaProps {
    id?: string;
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
    onBlur?: ( e: React.FocusEvent< HTMLTextAreaElement > ) => void;
}

export const TextArea: React.FC< TextAreaProps > = ( {
    inputClass,
    id,
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
    onBlur,
} ) => {
    return (
        <>
            <textarea
                className={ inputClass }
                id={ id }
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
                onBlur={ onBlur }
            />
            { proSetting && <span className="admin-pro-tag">Pro</span> }
            { description && (
                <p
                    className={ descClass }
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </>
    );
};

export default TextArea;
