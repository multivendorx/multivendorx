import React, { useState } from 'react';
import '../common.scss';
import { __ } from '@wordpress/i18n';
import { NavigatorHeader, PopupUI } from 'zyra';
import ShowProPopup from '../Popup/Popup';

const Cohort: React.FC = () => {
    const [openPopup, setopenPopup] = useState(false);

    return (
        <>
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
                    setopenPopup(true);
                }}
            ></div>
        </>
    );
};

export default Cohort;
