import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* global appLocalizer */
import { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { PopupComponent } from '@zyra/components';
import ShowProPopup from './Popup';
import './locked-preview.scss';
/**
 * A Pro-only page while MooWoodle Pro isn't active: the real page drawn with sample rows, dimmed, inert and fading
 * out, with a card floating over it that says the page comes with Pro, the Upgrade button (opens the Pro popup) and a
 * pricing link. Ported from VuloCart's ModuleRequired + LockedPreview (Marketing → Pricing Rules), so both products
 * show a locked page alike.
 *
 * With `heading` and `actions` it is the same preview for a free page that is still empty: that page's own heading and
 * next steps, without the Pro tag.
 */
export function LockedPreview({ children, feature, heading, actions, note, }) {
    const [open, setOpen] = useState(false);
    const isPro = !actions;
    return (_jsxs("div", { className: "mw-locked", children: [_jsx("div", { className: "mw-locked-preview", "aria-hidden": "true", ...{ inert: '' }, children: children }), _jsx("div", { className: "mw-locked-overlay", children: _jsxs("div", { className: "mw-locked-card", children: [isPro ? (_jsxs("span", { className: "admin-tag pro-tag", children: [_jsx("i", { className: "adminfont-pro-tag", "aria-hidden": "true" }), __('Pro', 'moowoodle')] })) : (_jsx("span", { className: "mw-locked-icon", "aria-hidden": "true", children: _jsx("i", { className: `adminfont-${feature.icon ?? 'info'}` }) })), _jsx("h2", { children: heading ??
                                sprintf(
                                /* translators: %s: page title, e.g. "Cohorts". */
                                __('%s comes with MooWoodle Pro', 'moowoodle'), feature.title) }), _jsx("p", { children: feature.description }), _jsx("div", { className: "mw-locked-actions", children: actions ?? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "mw-locked-button", onClick: () => setOpen(true), children: __('Upgrade to Pro', 'moowoodle') }), _jsx("a", { className: "mw-locked-link", href: appLocalizer.shop_url, target: "_blank", rel: "noreferrer", children: __('See pricing', 'moowoodle') })] })) }), _jsxs("p", { className: "mw-locked-note", children: [_jsx("i", { className: "adminfont-eye", "aria-hidden": "true" }), note ??
                                    __('A preview with sample data. Your own records show here once it is on.', 'moowoodle')] })] }) }), open && (_jsx(PopupComponent, { position: "lightbox", open: true, onClose: () => setOpen(false), width: 46, height: "auto", children: _jsx(ShowProPopup, { feature: feature }) }))] }));
}
export default LockedPreview;
//# sourceMappingURL=LockedPreview.js.map