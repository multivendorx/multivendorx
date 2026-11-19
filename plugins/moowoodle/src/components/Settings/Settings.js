import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { __ } from '@wordpress/i18n';
import SettingsNavigator from '../SettingsNavigator/SettingsNavigator';
/** Settings screen. The tabs are the `*.ts` files in this folder (collected by services/templateService.ts). */
const Settings = () => (_jsx(SettingsNavigator, { type: "settings", title: __('Settings', 'moowoodle') }));
export default Settings;
//# sourceMappingURL=Settings.js.map