import ProPopup from "../Popup/Popup";
import { useState } from "react";
import "./Enrollment.scss";

import { Dialog } from "@mui/material";
import { __ } from "@wordpress/i18n";

const Enrollment: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);

    return (
        <>
            {!appLocalizer.khali_dabba ? (
                <div>
                    <Dialog
                        className="admin-module-popup"
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        aria-labelledby="form-dialog-title"
                    >
                        <span
                            className="admin-font adminLib-cross stock-manager-popup-cross"
                            onClick={() => setOpenDialog(false)}
                        ></span>
                        <ProPopup />
                    </Dialog>
                    <div
                        className="enrollment-img"
                        onClick={() => {
                            setOpenDialog(true);
                        }}
                    ></div>
                </div>
            ) : (
                <div id="enrollment-list-table"></div>
            )}
        </>
    );
};

export default Enrollment;
