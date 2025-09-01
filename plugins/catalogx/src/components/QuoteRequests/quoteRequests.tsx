import Dialog from '@mui/material/Dialog';
import React, { useState } from 'react';
import ShowPopup from '../Popup/Popup';
import './quoteRequests.scss';
import { AdminBreadcrumbs } from 'zyra';

export default function QuotesList() {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                parentTabName="Quote Requests"
            />
            <div className="admin-table-wrapper" id="quote-list-table">
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
                        <ShowPopup moduleName="Quote" />
                    ) }
                </Dialog>
                <div
                    className="quote-img"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
}
