/* global appLocalizer */
import React, { useEffect } from 'react';
import { SettingProvider } from '../../contexts/SettingContext';
import { getTemplateData } from '../../services/templateService';

import { getAvailableSettings } from '@zyra/core';
import { NavigatorComponent } from '@zyra/components';
import { useLocation, Link } from 'react-router-dom';
import EventRules from './Notification/EventRules.tsx';
import StoreStatus from './StoreConfiguration/StoreStatus.tsx';
import Invoice from './StoreConfiguration/Invoice';
import RegistrationFormPanel from '../VuloForm/RegistrationFormPanel';
import ProductCompliance from './Privacy & Compliance/ProductCompliance.tsx';
import PluginModules from '../Modules/Modules.tsx';
import LicensePanel from '../License/LicensePanel';
import SettingsForm from './SettingsForm';
import useCollapsibleMenu from './useCollapsibleMenu';

interface SettingsProps {
	id: string;
}

// Tabs drawn by a component of their own instead of the declarative form.
const PANELS: Record<string, React.ComponentType> = {
	'event-rules': EventRules,
	'store-status': StoreStatus,
	'product-compliance': ProductCompliance,
	invoices: Invoice,
	modules: PluginModules,
	license: LicensePanel,
};

const Settings: React.FC<SettingsProps> = () => {
	const settingsArray = getAvailableSettings(getTemplateData('settings'), []);
	const location = new URLSearchParams(useLocation().hash.substring(1));
	const { menuClassName, menuToggle } = useCollapsibleMenu();
	const subTab = location.get('subtab');

	// A section with more sub-tabs than fit (Store Configuration has nine) scrolls them sideways; bring the open one into
	// view, so opening e.g. Policies doesn't leave its tab out of sight. Only the tab row scrolls, never the page.
	useEffect(() => {
		const frame = window.requestAnimationFrame(() => {
			const row = document.querySelector<HTMLElement>(
				'.multivendorx-settings .tabs-wrapper.sub-tabs .tabs-item'
			);
			const active = row?.querySelector<HTMLElement>('.active-tab');
			if (!row || !active) {
				return;
			}
			const rowBox = row.getBoundingClientRect();
			const tabBox = active.getBoundingClientRect();
			if (tabBox.left < rowBox.left || tabBox.right > rowBox.right) {
				row.scrollLeft +=
					tabBox.left -
					rowBox.left -
					(rowBox.width - tabBox.width) / 2;
			}
		});
		return () => window.cancelAnimationFrame(frame);
	}, [subTab]);

	return (
		<SettingProvider>
			<NavigatorComponent
				settingContent={settingsArray}
				currentSetting={location.get('subtab') as string}
				getForm={(currentTab: string | null) =>
					currentTab ? (
						<SettingsForm
							currentTab={currentTab}
							settingsArray={settingsArray}
							panels={PANELS}
						/>
					) : null
				}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=settings&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				settingName={'Settings'}
				// `admin-settings` is the class zyra scopes its settings spacing under; `multivendorx-settings` is the one
				// styles/design-system.scss draws the section menu and cards with.
				className={`admin-settings multivendorx-settings ${menuClassName}`}
				customContent={menuToggle}
				menuIcon
			/>
		</SettingProvider>
	);
};

export default Settings;
