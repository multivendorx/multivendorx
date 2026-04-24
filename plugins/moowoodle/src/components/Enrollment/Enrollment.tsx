import React, { useState } from 'react';
import { NavigatorHeader, PopupUI } from 'zyra';
import { __ } from '@wordpress/i18n';
import ShowProPopup from '../Popup/Popup';
import '../common.scss';

const Enrollment: React.FC = () => {
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
                headerIcon="form"
                headerTitle={__('All Enrollments', 'moowoodle')}
                headerDescription={__(
                    'Enrollment records are presented, showing students, their courses, enrollment dates, and current status.',
                    'moowoodle'
                )}
            />
            <div
                className="enrollment-img image-wrapper"
                onClick={() => {
                    setopenPopup(true);
                }}
            ></div>
        </>
    );
};

export default Enrollment;
