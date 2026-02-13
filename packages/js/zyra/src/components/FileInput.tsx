import React, { ChangeEvent, MouseEvent, useRef, useState, useEffect, useCallback } from 'react';

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
    buttonColor?: string;
    openUploader?: string;
    size?: string;
    multiple?: boolean;
}

const FileInput: React.FC<FileInputProps> = (props) => {
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

    const handleNativeChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const newUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
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
        const wp = (window as any).wp;
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
            const urls = selection.map((att: any) => att.url);
            
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
                        <input
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
                            style={{ display: 'none' }}
                        />
                        <span className="title">Drag and drop your file here</span>
                        <span>Or</span>
                        <button
                            className={`${props.buttonColor || 'btn-purple-bg'} admin-btn`}
                            type="button"
                            onClick={handleWPClick}
                        >
                            {props.openUploader || 'Upload File'}
                        </button>
                    </>
                )}
                {localImages.length > 0 && (
                    <div className="overlay">
                        <div className="button-wrapper">
                            <button
                                className="admin-btn btn-red"
                                type="button"
                                onClick={() => handleRemove(activeIndex)}
                            >
                                Remove
                            </button>
                            <button
                                className="admin-btn btn-purple"
                                type="button"
                                onClick={() => {
                                    setIsReplacing(true);
                                    handleWPClick();
                                }}
                            >
                                Replace
                            </button>
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
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => handleRemove(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default FileInput;