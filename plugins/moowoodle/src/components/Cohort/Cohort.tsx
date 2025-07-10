import React, { useState } from 'react';
import ProPopup from '../Popup/Popup';
import { Dialog } from '@mui/material';
import './cohorts.scss';

const Cohort: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);

    return (
        <>
            <div id="cohort-list-table">
                <Dialog
                    className="admin-module-popup"
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminlib-cross"
                        onClick={() => setOpenDialog(false)}
                    ></span>
                    <ProPopup />
                </Dialog>
                <div
                    className="cohort-img"
                    style={{ '--url': `url(${appLocalizer.cohort_list})` } as any}
                    onClick={() => {
                        setOpenDialog(true);
                    }}
                ></div>
            </div>
        </>
    );
};

export default Cohort;
