/* global appLocalizer */
import React, { useEffect, useState, JSX, type ComponentProps } from 'react';
import { __ } from '@wordpress/i18n';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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

/** A sub-tab of a settings tab: a strip entry that shows only some of the tab's sections. */
interface SubTab {
	id: string;
	label: string;
	icon?: string;
	/** Keys of the `section` fields it shows; each section brings the fields that follow it. */
	sections: string[];
}

/** The fields of the sections a sub-tab lists (a section field and every field after it, up to the next section). */
const fieldsOfSubTab = (
	modal: { key: string; type?: string }[],
	subTab: SubTab
) => {
	let inSection = false;

	return modal.filter((field) => {
		if ('section' === field.type) {
			inSection = subTab.sections.includes(field.key);
		}

		return inSection;
	});
};

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
	) as unknown as
		| (RendererSettings & {
				groupBySections?: boolean;
				PanelComponent?: React.ComponentType;
				subTabs?: SubTab[];
		  })
		| null;

	// Sub-tabs (System & Logs → Connection & Schedule, Logs): the open one is `&view=` in the URL, so it can be linked.
	const location = useLocation();
	const navigate = useNavigate();
	const subTabs = settingModal?.subTabs ?? [];
	const hashParams = new URLSearchParams(location.hash.substring(1));
	const activeSubTab =
		subTabs.find((subTab) => subTab.id === hashParams.get('view')) ??
		subTabs[0];

	// The hash keeps its `#&` form (`#&tab=…&subtab=…&view=…`): app.tsx reads it with URLSearchParams, where the `&`
	// is what stops `#` from becoming part of the first key.
	const openSubTab = (subTabId: string) => {
		hashParams.set('view', subTabId);
		navigate(
			`${location.pathname}${location.search}#&${hashParams.toString()}`,
			{
				replace: true,
			}
		);
	};

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

	// A tab with no fields of its own and a `PanelComponent` (Help & Support, License) draws that panel instead of
	// the declarative field form.
	const PanelComponent = settingModal?.PanelComponent;

	if (PanelComponent && !settingModal?.modal?.length) {
		return <PanelComponent />;
	}

	if (settingName !== currentTab) {
		return <>{__('Loading…', 'moowoodle')}</>;
	}

	// A sub-tab draws only its own sections. The tab's values are still one object (`setting`), saved whole, so
	// changing a field on one sub-tab never drops the other's.
	const renderedSettings = activeSubTab
		? ({
				...settingModal,
				modal: fieldsOfSubTab(
					(settingModal?.modal ?? []) as {
						key: string;
						type?: string;
					}[],
					activeSubTab
				),
			} as unknown as RendererSettings)
		: (settingModal as RendererSettings);

	const form = (
		<InputRenderer
			key={activeSubTab?.id ?? currentTab}
			settings={renderedSettings}
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

	if (!activeSubTab) {
		return form;
	}

	return (
		<>
			<div
				className="mw-sub-tabs"
				role="tablist"
				aria-label={__('Sections', 'moowoodle')}
			>
				{subTabs.map((subTab) => (
					<button
						key={subTab.id}
						type="button"
						role="tab"
						aria-selected={subTab.id === activeSubTab.id}
						className={
							subTab.id === activeSubTab.id ? 'is-active' : ''
						}
						onClick={() => openSubTab(subTab.id)}
					>
						{subTab.icon && (
							<i
								className={`adminfont-${subTab.icon}`}
								aria-hidden="true"
							/>
						)}
						{subTab.label}
					</button>
				))}
			</div>
			<div role="tabpanel">{form}</div>
		</>
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
	const openTab = location.get('subtab');
	// A panel tab (Help & Support, License) saves nothing by itself, so the header shows no "Changes save
	// automatically" status there.
	const isPanelTab = !!(
		openTab &&
		(
			getSettingById(settingsArray, openTab) as unknown as {
				PanelComponent?: unknown;
			} | null
		)?.PanelComponent
	);

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
				saveStatus={isPanelTab ? undefined : saveStatus}
			/>
		</SettingProvider>
	);
};

export default SettingsNavigator;
