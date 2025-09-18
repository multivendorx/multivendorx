/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './popup.scss';

const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Boost to Product Notifima Pro to access premium features!',
        'notifima'
    ),
    moreText: __( 'More surprises? Oh yes.', 'notifima' ),
    messages: [
        {
            icon: 'popup-icon-double-opt-in',
            text: __( 'Double Opt-in.', 'notifima' ),
        },
        {
            icon: 'popup-icon-ban-spam-mail',
            text: __( 'Ban Spam Mail.', 'notifima' ),
        },
        {
            icon: 'popup-icon-export-subscribers',
            text: __( 'Export Subscribers.', 'notifima' ),
        },
        {
            icon: 'popup-icon-subscription-dashboard',
            text: __( 'Subscription Dashboard.', 'notifima' ),
        },
        {
            icon: 'popup-icon-mailchimp',
            text: __( 'MailChimp Integration.', 'notifima' ),
        },
        {
            icon: 'popup-icon-recaptcha',
            text: __( 'Recaptcha Support.', 'notifima' ),
        },
        {
            icon: 'popup-icon-subscription-dashboard',
            text: __( 'Subscription Details.', 'notifima' ),
        },
        {
            icon: 'popup-icon-export-import',
            text: __( 'Export/Import Stock.', 'notifima' ),
        },
    ],
    btnLink: [
        {
            value: '1 site License ($299)',
            link: 'https://multivendorx.com/checkout/'
        },
        {
            value: '3 site License ($399)',
            link: 'https://multivendorx.com/checkout/$399'
        },
        {
            value: '10 site License ($599)',
            link: 'https://multivendorx.com/checkout/$599'
        },
    ]
};

const ShowProPopup: React.FC = () => {
    return <ProPopup { ...proPopupContent } />;
};

export default ShowProPopup;
