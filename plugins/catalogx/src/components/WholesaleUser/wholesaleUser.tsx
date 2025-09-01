import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import ShowPopup from '../Popup/Popup';
import './wholesaleUser.scss';
import { AdminBreadcrumbs } from 'zyra';

const WholesaleUser = () => {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                parentTabName="Wholesale User"
            />
            <div className="admin-table-wrapper" id="wholesale-list-table">
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
                        <ShowPopup moduleName="wholesale" />
                    ) }
                </Dialog>
                <div
                    className="wholesale-user-image"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
};

export default WholesaleUser;
