import Dialog from '@mui/material/Dialog';
import React, { useState } from 'react';
import ShowPopup from '../Popup/Popup';
import { useModules } from 'zyra';
import './quoteRequests.scss';
// import '../AdminLibrary/CustomTable/table.scss';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function QuotesList() {
    const { modules }: { modules: string[] } = useModules();
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div
                className="admin-quote-list"
                id="quote-list-table"
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
                        className="admin-font adminlib-cross stock-manager-popup-cross"
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
                    style={
                        {
                            '--url': `url(${ appLocalizer.quote_requests_bg })`,
                        } as any
                    }
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
}
