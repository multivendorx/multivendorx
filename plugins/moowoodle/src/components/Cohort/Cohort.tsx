/* global appLocalizer */
import React, { useState } from "react";
import ProPopup from "../Popup/Popup";
import { Dialog } from "@mui/material";
import "./cohorts.scss";

const Cohort: React.FC = () => {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            { ! appLocalizer.khali_dabba ? (
                <div>
                    <Dialog
                        className="admin-module-popup"
                        open={ openDialog }
                        onClose={ () => setOpenDialog( false ) }
                        aria-labelledby="form-dialog-title"
                    >
                        <span
                            className="admin-font adminlib-cross stock-manager-popup-cross"
                            onClick={ () => setOpenDialog( false ) }
                        ></span>
                        <ProPopup />
                    </Dialog>
                    <div
                        className="cohort-img"
                        onClick={ () => {
                            setOpenDialog( true );
                        } }
                    ></div>
                </div>
            ) : (
                <div id="cohort-list-table"></div>
            ) }
        </>
    );
};

export default Cohort;
