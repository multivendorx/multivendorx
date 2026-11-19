import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { PopupComponent } from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import ShowProPopup, { LICENSES } from '../Popup/Popup';
import './free-vs-pro.scss';
const sections = [
    {
        title: __('Power your Moodle eLearning platform', 'moowoodle'),
        features: [
            {
                name: __('Connect Moodle with WordPress', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('WooCommerce course selling', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Course synchronization', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Course category synchronization', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('One-click enrollment', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Student enrollment management', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Moodle test connection', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Log viewer & debugging tools', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Course listing management', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Multilingual support', 'moowoodle'),
                free: true,
                pro: true,
            },
        ],
    },
    {
        title: __('Manage courses with advanced controls', 'moowoodle'),
        features: [
            {
                name: __('Import courses as draft', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Course status control', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Course image synchronization', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Course group synchronization', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Automatically create new products', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Automatically update existing products', 'moowoodle'),
                free: false,
                pro: true,
            },
        ],
    },
    {
        title: __('Synchronize users and access seamlessly', 'moowoodle'),
        features: [
            {
                name: __('Basic user synchronization', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Real-time user synchronization', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Bidirectional synchronization', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('User profile field mapping', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Existing user synchronization', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Single Sign-On (SSO)', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Synced login/logout between Moodle & WordPress', 'moowoodle'),
                free: false,
                pro: true,
            },
        ],
    },
    {
        title: __('Sell courses your way', 'moowoodle'),
        features: [
            {
                name: __('Individual course enrollment', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Classroom / multi-seat enrollment', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Cohort enrollment', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Group enrollment via variations', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Course gifting', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Seat reassignment', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Bulk student enrollment', 'moowoodle'),
                free: false,
                pro: true,
            },
        ],
    },
    {
        title: __('Flexible pricing and subscriptions', 'moowoodle'),
        features: [
            {
                name: __('One-time course purchase', 'moowoodle'),
                free: true,
                pro: true,
            },
            {
                name: __('Tiered course access', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Subscription-based courses', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Tiered subscription support', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Bundled courses', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Multiple pricing models', 'moowoodle'),
                free: false,
                pro: true,
            },
            {
                name: __('Course variations support', 'moowoodle'),
                free: false,
                pro: true,
            },
        ],
    },
];
/** Counts, for the hero: what Free includes, and how many more Pro adds on top. */
const allFeatures = sections.flatMap((section) => section.features);
const freeCount = allFeatures.filter((feature) => feature.free).length;
const proOnlyCount = allFeatures.length - freeCount;
/** A Free/Pro cell: a mark for sighted readers, and the words for screen readers. */
const Cell = ({ value, pro = false, }) => {
    if ('string' === typeof value) {
        return _jsx(_Fragment, { children: value });
    }
    return value ? (_jsxs("span", { className: `mw-fvp-yes${pro ? ' is-pro' : ''}`, children: [_jsx("i", { className: "adminfont-check", "aria-hidden": "true" }), _jsx("span", { className: "screen-reader-text", children: __('Included', 'moowoodle') })] })) : (_jsxs("span", { className: "mw-fvp-no", children: [_jsx("span", { "aria-hidden": "true", children: "\u2014" }), _jsx("span", { className: "screen-reader-text", children: __('Not included', 'moowoodle') })] }));
};
/**
 * Dashboard → Free vs Pro (free sites only): what Pro adds, feature by feature. One upgrade button at the top and one
 * at the end, both opening the Pro popup (features, plans, buy) like every other upgrade button in MooWoodle.
 */
const FreeVsProTab = () => {
    const [open, setOpen] = useState(false);
    const lowestPrice = LICENSES[0]?.price;
    const upgradeButton = (className = '') => (_jsxs("button", { type: "button", className: `admin-btn mw-upgrade-btn mw-fvp-upgrade ${className}`.trim(), onClick: () => setOpen(true), children: [_jsx("i", { className: "adminfont-pro-tag", "aria-hidden": "true" }), __('Upgrade to Pro', 'moowoodle')] }));
    return (_jsxs("div", { className: "mw-fvp", children: [_jsxs("section", { className: "mw-fvp-hero", children: [_jsxs("div", { className: "mw-fvp-hero-text", children: [_jsxs("span", { className: "mw-fvp-pill", children: [_jsx("i", { className: "adminfont-pro-tag", "aria-hidden": "true" }), __('MooWoodle Pro', 'moowoodle')] }), _jsx("h2", { children: __('Everything in Free, plus the tools to sell to groups, subscribers and classrooms', 'moowoodle') }), _jsx("p", { children: __('Keep every course, product and enrollment you have today. Pro adds automation, Single Sign-On and new ways to sell on top.', 'moowoodle') }), _jsxs("div", { className: "mw-fvp-hero-actions", children: [upgradeButton('is-large'), lowestPrice && (_jsx("span", { className: "mw-fvp-price", children: sprintf(
                                        /* translators: %s: lowest Pro license price, e.g. $199. */
                                        __('Plans from %s', 'moowoodle'), lowestPrice) }))] }), _jsxs("p", { className: "mw-fvp-guarantee", children: [_jsx("i", { className: "adminfont-security", "aria-hidden": "true" }), __('15-day money-back guarantee', 'moowoodle')] })] }), _jsxs("dl", { className: "mw-fvp-stats", children: [_jsxs("div", { children: [_jsx("dt", { children: __('Included in Free', 'moowoodle') }), _jsx("dd", { children: freeCount })] }), _jsxs("div", { className: "is-pro", children: [_jsx("dt", { children: __('More with Pro', 'moowoodle') }), _jsxs("dd", { children: ["+", proOnlyCount] })] })] })] }), _jsxs("section", { className: "mw-fvp-compare", "aria-labelledby": "mw-fvp-compare-title", children: [_jsxs("header", { className: "mw-fvp-compare-head", children: [_jsx("h3", { id: "mw-fvp-compare-title", children: __('Compare feature by feature', 'moowoodle') }), _jsx("p", { children: __('Pro includes every Free feature. Rows marked Pro only are what you unlock.', 'moowoodle') })] }), _jsxs("table", { className: "mw-fvp-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: _jsx("span", { className: "screen-reader-text", children: __('Feature', 'moowoodle') }) }), _jsx("th", { scope: "col", children: __('Free', 'moowoodle') }), _jsx("th", { scope: "col", className: "is-pro", children: __('Pro', 'moowoodle') })] }) }), sections.map((section) => {
                                const added = section.features.filter((feature) => !feature.free).length;
                                return (_jsxs("tbody", { children: [_jsxs("tr", { className: "mw-fvp-group", children: [_jsxs("th", { scope: "rowgroup", colSpan: 2, children: [section.title, added > 0 && (_jsx("span", { className: "mw-fvp-added", children: sprintf(
                                                            /* translators: %d: number of features only in Pro. */
                                                            __('+%d with Pro', 'moowoodle'), added) }))] }), _jsx("td", { className: "is-pro", "aria-hidden": "true" })] }), section.features.map((feature) => (_jsxs("tr", { className: feature.free ? '' : 'is-pro-only', children: [_jsxs("th", { scope: "row", children: [feature.name, !feature.free && (_jsx("span", { className: "mw-fvp-tag", children: __('Pro only', 'moowoodle') }))] }), _jsx("td", { children: _jsx(Cell, { value: feature.free }) }), _jsx("td", { className: "is-pro", children: _jsx(Cell, { value: feature.pro, pro: true }) })] }, feature.name)))] }, section.title));
                            })] })] }), _jsxs("section", { className: "mw-fvp-cta", children: [_jsxs("div", { children: [_jsx("h3", { children: sprintf(
                                /* translators: %d: number of features only in Pro. */
                                __('Unlock all %d Pro features today', 'moowoodle'), proOnlyCount) }), _jsx("p", { children: __('Every plan includes every Pro feature. Plans differ only in how many sites you activate.', 'moowoodle') })] }), upgradeButton('is-light')] }), open && (_jsx(PopupComponent, { position: "lightbox", open: true, onClose: () => setOpen(false), width: 46, height: "auto", children: _jsx(ShowProPopup, {}) }))] }));
};
export default FreeVsProTab;
//# sourceMappingURL=FreeVsProTab.js.map