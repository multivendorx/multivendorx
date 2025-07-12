import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import ShowPopup from '../Popup/Popup';
import { useModules } from 'zyra';
import './wholesaleUser.scss';
// import '../AdminLibrary/CustomTable/table.scss';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const WholesaleUser = () => {
    // Check pro is active and module is active or not.
    const { modules }: { modules: string[] } = useModules();
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div
                className="admin-wholesale-list"
                id="wholesale-list-table"
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
                        <ShowPopup moduleName="Wholesale" />
                    ) }
                </Dialog>
                <div
                    className="wholesale-user-image"
                    style={
                        {
                            '--url': `url(${ appLocalizer.wholesale_users_bg })`,
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

export default WholesaleUser;
