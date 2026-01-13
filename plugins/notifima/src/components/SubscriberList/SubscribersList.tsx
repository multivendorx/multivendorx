import Popup from '../Popup/Popup';
import { useState } from 'react';
import { Dialog } from '@mui/material';
import { __ } from '@wordpress/i18n';
import './subscribersList.scss';

const SubscribersList: React.FC = () => {
    const [ openDialog, setOpenDialog ] = useState( false );

    return (
        <>
            <div id='subscriber-list-table'>
                <div className="download-csv-wrapper">
                    <h2 className="section-heading">
                        { __(
                            'Download product wise subscriber data.',
                            'notifima'
                        ) }
                    </h2>
                    <a className='admin-btn btn-purple' href={ appLocalizer.export_button }>
                        { __( 'Download CSV', 'notifima' ) }
                    </a>
                    
                    <p
                        className="description"
                        dangerouslySetInnerHTML={ {
                            __html: "This CSV file contains all subscriber data from your site. Upgrade to <a href='https://notifima.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima' target='_blank'>Notifima Pro</a> to generate CSV files based on specific products or users.",
                        } }
                    ></p>
                </div>
                <Dialog
                    className="admin-module-popup"
                    open={ openDialog }
                    onClose={ () => {
                        setOpenDialog( false );
                    } }
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminfont-cross"
                        onClick={ () => setOpenDialog( false ) }
                    ></span>
                    <Popup />
                </Dialog>
                <div
                    className="subscriber-img"
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </div>
        </>
    );
};

export default SubscribersList;