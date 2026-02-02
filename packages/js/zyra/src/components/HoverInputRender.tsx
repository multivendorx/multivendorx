// External Dependencies
import React, { useEffect, useRef } from 'react';

// Types
interface HoverInputRenderProps {
    label: string;
    placeholder?: string;
    onLabelChange: ( newLabel: string ) => void;
    renderStaticContent: ( props: {
        label: string;
        placeholder?: string;
    } ) => JSX.Element;
    renderEditableContent: ( props: {
        label: string;
        onLabelChange: ( newLabel: string ) => void;
        placeholder?: string;
    } ) => JSX.Element;
}

const HoverInputRender: React.FC< HoverInputRenderProps > = ( {
    label,
    placeholder,
    renderStaticContent,
} ) => {
    const hoverTimeout = useRef< number | null >( null );

    useEffect( () => {
        const closePopup = ( event: MouseEvent ) => {
            if (
                ( event.target as HTMLElement ).closest(
                    '.meta-setting-modal, .react-draggable'
                )
            ) {
                return;
            }
        };
        document.body.addEventListener( 'click', closePopup );
        return () => {
            document.body.removeEventListener( 'click', closePopup );
        };
    }, [] );

    const handleMouseLeave = () => {
        if ( hoverTimeout.current ) {
            clearTimeout( hoverTimeout.current );
        }
    };

    return (
        <>
            { /* { ! showTextBox && ( */ }
            <div
                onMouseLeave={ handleMouseLeave }
                style={ { cursor: 'pointer' } }
            >
                { renderStaticContent( { label, placeholder } ) }
            </div>
        </>
    );
};

export default HoverInputRender;
