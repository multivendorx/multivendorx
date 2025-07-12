import React, { useState } from 'react';
import { useModules } from 'zyra';

import './Rules.scss';
import Dialog from '@mui/material/Dialog';
import ShowPopup from '../Popup/Popup';
// import "../AdminLibrary/CustomTable/table.scss";

const Rules = () => {
    // Check pro is active and module is active or not.
    const { modules }: { modules: string[] } = useModules();

    // State variable declearation
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <main
                className="catalog-rules-main-container"
                id="rules-list-table"
            >
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
                    className="dynamic-rule-img"
                    style={
                        {
                            '--url': `url(${ appLocalizer.dynamic_rules_bg })`,
                        } as any
                    }
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </main>
        </>
    );
};

export default Rules;
