import React, { useRef, useState, useEffect } from 'react';
import { FieldComponent } from './types';
import { BasicInputUI } from './BasicInput';
import { AdminButtonUI } from './AdminButton';

interface FileInputProps {
    wrapperClass?: string;
    inputClass?: string;
    id?: string;
    name?: string;
    placeholder?: string;
    onChange?: (value: string | string[]) => void;
    onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
    onMouseOver?: (event: React.MouseEvent<HTMLInputElement>) => void;
    onMouseOut?: (event: React.MouseEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    imageSrc?: string | string[];
    imageWidth?: number;
    imageHeight?: number;
    openUploader?: string;
    size?: string;
    multiple?: boolean;
}

export const FileInputUI: React.FC<FileInputProps> = (props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isReplacing, setIsReplacing] = useState(false);

    useEffect(() => {
        const src = props.imageSrc;
        setImages(!src ? [] : Array.isArray(src) ? src : [src]);
        setActiveIndex(0);
    }, [props.imageSrc]);

    const notify = (imgs: string[]) => {
        setImages(imgs);
        props.onChange?.(props.multiple ? imgs : (imgs[0] || ''));
    };

    const handleFileChange = (files: FileList | null) => {
        if (!files?.length) return;
        
        const urls = Array.from(files).map(f => URL.createObjectURL(f));
        let result: string[];

        if (isReplacing) {
            result = [...images];
            if (result[activeIndex]?.startsWith('blob:')) URL.revokeObjectURL(result[activeIndex]);
            result[activeIndex] = urls[0];
            setIsReplacing(false);
        } else {
            result = props.multiple ? [...images, ...urls] : [urls[0]];
            setActiveIndex(0);
        }

        notify(result);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleUpload = () => {
        const wp = (window as any)?.wp;
        if (!wp?.media) return inputRef.current?.click();

        const frame = wp.media({
            title: 'Select or Upload Image',
            button: { text: 'Use this image' },
            multiple: props.multiple && !isReplacing,
        });

        frame.on('select', () => {
            const urls = frame.state().get('selection').toJSON().map((a: any) => a.url);
            let result: string[];

            if (isReplacing) {
                result = [...images];
                if (result[activeIndex]?.startsWith('blob:')) URL.revokeObjectURL(result[activeIndex]);
                result[activeIndex] = urls[0];
                setIsReplacing(false);
            } else {
                result = props.multiple ? [...images, ...urls] : [urls[0]];
            }

            notify(result);
        });

        frame.open();
    };

    const handleRemove = (index: number) => {
        if (images[index]?.startsWith('blob:')) URL.revokeObjectURL(images[index]);
        const result = images.filter((_, i) => i !== index);
        notify(result);
        if (activeIndex >= result.length) setActiveIndex(Math.max(0, result.length - 1));
    };

    return (
        <>
            <div 
                className={`file-uploader ${props.wrapperClass || ''} ${props.size || ''}`.trim()}
                style={{ backgroundImage: images[activeIndex] ? `url(${images[activeIndex]})` : '' }}
            >
                {images.length === 0 ? (
                    <>
                        <i className="upload-icon adminfont-cloud-upload" />
                        <BasicInputUI 
                            ref={inputRef} 
                            inputClass={props.inputClass} 
                            id={props.id} 
                            type="file"
                            name={props.name || 'file-input'} 
                            placeholder={props.placeholder} 
                            value=""
                            onChange={handleFileChange}
                            onClick={props.onClick} 
                            onMouseOver={props.onMouseOver} 
                            onMouseOut={props.onMouseOut}
                            onFocus={props.onFocus} 
                            onBlur={props.onBlur} 
                            multiple={props.multiple} 
                        />
                        <span className="title">Drag and drop your file here</span>
                        <span>Or</span>
                        <AdminButtonUI buttons={[{ text: props.openUploader || 'Upload File', onClick: handleUpload }]} />
                    </>
                ) : (
                    <div className="overlay">
                        <div className="button-wrapper">
                            <AdminButtonUI buttons={[{ text: 'Remove', onClick: () => handleRemove(activeIndex) }]} />
                            <AdminButtonUI buttons={[{ text: 'Replace', onClick: () => { setIsReplacing(true); handleUpload(); } }]} />
                        </div>
                    </div>
                )}
            </div>
            
            {props.multiple && images.length > 0 && (
                <div className="file-preview-list">
                    {images.map((img, i) => (
                        <div key={i} className={`file-preview-item ${i === activeIndex ? 'active' : ''}`}>
                            <img 
                                src={img} 
                                alt={`preview-${i}`} 
                                width={props.imageWidth || 80} 
                                height={props.imageHeight || 80}
                                onClick={() => setActiveIndex(i)} 
                            />
                            <i className="remove-btn adminfont-close" onClick={() => handleRemove(i)} />
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
            imageWidth={field.width}
            imageHeight={field.height}
            openUploader={appLocalizer?.open_uploader}
            name={field.name}
            multiple={field.multiple}
            size={field.size}
            onChange={(val) => canAccess && onChange(val)}
        />
    ),
    validate: () => null,
};

export default FileInput;