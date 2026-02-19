import React, { useRef, useState, useEffect } from 'react';
import { FieldComponent } from './types';
import { AdminButtonUI } from './AdminButton';

interface FileInputProps {
    wrapperClass?: string;
    inputClass?: string;
    id?: string;
    name?: string;
    placeholder?: string;
    accept?: string;
    onChange?: (value: string | string[]) => void;
    onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
    onMouseOver?: (event: React.MouseEvent<HTMLInputElement>) => void;
    onMouseOut?: (event: React.MouseEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    imageSrc?: string | string[];
    imageWidth?: number;
    imageHeight?: number;
    openUploader?: string;
    size?: string;
    multiple?: boolean;
}

const getFileIcon = (url: string): string => {
    const filename = url.includes('#') ? url.split('#')[1] : url.split('/').pop() || '';
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'file';
};

const getFileName = (url: string): string => url.includes('#') ? url.split('#')[1].split('?')[0] : url.split('/').pop()?.split('?')[0] || 'File';
const isImageFile = (url: string): boolean => (url.includes('#') ? url.split('#')[1] : url).match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i) !== null;

export const FileInputUI: React.FC<FileInputProps> = (props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isReplacing, setIsReplacing] = useState(false);

    useEffect(() => {
        const src = props.imageSrc;
        setFiles(!src ? [] : Array.isArray(src) ? src : [src]);
        setActiveIndex(0);
    }, [props.imageSrc]);

    const updateFile = (fileList: string[]) => {
        setFiles(fileList);
        props.onChange?.(props.multiple ? fileList : (fileList[0] || ''));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList?.length) return;
        const urls = Array.from(fileList).map(f => `${URL.createObjectURL(f)}#${f.name}`);
        let result: string[];
        if (isReplacing) {
            result = [...files];
            if (result[activeIndex]?.startsWith('blob:')) URL.revokeObjectURL(result[activeIndex].split('#')[0]);
            result[activeIndex] = urls[0];
            setIsReplacing(false);
        } else {
            result = props.multiple ? [...files, ...urls] : [urls[0]];
            setActiveIndex(result.length - 1);
        }
        updateFile(result);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleUpload = () => {
        const wp = (window as any)?.wp;
        if (!wp?.media) return inputRef.current?.click();
        
        const frame = wp.media({ 
            title: 'Select or Upload File', 
            button: { text: 'Use this file' }, 
            multiple: props.multiple && !isReplacing 
        });
        
        frame.on('select', () => {
            const urls = frame.state().get('selection').toJSON().map((a: any) => a.url);
            let result: string[];
            if (isReplacing) {
                result = [...files];
                if (result[activeIndex]?.startsWith('blob:')) URL.revokeObjectURL(result[activeIndex].split('#')[0]);
                result[activeIndex] = urls[0];
                setIsReplacing(false);
            } else {
                result = props.multiple ? [...files, ...urls] : [urls[0]];
            }
            updateFile(result);
        });
        frame.open();
    };

    const handleRemove = (index: number) => {
        const url = files[index];
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url.split('#')[0]);
        const result = files.filter((_, i) => i !== index);
        updateFile(result);
        if (activeIndex >= result.length) setActiveIndex(Math.max(0, result.length - 1));
    };

    const currentFile = files[activeIndex];
    const isCurrentImage = currentFile && isImageFile(currentFile);
    const currentSrc = currentFile?.split('#')[0] || currentFile;

    return (
        <>
            <div className={`file-uploader ${props.wrapperClass || ''} ${props.size || ''}`.trim()} style={{ backgroundImage: isCurrentImage ? `url(${currentSrc})` : 'none' }}>
                {files.length === 0 ? (
                    <>
                        <i className="upload-icon adminfont-cloud-upload" />
                        <input
                            ref={inputRef}
                            className={props.inputClass}
                            id={props.id}
                            type="hidden"
                            name={props.name || 'file-input'}
                            placeholder={props.placeholder}
                            accept={props.accept}
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
                        <AdminButtonUI buttons={[{ text: props.openUploader || 'Upload File', color: 'purple', onClick: handleUpload }]} />
                    </>
                ) : (
                    <>
                        {!isCurrentImage && (
                            <>
                                <i className={`upload-icon adminfont-attachment`} />
                                <span className="title">{getFileName(currentFile)}</span>
                            </>
                        )}
                        <div className="overlay">
                            <div className="button-wrapper">
                                <AdminButtonUI buttons={[{ text: 'Remove', color: 'red' , onClick: () => handleRemove(activeIndex) }]} />
                                <AdminButtonUI buttons={[{ text: 'Replace', color: 'purple', onClick: () => { setIsReplacing(true); handleUpload(); } }]} />
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {props.multiple && files.length > 0 && (
                <div className="uploaded-image">
                    {files.map((file, i) => {
                        const fileSrc = file.split('#')[0];
                        const isActive = i === activeIndex;
                        
                        return (
                            <div 
                                key={i} 
                                className={`image ${isActive ? 'active' : ''}`} 
                                onClick={() => setActiveIndex(i)}
                            >
                                {isImageFile(file) ? (
                                    <img
                                        src={fileSrc}
                                        alt={`preview-${i}`}
                                        width={props.imageWidth || 80}
                                        height={props.imageHeight || 80}
                                    />
                                ) : (
                                    <div>
                                        <i className={`adminfont-attachment`}/>
                                        <span>
                                            {getFileName(file).substring(0, 12)}
                                        </span>
                                    </div>
                                )}
                                <i className="adminfont-close close-btn" 
                                    onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

const FileInput: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <FileInputUI
            inputClass={field.class}
            imageSrc={value ?? appLocalizer?.default_logo}
            imageWidth={field.width}
            imageHeight={field.height}
            openUploader={appLocalizer?.open_uploader}
            name={field.name}
            accept={field.accept}
            multiple={field.multiple}
            size={field.size}
            onChange={(val) => canAccess && onChange(val)}
        />
    ),
    validate: () => null,
};

export default FileInput;