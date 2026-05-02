import React, { useState } from 'react';
import ShowProPopup from '../Popup/Popup';
import '../common.scss';
import { __ } from '@wordpress/i18n';
import {  NavigatorHeader, PopupUI } from 'zyra';

const WholesaleUser = () => {
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
                headerIcon="wholesale"
                headerDescription={__(
                    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, facere atque alias quasi aperiam nesciunt.',
                    'catalogx'
                )}
                headerTitle={__('Wholesale User', 'catalogx')}
            />
            <div
                className="image-wrapper wholesale-user-image"
                onClick={() => {
                    setopenPopup(true);
                }}
            ></div>
        </>
    );
};

export default WholesaleUser;
