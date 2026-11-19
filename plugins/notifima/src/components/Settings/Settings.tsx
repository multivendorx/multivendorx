import React from 'react';
import { __ } from '@wordpress/i18n';
import SettingsNavigator from '../SettingsNavigator/SettingsNavigator';

interface SettingsProps {
	id: string;
}

/** Settings screen. The tabs are the `*.ts` files in this folder (collected by services/templateService.ts). */
const Settings: React.FC<SettingsProps> = () => (
	<SettingsNavigator type="settings" title={__('Settings', 'notifima')} />
);

export default Settings;
