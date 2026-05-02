import React, { useState } from 'react';
import '../common.scss';
import { PopupUI } from 'zyra';
import ShowProPopup from '../Popup/Popup';

const EnquiryMessages = () => {
    const [openPopup, setopenPopup] = useState(false);

    return (
        <div id="enquiry-messages">
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
            <div
                className="enquiry-img image-wrapper"
                onClick={() => {
                    setopenPopup(true);
                }}
            ></div>
        </div>
    );
};

export default EnquiryMessages;
