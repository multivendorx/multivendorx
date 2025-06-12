import React, { useState } from "react";
import { Dialog } from "@mui/material";
import Popup from "../Popup/Popup";
import "./ManagestockTable.scss";
import { __ } from "@wordpress/i18n";

const Managestock: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);
    return (
        <>
            {!appLocalizer.khali_dabba ? (
                //If the user is free user he will be shown a Inventory Manager image
                <div className="inventory-manager-wrapper">
                    <Dialog
                        className="admin-module-popup"
                        open={openDialog}
                        onClose={() => {
                            setOpenDialog(false);
                        }}
                        aria-labelledby="form-dialog-title"
                    >
                        <span
                            className="admin-font adminLib-cross stock-manager-popup-cross"
                            onClick={() => {
                                setOpenDialog(false);
                            }}
                        ></span>
                        <Popup />
                    </Dialog>
                    <div
                        onClick={() => {
                            setOpenDialog(true);
                        }}
                        className="inventory-manager"
                    ></div>
                </div>
            ) : (
                <div id="manage_stock_table"></div>
            )}
        </>
    );
};

export default Managestock;
