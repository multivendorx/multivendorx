// External dependencies
import React, { ChangeEvent, MouseEvent, FocusEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FieldComponent } from './types';

interface TextAreaProps {
    id?: string;
    name?: string;
    value?: string | number;
    maxLength?: number;
    placeholder?: string;
    inputClass?: string;
    rowNumber?: number;
    colNumber?: number;
    proSetting?: boolean;
    readOnly?: boolean;
    tinymceApiKey?: string;
    usePlainText?: boolean;
    onChange?: (value: string) => void;
    onClick?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onMouseOver?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onMouseOut?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onFocus?: ( e: FocusEvent< HTMLTextAreaElement > ) => void;
    onBlur?: ( e: React.FocusEvent< HTMLTextAreaElement > ) => void;
}

export const TextAreaUI: React.FC< TextAreaProps > = ( {
    inputClass,
    id,
    name,
    value,
    rowNumber = 4,
    colNumber = 50,
    readOnly,
    placeholder,
    tinymceApiKey,
    usePlainText = false,
    onChange,
    onClick,
    onMouseOver,
    onMouseOut,
    onFocus,
    onBlur,
} ) => {
    const handleEditorChange = (content: string) => {
        onChange?.(content);
    };

    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <>
            { tinymceApiKey && ! usePlainText ? (
                <Editor
                    apiKey={ tinymceApiKey }
                    value={ value as string }
                    init={ {
                        height: rowNumber * 20,
                        menubar: false,
                        plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount',
                        ],
                        toolbar:
                            'undo redo | formatselect | bold italic backcolor | ' +
                            'alignleft aligncenter alignright alignjustify | ' +
                            'bullist numlist outdent indent | removeformat | help',
                    } }
                    onEditorChange={ handleEditorChange }
                />
            ) : (
                <textarea
                    className={`textarea-input ${inputClass || ''}`}
                    id={ id }
                    name={ name }
                    placeholder={placeholder}
                    value={ value }
                    rows={ rowNumber }
                    cols={ colNumber }
                    onChange={ handleTextareaChange }
                    onClick={ onClick }
                    onMouseOver={ onMouseOver }
                    onMouseOut={ onMouseOut }
                    onFocus={ onFocus }
                    onBlur={ onBlur }
                    readOnly={ readOnly }
                />
            ) }
        </>
    );
};

const TextArea: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <TextAreaUI
            inputClass={field.class}
            key={field.key}
            id={field.id}
            name={field.name}
            placeholder={field.placeholder}
            rowNumber={field.rowNumber} // for row number value
            colNumber={field.colNumber} // for column number value
            value={value || ''}
            usePlainText={field.usePlainText} // Toggle between textarea and TinyMCE
            tinymceApiKey={
                appLocalizer.tinymceApiKey
                    ? appLocalizer.tinymceApiKey
                    : ''
            }
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val)
            }}
        />
    ),

    validate: (field, value) => {
        return null;
    },

};

export default TextArea;
