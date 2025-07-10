/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './Popup.scss';
const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.shop_url : '#',
    moreText: __(
        'More surprises? Oh yes.',
        'moowoodle'
    ),
    messages: [
        { icon: 'popup-icon-smart-course-sync', text: __('Bulk Course Sync.', 'moowoodle') },
        { icon: 'popup-icon-classroom-enrollment', text: __('Classroom Enrollment.', 'moowoodle') },
        { icon: 'popup-icon-gift-course', text: __('Gift a Course.', 'moowoodle') },
        { icon: 'popup-icon-sign', text: __('Single Sign-On.', 'moowoodle') },
        { icon: 'popup-icon-course-sync', text: __('Smart Course Sync.', 'moowoodle') },
        { icon: 'popup-icon-subscription-courses', text: __('Subscription Courses.', 'moowoodle') },
        { icon: 'popup-icon-unified-access', text: __('Unified Access.', 'moowoodle') },
    ],
};

const ShowProPopup: React.FC = () => {
    return <ProPopup {...proPopupContent} />;
};

export default ShowProPopup;
