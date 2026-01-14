import React, { ChangeEvent, MouseEvent, useRef, useState } from 'react';

interface FileInputProps {
    wrapperClass?: string;
    inputClass?: string;
    id?: string;
    type?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    onChange?: ( value: string | string[] ) => void;
    onClick?: ( event: MouseEvent< HTMLInputElement > ) => void;
    onMouseOver?: ( event: MouseEvent< HTMLInputElement > ) => void;
    onMouseOut?: ( event: MouseEvent< HTMLInputElement > ) => void;
    onFocus?: ( event: ChangeEvent< HTMLInputElement > ) => void;
    onBlur?: ( event: ChangeEvent< HTMLInputElement > ) => void;
    proSetting?: boolean;
    imageSrc?: string | string[];
    imageWidth?: number;
    imageHeight?: number;
    buttonColor?: string;
    onButtonClick?: ( event: MouseEvent< HTMLButtonElement > ) => void;
    openUploader?: string;
    description?: string;
    onRemove?: () => void;
    onReplace?: ( index: number, images: string[] ) => void;
    size?: string;
    multiple?: boolean;
}

const FileInput: React.FC< FileInputProps > = ( props ) => {
    const [ activeIndex, setActiveIndex ] = useState< number >( 0 );
    const [ isReplacing, setIsReplacing ] = useState< boolean >( false );
    const inputRef = useRef< HTMLInputElement >( null );
    const normalizeImages = ( src?: string | string[] ) => {
        if ( ! src ) {
            return [];
        }
        return Array.isArray( src ) ? src : [ src ];
    };

    // Local image preview state — initialize with props.imageSrc or null
    const [ localImages, setLocalImages ] = useState< string[] >(
        normalizeImages( props.imageSrc )
    );

    // When parent changes imageSrc prop, update local image state accordingly
    React.useEffect( () => {
        const images = normalizeImages( props.imageSrc );
        setLocalImages( images );
        setActiveIndex( 0 );
    }, [ props.imageSrc ] );

    // Handle file input change (upload new file)
    const handleChange = ( e: ChangeEvent< HTMLInputElement > ) => {
        if ( ! e.target.files || e.target.files.length === 0 ) {
            return;
        }

        const urls = Array.from( e.target.files ).map( ( file ) =>
            URL.createObjectURL( file )
        );

        setLocalImages( ( prev ) => {
            if ( ! props.multiple || ! isReplacing ) {
                setActiveIndex( 0 );
                props.onChange?.( props.multiple ? urls : urls[ 0 ] );
                return props.multiple ? urls : [ urls[ 0 ] ];
            }

            const next = [ ...prev ];

            // Revoke old image
            const old = next[ activeIndex ];
            if ( old && old.startsWith( 'blob:' ) ) {
                URL.revokeObjectURL( old );
            }

            next[ activeIndex ] = urls[ 0 ];
            props.onChange?.( next );
            return next;
        } );

        setIsReplacing( false );
    };

    const setAsMainImage = ( index: number ) => {
        setActiveIndex( index );
    };
    // Remove local image and clear input
    const handleRemoveClick = () => {
        setLocalImages( ( prev ) => {
            if ( prev.length === 0 ) {
                return prev;
            }

            const removed = prev[ activeIndex ];
            const next = prev.filter( ( _, i ) => i !== activeIndex );

            // Revoke object URL safely
            if ( removed && removed.startsWith( 'blob:' ) ) {
                URL.revokeObjectURL( removed );
            }

            // Fix active index after removal
            if ( activeIndex >= next.length ) {
                setActiveIndex( Math.max( 0, next.length - 1 ) );
            }

            props.onChange?.( next );
            return next;
        } );
    };

    // Replace file — reset input and open file selector
    const handleReplaceClick = () => {
        setIsReplacing( true );
        props.onReplace?.( activeIndex, localImages );
    };

    const handleRemoveSingleImage = ( index: number ) => {
        setLocalImages( ( prev ) => {
            const next = prev.filter( ( _, i ) => i !== index );

            if ( activeIndex >= next.length ) {
                setActiveIndex( Math.max( 0, next.length - 1 ) );
            } else if ( index === activeIndex ) {
                setActiveIndex( 0 );
            }

            props.onChange?.( next );
            return next;
        } );
    };

    return (
        <>
            <div
                className={ `file-uploader ${ props.wrapperClass || '' }  ${
                    props.size || ''
                }` }
                style={ {
                    backgroundImage: localImages[ activeIndex ]
                        ? `url(${ localImages[ activeIndex ] })`
                        : '',
                } }
            >
                { localImages.length === 0 && (
                    <>
                        <i className="upload-icon adminfont-cloud-upload"></i>
                        <input
                            ref={ inputRef }
                            className={ `basic-input ${ props.inputClass || '' }`}
                            id={ props.id }
                            type={ props.type || 'file' }
                            name={ props.name || 'file-input' }
                            placeholder={ props.placeholder }
                            onChange={ handleChange }
                            onClick={ props.onClick }
                            onMouseOver={ props.onMouseOver }
                            onMouseOut={ props.onMouseOut }
                            onFocus={ props.onFocus }
                            onBlur={ props.onBlur }
                            multiple={ props.multiple }
                            // DO NOT control value with props.value (file input cannot be controlled)
                        />
                        <span className="title">
                            Drag and drop your file here
                        </span>
                        <span>Or</span>
                        <button
                            className={ `${
                                props.buttonColor || 'btn-purple-bg'
                            } admin-btn` }
                            type="button"
                            onClick={ props.onButtonClick }
                        >
                            { props.openUploader || 'Upload File' }
                        </button>
                    </>
                ) }
                { localImages.length > 0 && (
                    <div className="overlay">
                        <div className="button-wrapper">
                            <button
                                className="admin-btn btn-red"
                                type="button"
                                onClick={ handleRemoveClick }
                            >
                                Remove
                            </button>
                            <button
                                className="admin-btn btn-purple"
                                type="button"
                                onClick={ handleReplaceClick }
                            >
                                Replace
                            </button>
                        </div>
                    </div>
                ) }
            </div>
            { props.multiple && localImages.length > 0 && (
                <div className="file-preview-list">
                    { localImages.map( ( img, index ) => (
                        <div className="file-preview-item" key={ index }>
                            <img
                                src={ img }
                                alt={ `preview-${ index }` }
                                width={ props.imageWidth || 80 }
                                height={ props.imageHeight || 80 }
                                onClick={ () => setAsMainImage( index ) }
                            />
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={ () =>
                                    handleRemoveSingleImage( index )
                                }
                            >
                                ✕
                            </button>
                        </div>
                    ) ) }
                </div>
            ) }

            { props.description && (
                <p
                    className="settings-metabox-description"
                    dangerouslySetInnerHTML={ { __html: props.description } }
                ></p>
            ) }
        </>
    );
};

export default FileInput;
