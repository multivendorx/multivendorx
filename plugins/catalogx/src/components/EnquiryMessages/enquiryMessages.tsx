import React, { useState } from 'react';
import './enquiryMessages.scss';
import Dialog from '@mui/material/Dialog';
import ShowPopup from '../Popup/Popup';
import { AdminBreadcrumbs } from 'zyra';

const EnquiryMessages = () => {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminfont-enquiry"
                tabTitle="Enquiry Messages"
                description="View and manage customer enquiries"
                premium={!appLocalizer.khali_dabba}
                goPremium={!appLocalizer.khali_dabba}
                goPremiumLink={appLocalizer.pro_url}
            />
            <div id="enquiry-messages">
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
                    { ! appLocalizer.khali_dabba && <ShowPopup moduleName="Enquiry" /> }
                </Dialog>
                <div
                    className="enquiry-img image-wrapper"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
};

export default EnquiryMessages;
