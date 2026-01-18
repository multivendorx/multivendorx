import Dialog from '@mui/material/Dialog';
import React, { useState } from 'react';
import ShowPopup from '../Popup/Popup';
import './quoteRequests.scss';
import { AdminBreadcrumbs } from 'zyra';

export default function QuotesList() {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div id="quote-list-table">
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
                <AdminBreadcrumbs
                    activeTabIcon="adminlib-quote"
                    tabTitle="Quote Requests"
                    premium={!appLocalizer.khali_dabba}
                    goPremium={!appLocalizer.khali_dabba}
                    goPremiumLink={appLocalizer.pro_url}
                />
                <div
                    className="quote-img image-wrapper"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
}
