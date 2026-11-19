import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { ButtonInput } from '@zyra/inputs';
import { __, sprintf } from '@wordpress/i18n';
import './Popup.scss';
import { UTM } from '../../services/links';
/** Everything MooWoodle Pro adds, in the order the popup lists it. Also listed by Settings → License (ProPitch). */
export const PRO_FEATURES = [
    {
        icon: 'bulk-course-sync',
        name: __('Bulk Course Sync', 'moowoodle'),
        desc: __('Sync multiple Moodle™ courses to WordPress with one click.', 'moowoodle'),
    },
    {
        icon: 'classroom-enrollment',
        name: __('Cohort Enrollment', 'moowoodle'),
        desc: __('Sell and enroll entire Moodle™ cohorts via WooCommerce.', 'moowoodle'),
    },
    {
        icon: 'cohort',
        name: __('Group Enrollment', 'moowoodle'),
        desc: __('Map course variations to Moodle™ groups for targeted enrollment.', 'moowoodle'),
    },
    {
        icon: 'global-community',
        name: __('Classroom Enrollment', 'moowoodle'),
        desc: __('Buy multiple seats and assign them to students or teams.', 'moowoodle'),
    },
    {
        icon: 'gift-a-course',
        name: __('Gift a Course', 'moowoodle'),
        desc: __('Let customers purchase and gift courses to others.', 'moowoodle'),
    },
    {
        icon: 'single-sign-on',
        name: __('Single Sign-On (SSO)', 'moowoodle'),
        desc: __('Access Moodle™ and WordPress with one login.', 'moowoodle'),
    },
    {
        icon: 'bulk-course-sync',
        name: __('Smart Course Sync', 'moowoodle'),
        desc: __('Keep course details updated between Moodle™ and WordPress.', 'moowoodle'),
    },
    {
        icon: 'subscription-courses',
        name: __('Subscription Courses', 'moowoodle'),
        desc: __('Offer courses with recurring subscription plans.', 'moowoodle'),
    },
    {
        icon: 'user-network-icon',
        name: __('Unified Access', 'moowoodle'),
        desc: __('Give learners one dashboard for all their courses.', 'moowoodle'),
    },
];
/** License tiers: how many sites, the price, and the add-to-cart link. */
export const LICENSES = [
    {
        id: 'one',
        label: __('1 site', 'moowoodle'),
        price: '$199',
        link: `https://dualcube.com/product/moowoodle-pro/?add-to-cart=18156&${UTM}`,
    },
    {
        id: 'three',
        label: __('3 sites', 'moowoodle'),
        price: '$349',
        link: `https://dualcube.com/product/moowoodle-pro/?add-to-cart=18158&${UTM}`,
    },
    {
        id: 'ten',
        label: __('10 sites', 'moowoodle'),
        price: '$499',
        link: `https://dualcube.com/product/moowoodle-pro/?add-to-cart=18157&${UTM}`,
    },
];
/**
 * The popup zyra's InputRenderer opens when a locked field (`proSetting`, `dependentPlugin`) is clicked, passed as the
 * `Popup` prop of `<InputRenderer>` (components/SettingsNavigator). (MooWoodle Pro's list screens have their own
 * confirmation dialog.)
 *
 * The `plugin` branch says which plugin is required (zyra passes `{ plugin, name, link }`). The default branch is the upgrade prompt: what was asked for
 * first, then everything Pro adds, with the license picker and buy button always in view.
 */
const ShowProPopup = (props) => {
    const [license, setLicense] = useState(LICENSES[0]);
    if (props.plugin) {
        const required = 'string' === typeof props.plugin
            ? { plugin: props.plugin, name: props.plugin }
            : props.plugin;
        return (_jsxs("div", { className: "popup-wrapper", children: [_jsx("div", { className: "popup-header", children: _jsx("i", { className: `adminfont-${required.plugin}` }) }), _jsxs("div", { className: "popup-body", children: [_jsx("div", { className: "module-name", children: sprintf(
                            /* translators: %s: Plugin name. */
                            __('Plugin required: %s', 'moowoodle'), required.name) }), _jsx("div", { className: "module-desc", children: sprintf(
                            /* translators: %s: Plugin name. */
                            __('This feature requires the "%s" plugin to be active.', 'moowoodle'), required.name) }), _jsx(ButtonInput, { position: "center", buttons: [
                                {
                                    icon: 'eye',
                                    text: required.link
                                        ? __('Get the plugin', 'moowoodle')
                                        : __('Manage plugins', 'moowoodle'),
                                    onClick: () => {
                                        // Every admin page lives under /wp-admin/, so `plugins.php` resolves to its plugins screen.
                                        window.open(required.link || 'plugins.php', '_blank');
                                    },
                                },
                            ] })] })] }));
    }
    return (_jsxs("div", { className: "mw-pro-popup", children: [_jsxs("div", { className: "mw-pro-popup-head", children: [_jsxs("span", { className: "mw-pro-popup-pill", children: [_jsx("i", { className: "adminfont-pro-tag", "aria-hidden": "true" }), __('MooWoodle Pro', 'moowoodle')] }), _jsx("h2", { children: __('Your students will love this', 'moowoodle') }), _jsx("p", { children: __('Bulk sync, cohort and group enrollment, single sign-on and subscriptions, in the admin you already use.', 'moowoodle') }), props.feature && (_jsxs("div", { className: "mw-pro-popup-feature", children: [_jsx("span", { className: "mw-pro-popup-icon", children: _jsx("i", { className: `adminfont-${props.feature.icon ?? 'pro-tag'}`, "aria-hidden": "true" }) }), _jsxs("span", { children: [_jsx("strong", { children: sprintf(
                                        /* translators: %s: feature name, e.g. "Cohort Enrollment". */
                                        __('%s is included', 'moowoodle'), props.feature.title) }), props.feature.description] }), _jsx("i", { className: "adminfont-check mw-pro-popup-check", "aria-hidden": "true" })] }))] }), _jsxs("div", { className: "mw-pro-popup-body", children: [_jsx("div", { className: "mw-pro-popup-label", children: __('Everything in Pro', 'moowoodle') }), _jsx("ul", { children: PRO_FEATURES.map((feature) => (_jsxs("li", { children: [_jsx("span", { className: "mw-pro-popup-icon", children: _jsx("i", { className: `adminfont-${feature.icon}`, "aria-hidden": "true" }) }), _jsxs("span", { children: [_jsx("strong", { children: feature.name }), _jsx("span", { children: feature.desc })] })] }, feature.name))) })] }), _jsxs("div", { className: "mw-pro-popup-foot", children: [_jsxs("label", { className: "mw-pro-popup-license", children: [_jsx("span", { className: "mw-pro-popup-price", children: license.price }), _jsx("select", { value: license.id, "aria-label": __('License size', 'moowoodle'), onChange: (event) => {
                                    const chosen = LICENSES.find((item) => item.id === event.target.value);
                                    if (chosen) {
                                        setLicense(chosen);
                                    }
                                }, children: LICENSES.map((item) => (_jsx("option", { value: item.id, children: item.label }, item.id))) }), _jsx("span", { children: __('license', 'moowoodle') })] }), _jsxs("a", { className: "mw-pro-popup-buy", href: license.link, target: "_blank", rel: "noreferrer", children: [__('Upgrade to Pro', 'moowoodle'), _jsx("i", { className: "adminfont-arrow-right", "aria-hidden": "true" })] })] })] }));
};
export default ShowProPopup;
//# sourceMappingURL=Popup.js.map