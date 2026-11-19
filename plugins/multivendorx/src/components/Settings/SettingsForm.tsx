/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { InputRenderer } from '@zyra/inputs';
import { getAvailableSettings, getSettingById, useModules } from '@zyra/core';
import { useSetting } from '../../contexts/SettingContext';
import ShowProPopup from '../Popup/Popup';

type SettingsList = ReturnType<typeof getAvailableSettings>;

interface SettingsFormProps {
	/** The open tab's id (`subtab=` in the URL). */
	currentTab: string;
	/** Every tab of the screen, from getTemplateData(). */
	settingsArray: SettingsList;
	/** Tabs drawn by a component of their own instead of the declarative form (Event Rules, Modules, …). */
	panels?: Record<string, React.ComponentType>;
}

/**
 * Folds the store owner's capabilities (Settings → Store permissions) into `user-permissions`, so no other store
 * role is granted a capability the owner doesn't have.
 *
 * @return The store-permissions setting, for InputRenderer's `storeTabSetting`, or null when not saved yet.
 */
const syncStorePermissions = () => {
	const storeCapability = appLocalizer.admin_settings['store-permissions'];

	if (!storeCapability) {
		return null;
	}

	const storeOwnerCaps: string[] = [];
	Object.values(storeCapability).forEach((caps) => {
		if (Array.isArray(caps)) {
			storeOwnerCaps.push(...caps);
		}
	});

	const userCapability =
		appLocalizer.admin_settings['user-permissions'] || {};
	Object.entries(userCapability).forEach(([role, caps]) => {
		if (role !== 'store_owner' && Array.isArray(caps)) {
			userCapability[role] = caps.filter((cap: string) =>
				storeOwnerCaps.includes(cap)
			);
		}
	});

	appLocalizer.admin_settings['user-permissions'] = {
		...userCapability,
		store_owner: storeOwnerCaps,
	};

	return storeCapability;
};

/**
 * One tab of the Settings screen.
 *
 * zyra's NavigatorComponent calls `getForm()` as a plain function while it renders, so any hook used there would
 * count as NavigatorComponent's own; an early return then changes its hook order ("Rendered more hooks than during
 * the previous render") and a state update there is "setState while rendering a different component". Rendering
 * this component from `getForm()` gives the form hooks of its own, always called in the same order, and copies the
 * tab's stored values into the settings context from an effect, not from the render body.
 */
const SettingsForm: React.FC<SettingsFormProps> = ({
	currentTab,
	settingsArray,
	panels = {},
}) => {
	const { setting, settingName, setSetting, updateSetting } = useSetting();
	const { modules } = useModules();
	const [storeTabSetting, setStoreTabSetting] = useState(null);

	useEffect(() => {
		if (settingName !== currentTab) {
			setSetting(
				currentTab,
				appLocalizer.admin_settings[currentTab] || {}
			);
		}
	}, [currentTab, settingName, setSetting]);

	useEffect(() => {
		if (settingName === currentTab) {
			appLocalizer.admin_settings[settingName] = setting;
		}
		setStoreTabSetting(syncStorePermissions());
	}, [setting, settingName, currentTab]);

	const Panel = panels[currentTab];
	if (Panel) {
		return <Panel />;
	}

	const settingModal = getSettingById(settingsArray, currentTab);

	// A subtab id with no matching settings file (stale bookmark, a renamed setting id) has nothing to render.
	if (!settingModal) {
		return <>{__('Settings not found.', 'multivendorx')}</>;
	}

	if (settingName !== currentTab) {
		return <>{__('Loading...', 'multivendorx')}</>;
	}

	return (
		<InputRenderer
			settings={settingModal}
			proSetting={appLocalizer.pro_settings_list}
			setting={setting}
			updateSetting={updateSetting}
			appLocalizer={appLocalizer}
			modules={modules}
			Popup={ShowProPopup}
			storeTabSetting={storeTabSetting}
			groupBySections={settingModal.groupBySections}
		/>
	);
};

export default SettingsForm;
