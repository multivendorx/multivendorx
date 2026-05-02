import { useState } from 'react';

import './Rules.scss';
import { NavigatorHeader, PopupUI } from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';

const Rules = () => {
    const [openPopup, setopenPopup] = useState(false);

    return (
        <div id="rules-list-table">
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
                headerIcon="rules"
                headerDescription={__(
                    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, facere atque alias quasi aperiam nesciunt.',
                    'catalogx'
                )}
                headerTitle={__('Rules', 'catalogx')}
            />
            <div
                className="dynamic-rule-img image-wrapper"
                onClick={() => {
                    setopenPopup(true);
                }}
            ></div>
        </div>
    );
};

export default Rules;
