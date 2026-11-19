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
import PluginModules from '../Modules/Modules';
import useCollapsibleMenu from './useCollapsibleMenu';

type NavigatorType = 'settings';

// zyra's helpers and components type the same tab list three ways (`getAvailableSettings()` returns `Setting[]`,
// `NavigatorComponent` takes `SettingContent[]`, `InputRenderer` takes a `SettingsType`), though at runtime they are
// one object. These name each boundary so the casts below are the only places the mismatch is papered over.
type SettingsList = ReturnType<typeof getAvailableSettings>;
type RendererSettings = ComponentProps<typeof InputRenderer>['settings'];
type NavigatorContent = ComponentProps<
	typeof NavigatorComponent
>['settingContent'];

/** A sub-tab of a settings tab: one screen of a tab drawn as a settings folder, showing only some of its sections. */
interface SubTab {
	id: string;
	label: string;
	icon?: string;
	/** Keys of the `section` fields it shows; each section brings the fields that follow it. */
	sections: string[];
}

type TabConfig = {
	id: string;
	headerTitle: string;
	headerIcon?: string;
	modal?: { key: string; type?: string }[];
	subTabs?: SubTab[];
	/** Set on a sub-tab's screen: the tab whose settings it reads and saves. */
	storageId?: string;
	[prop: string]: unknown;
};

type SettingsNode = {
	name?: string;
	type: string;
	content: TabConfig | SettingsNode[];
	headerIcon?: string;
};

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

/**
 * Draws every tab that has `subTabs` as a zyra settings folder: the menu shows the tab, a strip above the cards lists
 * its sub-tabs, and the breadcrumb and title follow the open one (Settings / Enquiry & Quote / Form behaviour). Each
 * sub-tab is a screen of its own (`subtab=<sub-tab id>`) but keeps the tab's `storageId`, so the tab's values are still
 * one option, saved whole.
 */
const expandSubTabs = (nodes: SettingsNode[]): SettingsNode[] =>
	nodes.map((node) => {
		if ('folder' === node.type) {
			return {
				...node,
				content: expandSubTabs(node.content as SettingsNode[]),
			};
		}

		const tab = node.content as TabConfig;

		if ('file' !== node.type || !tab.subTabs?.length) {
			return node;
		}

		return {
			name: tab.headerTitle,
			type: 'folder',
			headerIcon: tab.headerIcon,
			content: tab.subTabs.map((subTab) => ({
				name: subTab.id,
				type: 'file',
				content: {
					...tab,
					id: subTab.id,
					headerTitle: subTab.label,
					headerIcon: subTab.icon ?? tab.headerIcon,
					modal: fieldsOfSubTab(tab.modal ?? [], subTab),
					subTabs: undefined,
					storageId: tab.id,
				},
			})),
		};
	});

/**
 * The screen a `subtab=` value opens. A tab drawn as a folder opens its first sub-tab, so links to the tab itself
 * (`subtab=<tab id>`) keep working.
 */
const resolveOpenTab = (
	tabs: SettingsNode[],
	openTab: string | null
): string | null => {
	for (const node of tabs) {
		if ('folder' === node.type) {
			const children = node.content as SettingsNode[];
			const subTabs = children.map((child) => child.content as TabConfig);

			if (openTab && subTabs[0]?.storageId === openTab) {
				return subTabs[0].id;
			}

			const nested = resolveOpenTab(children, openTab);

			if (nested !== openTab) {
				return nested;
			}
		}
	}

	return openTab;
};

interface SettingsFormProps {
	currentTab: string;
	settingsArray: SettingsList;
	onSaveStatusChange: (status: SaveStatus) => void;
}

/**
 * One tab's fields. When the tab changes, an effect copies that tab's stored values (`appLocalizer.settings_databases_value`)
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
				storageId?: string;
		  })
		| null;

	// A sub-tab's screen reads and saves its parent tab's values (`storageId`); other screens are their own tab.
	const storageId = settingModal?.storageId ?? currentTab;

	useEffect(() => {
		if (settingName !== storageId) {
			setSetting(
				storageId,
				appLocalizer.settings_databases_value[storageId] || {}
			);
		}
	}, [storageId, settingName, setSetting]);

	useEffect(() => {
		if (settingName === storageId) {
			appLocalizer.settings_databases_value[settingName] = setting;
		}
	}, [setting, settingName, storageId]);

	// Settings → Modules is the module grid, not a form of its own.
	if ('modules' === currentTab) {
		return <PluginModules />;
	}

	// A tab with no fields of its own and a `PanelComponent` (License) draws that panel instead of
	// the declarative field form.
	const PanelComponent = settingModal?.PanelComponent;

	if (PanelComponent && !settingModal?.modal?.length) {
		return <PanelComponent />;
	}

	if (settingName !== storageId) {
		return <>{__('Loading…', 'catalogx')}</>;
	}

	// Keyed by screen: moving between sub-tabs of one tab gives each its own fresh form.
	return (
		<InputRenderer
			key={currentTab}
			// zyra saves a form under `settings.id`: a sub-tab saves as its parent tab, so both share one option.
			settings={{ ...settingModal, id: storageId } as RendererSettings}
			appLocalizer={appLocalizer}
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
	/** Which folder of tab files to show (`src/components/Settings`). */
	type: NavigatorType;
	/** The page title, also the root of the breadcrumb. */
	title: string;
}

/**
 * A settings screen: a sticky menu of the tabs on the left, the open tab's sections as cards on the right, and a
 * "Saved" indicator in the page header.
 */
const SettingsNavigator: React.FC<SettingsNavigatorProps> = ({
	type,
	title,
}) => {
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
	const { menuClassName, menuToggle } = useCollapsibleMenu();
	const settingsArray = expandSubTabs(
		getAvailableSettings(
			getTemplateData(type),
			[]
		) as unknown as SettingsNode[]
	) as unknown as SettingsList;
	const location = new URLSearchParams(useLocation().hash.substring(1));
	const openTab = resolveOpenTab(
		settingsArray as unknown as SettingsNode[],
		location.get('subtab')
	);
	// A panel tab (License) and the module grid save nothing through the form, so the header shows no "Changes save
	// automatically" status there.
	const openTabConfig = openTab
		? (getSettingById(settingsArray, openTab) as unknown as {
				PanelComponent?: unknown;
			} | null)
		: null;
	const isPanelTab =
		'modules' === openTab || !!openTabConfig?.PanelComponent;

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
				currentSetting={openTab as string}
				getForm={getForm}
				prepareUrl={(subTab: string) =>
					`?page=catalogx#&tab=${type}&subtab=${subTab}`
				}
				Link={Link}
				settingName={title}
				// `admin-settings` is the class zyra scopes its settings spacing under; `catalogx-settings` is the
				// one styles/design-system.scss draws the section menu and cards with.
				className={`admin-settings catalogx-settings ${menuClassName}`}
				customContent={menuToggle}
				menuIcon
				saveStatus={isPanelTab ? undefined : saveStatus}
			/>
		</SettingProvider>
	);
};

export default SettingsNavigator;
