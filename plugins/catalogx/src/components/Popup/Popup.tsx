import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { ProPopup } from 'zyra';
import './Popup.scss';

interface PopupProps {
    moduleName?: string;
}

export const proPopupContent = {
    proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
    title: __(
        'Unlock revenue-boosting features with CatalogX Pro today!',
        'catalogx'
    ),
    messages: [
        {
            icon: 'popup-icon-personalized-pricing',
            text: __( 'Send custom quotes', 'catalogx' ),
        },
        {
            icon: 'popup-icon-multiple-products exclusive-forms',
            text: __( 'Multi-product enquiry cart', 'catalogx' ),
        },
        {
            icon: 'popup-icon-add-file-uploads',
            text: __( 'File uploads & custom enquiry fields', 'catalogx' ),
        },
        {
            icon: 'popup-icon-different-users',
            text: __( 'Role-based pricing', 'catalogx' ),
        },
        {
            icon: 'popup-icon-discounts',
            text: __( 'Category-based discounts', 'catalogx' ),
        },
        {
            icon: 'popup-icon-wholesale-order',
            text: __( 'Wholesale order forms', 'catalogx' ),
        },
        {
            icon: 'popup-icon-out-of-stock',
            text: __( 'Enquiry for hidden/out-of-stock products', 'catalogx' ),
        },
        {
            icon: 'popup-icon-shortcode',
            text: __( 'Enquiry button via shortcode', 'catalogx' ),
        },
        {
            icon: 'popup-icon-emails',
            text: __( 'Auto-send branded enquiry emails', 'catalogx' ),
        },
        {
            icon: 'popup-icon-dashboard',
            text: __( 'Track all enquiries in one dashboard', 'catalogx' ),
        },
    ],
};

const ShowPopup: React.FC< PopupProps > = ( props ) => {
    const modulePopupContent = {
        moduleName: props.moduleName,
        message: sprintf(
            /* translators: %s: Module name */
            __(
                'This feature is currently unavailable. To activate it, please enable the %s',
                'catalogx'
            ),
            props.moduleName
        ),
        moduleButton: __( 'Enable Now', 'catalogx' ),
        modulePageUrl:
            typeof appLocalizer !== 'undefined'
                ? appLocalizer.module_page_url
                : '#',
    };

    return (
        <>
            { props.moduleName ? (
                <ProPopup { ...modulePopupContent } />
            ) : (
                <ProPopup { ...proPopupContent } />
            ) }
        </>
    );
};

export default ShowPopup;
