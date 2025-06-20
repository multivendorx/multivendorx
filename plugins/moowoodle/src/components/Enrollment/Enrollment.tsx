/* global appLocalizer */
import React, { useState } from 'react';
import ProPopup from '../Popup/Popup';
import './Enrollment.scss';
import { Dialog } from '@mui/material';

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
                            className="admin-font adminlib-cross stock-manager-popup-cross"
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
