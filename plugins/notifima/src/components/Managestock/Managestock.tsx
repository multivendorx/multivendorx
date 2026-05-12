import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import Popup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';
import { NavigatorHeader, PopupUI } from 'zyra';
// import './ManagestockTable.scss';
import '../common.scss';
import ShowProPopup from '../Popup/Popup';

const Managestock: React.FC = () => {
    const [openPopup, setopenPopup] = useState(false);
    return (
        <>
            <div id="manage-stock-table">
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
                        'Lorem Ipsum is simply dummy text of the printing and typesetting',
                        'notifima'
                    )}
                    headerTitle={__('Manage stock', 'notifima')}
                />
                <div
                    onClick={() => {
                        setopenPopup(true);
                    }}
                    className="image-wrapper manage-stock"
                ></div>
            </div>
        </>
    );
};

export default Managestock;
