import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import Popup from '../Popup/Popup';
import './ManagestockTable.scss';

const Managestock: React.FC = () => {
    const [ openDialog, setOpenDialog ] = useState( false );
    return (
        <>
            <div id="manage-stock-table">
                <Dialog
                    className="admin-module-popup"
                    open={ openDialog }
                    onClose={ () => {
                        setOpenDialog( false );
                    } }
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminfont-cross"
                        onClick={ () => setOpenDialog( false ) }
                    ></span>
                    <Popup />
                </Dialog>
                <div
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                    className="inventory-manager"
                ></div>
            </div>
        </>
    );
};

export default Managestock;
