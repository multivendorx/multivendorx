import React, { useState } from 'react';
import ProPopup from '../Popup/Popup';
import './Enrollment.scss';
import { Dialog } from '@mui/material';
import { AdminBreadcrumbs } from 'zyra';
import { __ } from '@wordpress/i18n';

const Enrollment: React.FC = () => {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div id="enrollment-list-table">
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
                    activeTabIcon="adminlib-form"
                    tabTitle={ __( 'All Enrollments', 'moowoodle' ) }
                    description={ __(
                        'Enrollment records are presented, showing students, their courses, enrollment dates, and current status.',
                        'moowoodle'
                    ) }
                />
                <div
                    className="enrollment-img image-wrapper"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
};

export default Enrollment;
