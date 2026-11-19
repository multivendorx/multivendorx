import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useLocation, Link } from 'react-router-dom';
import { InputRenderer } from '@zyra/inputs';
import { getAvailableSettings, getSettingById, SettingProvider, useModules, useSetting, } from '@zyra/core';
import { NavigatorComponent } from '@zyra/components';
import { getTemplateData } from '../../services/templateService';
import ShowProPopup from '../Popup/Popup';
/** The fields of the sections a sub-tab lists (a section field and every field after it, up to the next section). */
const fieldsOfSubTab = (modal, subTab) => {
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
 * its sub-tabs, and the breadcrumb and title follow the open one (Settings / Connection & Access / Connection). Each
 * sub-tab is a screen of its own (`subtab=<sub-tab id>`) but keeps the tab's `storageId`, so the tab's values are still
 * one option, saved whole.
 */
const expandSubTabs = (nodes) => nodes.map((node) => {
    if ('folder' === node.type) {
        return {
            ...node,
            content: expandSubTabs(node.content),
        };
    }
    const tab = node.content;
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
 * (`subtab=connection-access`, `subtab=system-logs`) keep working.
 */
const resolveOpenTab = (tabs, openTab) => {
    for (const node of tabs) {
        if ('folder' === node.type) {
            const children = node.content;
            const subTabs = children.map((child) => child.content);
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
/**
 * One tab's fields. When the tab changes, an effect copies that tab's stored values (`appLocalizer.admin_settings`)
 * into the settings context; doing it in the render body would trigger React's "Cannot update a component while
 * rendering a different component" warning and a visible double render.
 */
const SettingsForm = ({ currentTab, settingsArray, onSaveStatusChange, }) => {
    const { setting, settingName, setSetting, updateSetting } = useSetting();
    const { modules } = useModules();
    const settingModal = getSettingById(settingsArray, currentTab);
    // A sub-tab's screen reads and saves its parent tab's values (`storageId`); other screens are their own tab.
    const storageId = settingModal?.storageId ?? currentTab;
    useEffect(() => {
        if (settingName !== storageId) {
            setSetting(storageId, appLocalizer.admin_settings[storageId] || {});
        }
    }, [storageId, settingName, setSetting]);
    useEffect(() => {
        if (settingName === storageId) {
            appLocalizer.admin_settings[settingName] = setting;
        }
    }, [setting, settingName, storageId]);
    // A tab with no fields of its own and a `PanelComponent` (License) draws that panel instead of
    // the declarative field form.
    const PanelComponent = settingModal?.PanelComponent;
    if (PanelComponent && !settingModal?.modal?.length) {
        return _jsx(PanelComponent, {});
    }
    if (settingName !== storageId) {
        return _jsx(_Fragment, { children: __('Loading…', 'moowoodle') });
    }
    // Keyed by screen: moving between sub-tabs of one tab gives each its own fresh form.
    return (_jsx(InputRenderer, { 
        // zyra saves a form under `settings.id`: a sub-tab saves as its parent tab, so both share one option.
        settings: { ...settingModal, id: storageId }, proSetting: appLocalizer.pro_settings_list, setting: setting, updateSetting: updateSetting, modules: modules, Popup: ShowProPopup, 
        // A tab opts in to the card-per-section layout with `groupBySections: true`.
        groupBySections: settingModal?.groupBySections, onSaveStatusChange: onSaveStatusChange }, currentTab));
};
/**
 * A settings screen: a sticky menu of the tabs on the left, the open tab's sections as cards on the right, and a
 * "Saved" indicator in the page header. Used by Settings and Synchronization, which differ only in their tab files.
 */
const SettingsNavigator = ({ type, title, }) => {
    const [saveStatus, setSaveStatus] = useState('idle');
    const settingsArray = expandSubTabs(getAvailableSettings(getTemplateData(type), []));
    const location = new URLSearchParams(useLocation().hash.substring(1));
    const openTab = resolveOpenTab(settingsArray, location.get('subtab'));
    // A panel tab (License) saves nothing by itself, so the header shows no "Changes save
    // automatically" status there.
    const isPanelTab = !!(openTab &&
        getSettingById(settingsArray, openTab)?.PanelComponent);
    const getForm = (currentTab) => currentTab ? (_jsx(SettingsForm, { currentTab: currentTab, settingsArray: settingsArray, onSaveStatusChange: setSaveStatus })) : null;
    return (_jsx(SettingProvider, { children: _jsx(NavigatorComponent, { settingContent: settingsArray, currentSetting: openTab, getForm: getForm, prepareUrl: (subTab) => `?page=moowoodle#&tab=${type}&subtab=${subTab}`, Link: Link, settingName: title, 
            // `admin-settings` is the class zyra scopes its settings spacing under; `moowoodle-settings` is the
            // one styles/design-system.scss draws the section menu and cards with.
            className: "admin-settings moowoodle-settings", menuIcon: true, saveStatus: isPanelTab ? undefined : saveStatus }) }));
};
export default SettingsNavigator;
//# sourceMappingURL=SettingsNavigator.js.map