import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import ShowPopup from '../Popup/Popup';
import './wholesaleUser.scss';
import { AdminBreadcrumbs } from 'zyra';

const WholesaleUser = () => {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div id="wholesale-list-table">
                <AdminBreadcrumbs
                    activeTabIcon="adminlib-cart"
                    parentTabName="All Wholesale Users"
                />
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
                    className="admin-table-wrapper olesale-user-image"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
};

export default WholesaleUser;
