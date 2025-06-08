/**
 * External dependencies
 */
import React, { ChangeEvent, MouseEvent } from "react";

// Types
interface FileInputProps {
    wrapperClass?: string;
    inputClass?: string;
    id?: string;
    type?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    onChange?: ( event: ChangeEvent< HTMLInputElement > ) => void;
    onClick?: ( event: MouseEvent< HTMLInputElement > ) => void;
    onMouseOver?: ( event: MouseEvent< HTMLInputElement > ) => void;
    onMouseOut?: ( event: MouseEvent< HTMLInputElement > ) => void;
    onFocus?: ( event: ChangeEvent< HTMLInputElement > ) => void;
    onBlur?: ( event: ChangeEvent< HTMLInputElement > ) => void;
    proSetting?: boolean;
    imageSrc?: string;
    imageWidth?: number;
    imageHeight?: number;
    buttonClass?: string;
    onButtonClick?: ( event: MouseEvent< HTMLButtonElement > ) => void;
    openUploader?: string;
    descClass?: string;
    description?: string;
}

const FileInput: React.FC< FileInputProps > = ( props ) => {
    return (
        <>
            <div className={ props.wrapperClass }>
                <div className="file-uploader">
                    <input
                        className={ props.inputClass }
                        id={ props.id }
                        type={ props.type || "file" }
                        name={ props.name || "file-input" }
                        value={ props.value }
                        placeholder={ props.placeholder }
                        onChange={ ( e ) => props.onChange?.( e ) }
                        onClick={ ( e ) => props.onClick?.( e ) }
                        onMouseOver={ ( e ) => props.onMouseOver?.( e ) }
                        onMouseOut={ ( e ) => props.onMouseOut?.( e ) }
                        onFocus={ ( e ) => props.onFocus?.( e ) }
                        onBlur={ props.onBlur }
                    />
                    { props.proSetting && (
                        <span className="admin-pro-tag">pro</span>
                    ) }
                    <img
                        src={ props.imageSrc }
                        width={ props.imageWidth }
                        height={ props.imageHeight }
                        alt="Uploaded Preview"
                    />
                    <button
                        className={ props.buttonClass }
                        type="button"
                        onClick={ ( e ) => props.onButtonClick?.( e ) }
                    >
                        { props.openUploader }
                    </button>
                </div>
                { props.description && (
                    <p
                        className={ props.descClass }
                        dangerouslySetInnerHTML={ {
                            __html: props.description,
                        } }
                    ></p>
                ) }
            </div>
        </>
    );
};

export default FileInput;
