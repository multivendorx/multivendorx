/* global appLocalizer */
import React, { useEffect, useState, JSX, type ComponentProps } from 'react';
import { __ } from '@wordpress/i18n';
import { useLocation, Link } from 'react-router-dom';
import { InputRenderer } from '@zyra/inputs';
import {
	getAvailableSettings,
	getSettingById,
	SettingProvider,
	useModules,
	useSetting,
} from '@zyra/core';
import { NavigatorComponent, type SaveStatus } from '@zyra/components';
import { getTemplateData } from '../../services/templateService';
import ShowProPopup from '../Popup/Popup';

type NavigatorType = 'settings' | 'synchronization';

// zyra's helpers and components type the same tab list three ways (`getAvailableSettings()` returns `Setting[]`,
// `NavigatorComponent` takes `SettingContent[]`, `InputRenderer` takes a `SettingsType`), though at runtime they are
// one object. These name each boundary so the casts below are the only places the mismatch is papered over.
type SettingsList = ReturnType<typeof getAvailableSettings>;
type RendererSettings = ComponentProps<typeof InputRenderer>['settings'];
type NavigatorContent = ComponentProps<
	typeof NavigatorComponent
>['settingContent'];

interface SettingsFormProps {
	currentTab: string;
	settingsArray: SettingsList;
	onSaveStatusChange: (status: SaveStatus) => void;
}

/**
 * One tab's fields. When the tab changes, an effect copies that tab's stored values (`appLocalizer.admin_settings`)
 * into the settings context; doing it in the render body would trigger React's "Cannot update a component while
 * rendering a different component" warning and a visible double render.
 */
const SettingsForm: React.FC<SettingsFormProps> = ({
	currentTab,
	settingsArray,
	onSaveStatusChange,
}) => {
	const { setting, settingName, setSetting, updateSetting } = useSetting();
	const { modules } = useModules();
	const settingModal = getSettingById(
		settingsArray,
		currentTab
	) as unknown as (RendererSettings & { groupBySections?: boolean }) | null;

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
	}, [setting, settingName, currentTab]);

	if (settingName !== currentTab) {
		return <>{__('Loading…', 'moowoodle')}</>;
	}

	return (
		<InputRenderer
			settings={settingModal as RendererSettings}
			proSetting={appLocalizer.pro_settings_list}
			setting={setting}
			updateSetting={updateSetting}
			modules={modules}
			Popup={ShowProPopup}
			// A tab opts in to the card-per-section layout with `groupBySections: true`.
			groupBySections={settingModal?.groupBySections}
			onSaveStatusChange={onSaveStatusChange}
		/>
	);
};

interface SettingsNavigatorProps {
	/** Which folder of tab files to show (`src/components/Settings` or `src/components/Synchronization`). */
	type: NavigatorType;
	/** The page title, also the root of the breadcrumb. */
	title: string;
}

/**
 * A settings screen: a sticky menu of the tabs on the left, the open tab's sections as cards on the right, and a
 * "Saved" indicator in the page header. Used by Settings and Synchronization, which differ only in their tab files.
 */
const SettingsNavigator: React.FC<SettingsNavigatorProps> = ({
	type,
	title,
}) => {
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
	const settingsArray = getAvailableSettings(getTemplateData(type), []);
	const location = new URLSearchParams(useLocation().hash.substring(1));

	const getForm = (currentTab: string | null): JSX.Element | null =>
		currentTab ? (
			<SettingsForm
				currentTab={currentTab}
				settingsArray={settingsArray}
				onSaveStatusChange={setSaveStatus}
			/>
		) : null;

	return (
		<SettingProvider>
			<NavigatorComponent
				settingContent={settingsArray as unknown as NavigatorContent}
				currentSetting={location.get('subtab') as string}
				getForm={getForm}
				prepareUrl={(subTab: string) =>
					`?page=moowoodle#&tab=${type}&subtab=${subTab}`
				}
				Link={Link}
				settingName={title}
				// `admin-settings` is the class zyra scopes its settings spacing under; `moowoodle-settings` is the
				// one styles/design-system.scss draws the section menu and cards with.
				className="admin-settings moowoodle-settings"
				menuIcon
				saveStatus={saveStatus}
			/>
		</SettingProvider>
	);
};

export default SettingsNavigator;
