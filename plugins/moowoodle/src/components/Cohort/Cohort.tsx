import React, { useState } from 'react';
import ProPopup from '../Popup/Popup';
import { Dialog } from '@mui/material';
import './cohorts.scss';
import { AdminBreadcrumbs } from 'zyra';
import { __ } from '@wordpress/i18n';

const Cohort: React.FC = () => {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div id="cohort-list-table">
                <Dialog
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
                </Dialog>
                <AdminBreadcrumbs
                    activeTabIcon="adminlib-cohort"
                    tabTitle={ __( 'Cohorts', 'moowoodle' ) }
                    description={ __(
                        'Cohort information is presented with associated products and student enrollments to support administrative actions.',
                        'moowoodle'
                    ) }
                />
                <div
                    className="cohort-img image-wrapper"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
};

export default Cohort;
