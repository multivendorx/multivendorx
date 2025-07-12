import React, { useState } from 'react';
import './enquiryMessages.scss';
import { useModules } from 'zyra';
import Dialog from '@mui/material/Dialog';
import ShowPopup from '../Popup/Popup';

const EnquiryMessages = () => {
    // Check pro is active and module is active or not.
    const { modules }: { modules: string[] } = useModules();
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div className="container" id="enquiry-messages">
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
                    style={
                        {
                            '--url': `url(${ appLocalizer.enquiry_messages_bg })`,
                        } as any
                    }
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
};

export default EnquiryMessages;
