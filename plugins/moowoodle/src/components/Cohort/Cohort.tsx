import React, { useState } from 'react';
// import ProPopup from '../Popup/Popup';
import { Dialog } from '@mui/material';
import './cohorts.scss';
import { __ } from '@wordpress/i18n';
import { NavigatorHeader } from 'zyra';

const Cohort: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);

    return (
        <>
            {/* <Dialog
                    className="admin-module-popup"
                    open={ openDialog }
                    onClose={ () => setOpenDialog( false ) }
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminlib-cross"
                        onClick={ () => setOpenDialog( false ) }
                    ></span>
                    <ProPopup />
                </Dialog> */}
            <NavigatorHeader
                headerIcon="cohort"
                headerDescription={__(
                    'Cohort information is presented with associated products and student enrollments to support administrative actions.',
                    'moowoodle'
                )}
                headerTitle={__('Cohorts', 'moowoodle')}
            />
            <div
                className="cohort-img image-wrapper"
                onClick={() => {
                    setOpenDialog(true);
                }}
            ></div>
        </>
    );
};

export default Cohort;
