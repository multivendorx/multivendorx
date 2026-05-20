import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import '../common.scss';
import { NavigatorHeader, PopupUI } from 'zyra';
import ShowProPopup from '../Popup/Popup';

const SubscribersList: React.FC = () => {
    const [openPopup, setopenPopup] = useState(false);

    return (
        <>
            <div id='subscriber-list-table'>
                {openPopup && (
                    <PopupUI
                        position="lightbox"
                        open={openPopup}
                        onClose={() => setopenPopup(false)}
                        width={31.25}
                        height="auto"
                    >
                        <ShowProPopup />
                    </PopupUI>
                )}
                <NavigatorHeader
                    headerIcon="quote"
                    headerDescription={__(
                        'This CSV file contains all subscriber data from your site. Upgrade to <a href="https://notifima.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima" target="_blank">Notifima Pro</a> to generate CSV files based on specific products or users.',
                        'notifima'
                    )}
                    headerTitle={__('Download product wise subscriber data', 'notifima')}
                    buttons={[
					{
						label: __('Download CSV', 'notifima'),
						icon: 'plus',
						onClick:  appLocalizer.export_button,
					},
				]}
                />
                <div
                    className="image-wrapper subscriber"
                    onClick={() => {
                        setopenPopup(true);
                    }}
                ></div>
            </div>
        </>
    );
};

export default SubscribersList;