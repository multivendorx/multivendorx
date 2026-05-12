import Popup from '../Popup/Popup';
import { useState } from 'react';
import { Dialog } from '@mui/material';
import { __ } from '@wordpress/i18n';
import './subscribersList.scss';
import { NavigatorHeader } from 'zyra';

const SubscribersList: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);

    return (
        <>
            <div id='subscriber-list-table'>
                <NavigatorHeader
                    headerIcon="quote"
                    headerDescription={__(
                        'This CSV file contains all subscriber data from your site. Upgrade to <a href="https://notifima.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima" target="_blank">Notifima Pro</a> to generate CSV files based on specific products or users.',
                        'catalogx'
                    )}
                    headerTitle={__('Download product wise subscriber data', 'catalogx')}
                    buttons={[
					{
						label: __('Download CSV', 'multivendorx'),
						icon: 'plus',
						onClick:  appLocalizer.export_button,
					},
				]}
                />
                {/* <Dialog
                    className="admin-module-popup"
                    open={openDialog}
                    onClose={() => {
                        setOpenDialog(false);
                    }}
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminlib-cross"
                        onClick={() => setOpenDialog(false)}
                    ></span>
                    <Popup />
                </Dialog> */}
                <div
                    className="subscriber-img"
                    onClick={() => {
                        setOpenDialog(true);
                    }}
                ></div>
            </div>
        </>
    );
};

export default SubscribersList;