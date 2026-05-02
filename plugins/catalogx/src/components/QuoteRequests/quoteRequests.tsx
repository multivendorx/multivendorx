import React, { useState } from 'react';
import '../common.scss';
import { NavigatorHeader, PopupUI } from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';

export default function QuotesList() {
    const [openPopup, setopenPopup] = useState(false);

    return (
        <>
            {openPopup && (
                <PopupUI
                    position="lightbox"
                    open={openPopup}
                    onClose={() => setopenPopup(false)}
                    width={31.25}
                    height="auto"
                >
                    <ShowProPopup />
                </PopupUI>
            )}
            <NavigatorHeader
                headerIcon="quote"
                headerDescription={__(
                    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, facere atque alias quasi aperiam nesciunt.',
                    'catalogx'
                )}
                headerTitle={__('Quote Requests', 'catalogx')}
            />
            <div
                className="quote-img image-wrapper"
                onClick={() => {
                    setopenPopup(true);
                }}
            ></div>
        </>
    );
}
