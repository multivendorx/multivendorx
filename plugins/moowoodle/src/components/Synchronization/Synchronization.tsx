import React from 'react';
import { __ } from '@wordpress/i18n';
import SettingsNavigator from '../SettingsNavigator/SettingsNavigator';

interface SettingsProps {
	id: string;
}

/** Synchronization screen. The tabs are the `*.ts` files in this folder (collected by services/templateService.ts). */
const Synchronization: React.FC<SettingsProps> = () => (
	<SettingsNavigator
		type="synchronization"
		title={__('Synchronization', 'moowoodle')}
	/>
);

export default Synchronization;
