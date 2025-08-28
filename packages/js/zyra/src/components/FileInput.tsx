import React, { ChangeEvent, MouseEvent, useRef, useState } from 'react';

interface FileInputProps {
    wrapperClass?: string;
    inputClass?: string;
    id?: string;
    type?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onClick?: (event: MouseEvent<HTMLInputElement>) => void;
    onMouseOver?: (event: MouseEvent<HTMLInputElement>) => void;
    onMouseOut?: (event: MouseEvent<HTMLInputElement>) => void;
    onFocus?: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
    proSetting?: boolean;
    imageSrc?: string;
    imageWidth?: number;
    imageHeight?: number;
    buttonClass?: string;
    onButtonClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    openUploader?: string;
    descClass?: string;
    description?: string;
    onRemove?: () => void;
    onReplace?: () => void;
    size?:string;
}

const FileInput: React.FC<FileInputProps> = (props) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Local image preview state — initialize with props.imageSrc or null
    const [localImage, setLocalImage] = useState<string | undefined>(props.imageSrc);

    // When parent changes imageSrc prop, update local image state accordingly
    React.useEffect(() => {
        setLocalImage(props.imageSrc);
    }, [props.imageSrc]);

    // Handle file input change (upload new file)
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setLocalImage(url);
        }
        if (props.onChange) {
            props.onChange(e);
        }
    };

    // Remove local image and clear input
    const handleRemoveClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        if (localImage && localImage !== props.imageSrc) {
            URL.revokeObjectURL(localImage);
        }
        setLocalImage(undefined);
        if (props.onRemove) {
            props.onRemove();
        }
    };

    // Replace file — reset input and open file selector
    const handleReplaceClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
        if (props.onReplace) {
            props.onReplace();
        }
    };

    return (
        <>
            <div
                
                className={`file-uploader ${props.wrapperClass || ''}  ${props.size || ''}`}
                style={{ backgroundImage: localImage ? `url(${localImage})` : undefined }}
            >
                <i className="adminlib-cloud-upload"></i>
                <input
                    ref={inputRef}
                    className={props.inputClass}
                    id={props.id}
                    type={props.type || 'file'}
                    name={props.name || 'file-input'}
                    placeholder={props.placeholder}
                    onChange={handleChange}
                    onClick={props.onClick}
                    onMouseOver={props.onMouseOver}
                    onMouseOut={props.onMouseOut}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                    // DO NOT control value with props.value (file input cannot be controlled)
                />
                {props.proSetting && <span className="admin-pro-tag">Pro</span>}
                <span className="title">Drag and drop your file here</span>
                <span>Or</span>
                <button
                    className={`${props.buttonClass || ''} admin-btn`}
                    type="button"
                    onClick={props.onButtonClick}
                >
                    {props.openUploader || 'Upload File'}
                </button>

                {localImage && (
                    <div className="overlay">
                        <div className="button-wrapper">
                            <button
                                className="admin-btn btn-red"
                                type="button"
                                onClick={handleRemoveClick}
                            >
                                Remove
                            </button>
                            <button
                                className="admin-btn btn-purple"
                                type="button"
                                onClick={handleReplaceClick}
                            >
                                Replace
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {props.description && (
                <p
                    className={props.descClass}
                    dangerouslySetInnerHTML={{ __html: props.description }}
                ></p>
            )}
        </>
    );
};

export default FileInput;
