import { useState } from 'react';

import { NavigatorHeader, PopupUI } from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';

const Rules = () => {
    const [openPopup, setopenPopup] = useState(false);

    if (appLocalizer.khali_dabba) {
        return <div id="rules-list-table"></div>;
    }

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
                    'Create and manage rules to control product visibility, pricing behavior, and catalog conditions.',
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
