// External dependencies
import React from 'react';

// Internal dependencies
import "../styles/web/UI/SuccessNotice.scss";

interface SuccessNoticeProps {
    message?: string; // message to display
    title?: string;
    iconClass?: string;
}

const SuccessNotice: React.FC< SuccessNoticeProps > = ( {
    message,
    title = 'Great!',
    iconClass = 'adminfont-icon-yes',
} ) => {
    if ( ! message ) {
        return null;
    } // render nothing if no message

    return (
        <div className="admin-notice-wrapper">
            <i className={ `admin-font ${ iconClass }` }></i>
            <div className="notice-details">
                <div className="title">{ title }</div>
                <div className="desc">{ message }</div>
            </div>
        </div>
    );
};

export default SuccessNotice;
