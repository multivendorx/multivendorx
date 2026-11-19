import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { __ } from '@wordpress/i18n';
import SettingsNavigator from '../SettingsNavigator/SettingsNavigator';
/** Synchronization screen. The tabs are the `*.ts` files in this folder (collected by services/templateService.ts). */
const Synchronization = () => (_jsx(SettingsNavigator, { type: "synchronization", title: __('Synchronization', 'moowoodle') }));
export default Synchronization;
//# sourceMappingURL=Synchronization.js.map