import React, { useEffect, useState } from 'react';
import { PopupComponent } from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import { __ } from '@wordpress/i18n';

const DeactivationPopup: React.FC = () => {
    const [ open, setOpen ] = useState( false );
    const [ sending, setSending ] = useState( false );
    const [ deactivateUrl, setDeactivateUrl ] = useState( '' );
    const [ action, setAction ] = useState( '' );
    const [ nonce, setNonce ] = useState( '' );

    useEffect( () => {
        const link = document.getElementById( 'notifima-deactivate-link' );
        const root = document.getElementById( 'notifima-deactivation-popup' );
        setDeactivateUrl( root?.dataset.deactivateUrl ?? '' );
        setAction( root?.dataset.action ?? '' );
        setNonce( root?.dataset.nonce ?? '' );

        if ( ! link ) {
            return;
        }

        const handleClick = ( event: MouseEvent ) => {
            event.preventDefault();
            setOpen( true );
        };

        link.addEventListener( 'click', handleClick );
        return () => link.removeEventListener( 'click', handleClick );
    }, [] );

    const goToDeactivateUrl = () => {
        if ( deactivateUrl ) {
            window.location.href = deactivateUrl;
        }
    };

    // Send report & Deactivate: ask the server to send (or reuse an existing credential for) one
    // final report, then always proceed regardless of the outcome - a failed report must never
    // block deactivation.
    const handleSend = () => {
        if ( ! action || ! nonce ) {
            goToDeactivateUrl();
            return;
        }

        setSending( true );

        const body = new URLSearchParams( { action, nonce } );

        fetch( ajaxurl, { method: 'POST', body } ).finally( goToDeactivateUrl );
    };

    if ( ! open ) {
        return null;
    }

    return (
        <PopupComponent
            position="lightbox"
            open={ open }
            onClose={ () => setOpen( false ) }
            width={ 28 }
            height="auto"
            header={ { title: __( 'Before you deactivate Notifima…', 'notifima' ) } }
        >
            {/* zyra's `footer` prop renders position:fixed/bottom:0 regardless of position
                variant, which detaches it onto its own viewport-fixed layer instead of the
                lightbox box - the header/message above it then render invisibly off-box. Buttons
                are kept in the body's own normal flow instead to avoid that. */}
            <p>
                { __(
                    'Sending a final diagnostic report helps us understand why plugins get deactivated. Nothing is sent unless you choose to, and no customer or order data is ever included.',
                    'notifima'
                ) }
            </p>
            <ButtonInput
                position="right"
                buttons={ [
                    {
                        text: __( 'Cancel', 'notifima' ),
                        color: 'red',
                        onClick: () => setOpen( false ),
                    },
                    {
                        text: __( 'Deactivate Without Sending', 'notifima' ),
                        onClick: goToDeactivateUrl,
                    },
                    {
                        text: sending
                            ? __( 'Sending…', 'notifima' )
                            : __( 'Send report & Deactivate', 'notifima' ),
                        disabled: sending,
                        onClick: handleSend,
                    },
                ] }
            />
        </PopupComponent>
    );
};

export default DeactivationPopup;
