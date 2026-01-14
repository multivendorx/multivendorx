import React, { ChangeEvent, MouseEvent, FocusEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';

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
    description?: string;
    descClass?: string;
    tinymceApiKey?: string;
    usePlainText?: boolean;
    onChange?: ( e: ChangeEvent< HTMLTextAreaElement > ) => void;
    onClick?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onMouseOver?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onMouseOut?: ( e: MouseEvent< HTMLTextAreaElement > ) => void;
    onFocus?: ( e: FocusEvent< HTMLTextAreaElement > ) => void;
    onBlur?: ( e: React.FocusEvent< HTMLTextAreaElement > ) => void;
}

const TextArea: React.FC< TextAreaProps > = ( {
    inputClass,
    id,
    name,
    value,
    rowNumber = 4,
    colNumber = 50,
    readOnly,
    description,
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
    const handleEditorChange = ( content: string ) => {
        if ( onChange ) {
            // create fake event to mimic textarea behavior
            const fakeEvent = {
                target: { name, value: content },
            } as ChangeEvent< HTMLTextAreaElement >;
            onChange( fakeEvent );
        }
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
                    onChange={ onChange }
                    onClick={ onClick }
                    onMouseOver={ onMouseOver }
                    onMouseOut={ onMouseOut }
                    onFocus={ onFocus }
                    onBlur={ onBlur }
                    readOnly={ readOnly }
                />
            ) }
            { description && (
                <p
                    className= "settings-metabox-description"
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </>
    );
};

export default TextArea;
