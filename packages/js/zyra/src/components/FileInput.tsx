import React, { ChangeEvent, MouseEvent, useRef, useState, useEffect, useCallback } from 'react';
import { FieldComponent } from './types';
import { BasicInputUI } from './BasicInput';
import { AdminButtonUI } from './AdminButton';

interface FileInputProps {
    wrapperClass?: string;
    inputClass?: string;
    id?: string;
    type?: string;
    name?: string;
    placeholder?: string;
    onChange?: (value: string | string[]) => void;
    onClick?: (event: MouseEvent<HTMLInputElement>) => void;
    onMouseOver?: (event: MouseEvent<HTMLInputElement>) => void;
    onMouseOut?: (event: MouseEvent<HTMLInputElement>) => void;
    onFocus?: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
    // Image source from parent
    imageSrc?: string | string[];
    imageWidth?: number;
    imageHeight?: number;
    openUploader?: string;
    size?: string;
    multiple?: boolean;
}

const FileInputUI: React.FC<FileInputProps> = (props) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isReplacing, setIsReplacing] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Helper: Normalize incoming props to an array
    const normalizeImages = useCallback((src?: string | string[]) => {
        if (!src) return [];
        return Array.isArray(src) ? src : [src];
    }, []);

    const [localImages, setLocalImages] = useState<string[]>(() => normalizeImages(props.imageSrc));

    // Sync state when props change
    useEffect(() => {
        setLocalImages(normalizeImages(props.imageSrc));
        setActiveIndex(0);
    }, [props.imageSrc, normalizeImages]);

    // Internal function to clean up and notify parent
    const updateAll = (nextImages: string[]) => {
        setLocalImages(nextImages);
        if (props.onChange) {
            // Send back string if single, array if multiple
            props.onChange(props.multiple ? nextImages : (nextImages[0] || ''));
        }
    };

    // Helper to clear blob URLs
    const revoke = (url: string) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    };

    const handleNativeChange = (files: FileList | null) => {
        if (!files) return;

        const newUrls = Array.from(files).map(file => URL.createObjectURL(file));
        let next: string[];

        if (isReplacing) {
            next = [...localImages];
            revoke(next[activeIndex]);
            next[activeIndex] = newUrls[0];
            setIsReplacing(false);
        } else {
            next = props.multiple ? [...localImages, ...newUrls] : [newUrls[0]];
            setActiveIndex(0);
        }

        updateAll(next);
        if (inputRef.current) inputRef.current.value = ''; 
    };

    const handleWPClick = () => {
        const wp = (window)?.wp;
        if (!wp || !wp.media) {
            inputRef.current?.click();
            return;
        }

        const frame = wp.media({
            title: 'Select or Upload Image',
            button: { text: 'Use this image' },
            multiple: props.multiple && !isReplacing,
        });

        frame.on('select', () => {
            const selection = frame.state().get('selection').toJSON();
            const urls = selection.map((att) => att.url);
            
            let next: string[];
            if (isReplacing) {
                next = [...localImages];
                revoke(next[activeIndex]);
                next[activeIndex] = urls[0];
                setIsReplacing(false);
            } else {
                next = props.multiple ? [...localImages, ...urls] : [urls[0]];
            }
            updateAll(next);
        });

        frame.open();
    };

    const handleRemove = (index: number) => {
        const removedUrl = localImages[index];
        revoke(removedUrl);

        const next = localImages.filter((_, i) => i !== index);
        
        // Adjust active index if we removed the last item or the current item
        if (activeIndex >= next.length) {
            setActiveIndex(Math.max(0, next.length - 1));
        }

        updateAll(next);
    };

    return (
        <>
            <div
                className={`file-uploader ${props.wrapperClass || ''} ${props.size || ''}`}
                style={{
                    backgroundImage: localImages[activeIndex] ? `url(${localImages[activeIndex]})` : '',
                }}
            >
                {localImages.length === 0 && (
                    <>
                        <i className="upload-icon adminfont-cloud-upload"></i>
                            <BasicInputUI
								ref={inputRef}
                                className={`basic-input ${props.inputClass || ''}`}
                                id={props.id}
                                type="file" // Fixed to file for logic
                                name={props.name || 'file-input'}
                                placeholder={props.placeholder}
                                onChange={handleNativeChange}
                                onClick={props.onClick}
                                onMouseOver={props.onMouseOver}
                                onMouseOut={props.onMouseOut}
                                onFocus={props.onFocus}
                                onBlur={props.onBlur}
                                multiple={props.multiple}
							/>
                        <span className="title">Drag and drop your file here</span>
                        <span>Or</span>
                        <AdminButtonUI
                            buttons={[
                                {
                                    text: props.openUploader || 'Upload File',
                                    onClick: handleWPClick
                                },
                            ]}
                        />
                    </>
                )}
                {localImages.length > 0 && (
                    <div className="overlay">
                        <div className="button-wrapper">
                            <AdminButtonUI
                                buttons={[
                                    {
                                        text: 'Remove',
                                        onClick: () => handleRemove(activeIndex)
                                    },
                                ]}
                            />
                            <AdminButtonUI
                                buttons={[
                                    {
                                        text: 'Replace',
                                        onClick: () => {
                                            setIsReplacing(true);
                                            handleWPClick();
                                        }
                                    },
                                ]}
                            />
                        </div>
                    </div>
                )}
            </div>
            {props.multiple && localImages.length > 0 && (
                <div className="file-preview-list">
                    {localImages.map((img, index) => (
                        <div className={`file-preview-item ${index === activeIndex ? 'active' : ''}`} key={index}>
                            <img
                                src={img}
                                alt={`preview-${index}`}
                                width={props.imageWidth || 80}
                                height={props.imageHeight || 80}
                                onClick={() => setActiveIndex(index)}
                            />
                            <i className='remove-btn adminfont-close' onClick={() => handleRemove(index)} ></i>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

const FileInput: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <FileInputUI
            inputClass={field.key}
            imageSrc={value ?? appLocalizer?.default_logo}
            imageWidth={field.width} // Width of the displayed image
            imageHeight={field.height} // Height of the displayed image
            openUploader={appLocalizer?.open_uploader}
            type="hidden" // Input type; in this case, hidden because the FileInput manages its own display
            name={field.name}
            multiple={field.multiple} //to add multiple image pass true or false
            size={field.size} // Size of the input (if used by FileInput for styling)                            
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

export default FileInput;
