import React, { useState } from 'react';

import './Rules.scss';
import Dialog from '@mui/material/Dialog';
import ShowPopup from '../Popup/Popup';
import { AdminBreadcrumbs } from 'zyra';

const Rules = () => {
    // State variable declearation
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <main
                className="catalog-rules-main-container"
                id="rules-list-table"
            >
                <AdminBreadcrumbs
                    activeTabIcon="adminlib-cart"
                    parentTabName="Rules"
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
                        <ShowPopup moduleName="Rules" />
                    ) }
                </Dialog>
                <div
                    className="admin-table-wrapper dynamic-rule-img"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </main>
        </>
    );
};

export default Rules;
