import React, { useState } from 'react';
import '../common.scss';
import { PopupUI, Container, Column } from 'zyra';
import ShowProPopup from '../Popup/Popup';
import '../AdminDashboard/AdminDashboard.scss';
import './enquiryMessages.scss';

const EnquiryMessages = () => {
    const [openPopup, setopenPopup] = useState(false);

    // If Pro is active, render only mount point
    if (appLocalizer.khali_dabba) {
        return (
            <Container general>
                <Column>
                    <div id="enquiry-messages" className='enquiry-container'></div>
                </Column>
            </Container>
        );
    }

    return (
        <div id="enquiry-messages" className="enquiry-container">
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