/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ProPopup } from 'zyra';

const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Boost to Product Notifima Pro to access premium features!',
        'notifima'
    ),
    messages: [
        __('Double Opt-in.', 'notifima'),
        __('Ban Spam Mail.', 'notifima'),
        __('Export Subscribers.', 'notifima'),
        __('Subscription Dashboard.', 'notifima'),
        __('MailChimp Integration.', 'notifima'),
        __('Recaptcha Support.', 'notifima'),
        __('Subscription Details.', 'notifima'),
        __('Notifima Dashboard.', 'notifima'),
        __('Export/Import Stock.', 'notifima'),
    ],
};

const ShowProPopup: React.FC = () => {
    return <ProPopup {...proPopupContent} />;
};

export default ShowProPopup;
