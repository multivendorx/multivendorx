import React, { useState } from 'react';
import './enquiryMessages.scss';
import Dialog from '@mui/material/Dialog';
import ShowPopup from '../Popup/Popup';

const EnquiryMessages = () => {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div className="admin-table-wrapper" id="enquiry-messages">
                <Dialog
                    className="admin-module-popup"
                    open={ openDialog }
                    onClose={ () => {
                        setOpenDialog( false );
                    } }
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminlib-cross"
                        onClick={ () => {
                            setOpenDialog( false );
                        } }
                    ></span>
                    { ! appLocalizer.khali_dabba ? (
                        <ShowPopup />
                    ) : (
                        <ShowPopup moduleName="Enquiry" />
                    ) }
                </Dialog>
                <div
                    className="enquiry-img"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
};

export default EnquiryMessages;
