import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* global appLocalizer */
import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import ProPitch from './ProPitch';
import './license-panel.scss';
/** The section-card frame every settings tab is drawn in (styles/design-system.scss). */
const Card = ({ icon, title, desc, children }) => (_jsxs("div", { className: "settings-section-group mw-license", children: [_jsx("div", { className: "settings-left-section", children: _jsxs("div", { className: "divider-section", children: [_jsx("div", { className: "title-wrapper", children: _jsxs("span", { className: "typography-title", children: [_jsx("i", { className: `adminfont-${icon}`, "aria-hidden": "true" }), _jsx("span", { children: title })] }) }), _jsx("span", { className: "typography-desc", children: desc })] }) }), _jsx("div", { className: "settings-right-section", children: children })] }));
/** A settings row: label and help on the left, the control on the right. */
const Row = ({ label, htmlFor, children }) => (_jsxs("div", { className: "form-group row", children: [_jsx("div", { className: "settings-form-label", children: _jsx("label", { className: "typography-title", htmlFor: htmlFor, children: label }) }), _jsx("div", { className: "settings-input-content", children: children })] }));
/**
 * Settings → License: the MooWoodle Pro license form, moved here from Pro's old License submenu.
 *
 * It is the old Settings API form, field for field (same option group, nonce, field names and values), submitted
 * natively to options.php: the license is activated or deactivated by the same callbacks as before, and options.php
 * redirects back to this tab, where Pro's activation notice reports the result at the top of the page.
 */
const LicensePanel = () => {
    const form = appLocalizer.pro_data?.license;
    // options.php adds `settings-updated=true` when it redirects back; drop it so a reload doesn't keep it around.
    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.has('settings-updated')) {
            url.searchParams.delete('settings-updated');
            window.history.replaceState(null, '', url.toString());
        }
    }, []);
    if (!form || !form.action_url) {
        // Without MooWoodle Pro there is no form to fill in: say what Pro adds, what it costs, and how to install it.
        return _jsx(ProPitch, {});
    }
    const { strings } = form;
    return (_jsxs("form", { method: "post", action: form.action_url, children: [Object.entries(form.hidden).map(([name, value]) => (_jsx("input", { type: "hidden", name: name, value: value }, name))), _jsxs(Card, { icon: "lock", title: form.title, desc: form.is_active
                    ? __('Pro features are active on this site. Deactivate to free this activation for another site.', 'moowoodle')
                    : __('Enter the API key from your account to unlock the Pro features on this site.', 'moowoodle'), children: [_jsx(Row, { label: strings.status, children: _jsx("span", { className: `mw-license-status ${form.is_active ? 'is-active' : 'is-inactive'}`, children: form.is_active
                                ? strings.activated
                                : strings.deactivated }) }), form.fields.map((field, index) => (_jsx(Row, { label: field.label, htmlFor: `mw-license-field-${index}`, children: _jsx("div", { className: "input-wrapper", children: _jsx("input", { id: `mw-license-field-${index}`, className: "basic-input", type: "text", name: field.name, defaultValue: field.value, 
                                // The key is only replaced while deactivated; an active license is deactivated as is.
                                readOnly: form.is_active || form.is_staging, autoComplete: "off", spellCheck: false }) }) }, field.name))), !form.is_staging && (_jsx(Row, { label: "", children: _jsx("button", { type: "submit", className: `admin-btn ${form.is_active ? 'btn-purple' : 'btn-purple-bg'}`, children: form.is_active
                                ? strings.deactivate
                                : strings.activate }) }))] })] }));
};
export default LicensePanel;
//# sourceMappingURL=LicensePanel.js.map