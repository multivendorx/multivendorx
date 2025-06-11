/**
 * Type definitions
 */
export type SettingContent = {
	id: string;
	priority: number;
	pro_dependent?: boolean;
	module_dependent?: boolean;
	modal: any;
	submitUrl: string;
};

type Setting = {
	type: 'folder' | string;
	content: Setting[] | SettingContent;
};

/**
 * Recursively sorts an array of settings based on priority.
 *
 * - If a setting is a folder, it sorts its children first,
 *   then uses the first child's priority for comparison.
 * - Otherwise, uses the setting's own priority.
 *
 * @param {Setting[]} settings - The array of settings to sort.
 *                             May include folders with nested settings.
 * @return {Setting[]}           The sorted array of settings by priority in ascending order.
 */
const getSettingsByPriority = ( settings: Setting[] ): Setting[] => {
	if ( Array.isArray( settings ) ) {
		settings.sort( ( firstSet, secondSet ) => {
			let firstPriority = 0;
			let secondPriority = 0;

			if ( firstSet.type === 'folder' ) {
				firstSet.content = getSettingsByPriority(
					firstSet.content as Setting[]
				);
				const firstChild = ( firstSet.content as Setting[] )[ 0 ];
				firstPriority =
					( firstChild.content as SettingContent ).priority || 0;
			} else {
				firstPriority = ( firstSet.content as SettingContent ).priority;
			}

			if ( secondSet.type === 'folder' ) {
				secondSet.content = getSettingsByPriority(
					secondSet.content as Setting[]
				);
				const firstChild = ( secondSet.content as Setting[] )[ 0 ];
				secondPriority =
					( firstChild.content as SettingContent ).priority || 0;
			} else {
				secondPriority = ( secondSet.content as SettingContent )
					.priority;
			}

			return firstPriority - secondPriority;
		} );
	}

	return settings;
};

/**
 * Filters a list of settings by a given array of setting IDs.
 *
 * Recursively traverses through folder-type settings and includes only those settings
 * (and their nested contents) whose `content.id` is present in the specified `ids` array.
 *
 * @param {Setting[]} settings - An array of Setting objects to be filtered.
 * @param {string[]}  ids      - An array of setting IDs to retain in the filtered result.
 *
 * @return {Setting[]} - A new array containing only the settings with matching IDs or folders with matching nested contents.
 */
const filterSettingByIds = (
	settings: Setting[],
	ids: string[]
): Setting[] => {
	const filterSettings: Setting[] = [];

	if ( Array.isArray( settings ) && Array.isArray( ids ) ) {
		for ( const setting of settings ) {
			if ( setting.type === 'folder' ) {
				const settingContent = filterSettingByIds(
					setting.content as Setting[],
					ids
				);
				if ( settingContent.length ) {
					filterSettings.push( {
						...setting,
						content: settingContent,
					} );
				}
				continue;
			}

			if ( ids.includes( ( setting.content as SettingContent ).id ) ) {
				filterSettings.push( setting );
			}
		}
	}

	return filterSettings;
};

/**
 * Retrieves the default (free) settings from a given list of settings.
 *
 * Recursively traverses the settings tree and returns only those settings that:
 * - Are not `pro_dependent`
 * - Are not `module_dependent`
 *
 * Folder-type settings are included only if their nested contents contain at least
 * one eligible setting.
 *
 * @param {Setting[]} settings - The array of settings to filter.
 *
 * @return {Setting[]} - A new array of default (free) settings.
 */
const getDefaultSettings = ( settings: Setting[] ): Setting[] => {
	const filterSettings: Setting[] = [];

	if ( Array.isArray( settings ) ) {
		settings.forEach( ( setting ) => {
			if ( setting.type === 'folder' ) {
				setting.content = getDefaultSettings(
					setting.content as Setting[]
				);
				if ( ( setting.content as Setting[] ).length ) {
					filterSettings.push( setting );
				}
				return;
			}

			const content = setting.content as SettingContent;
			if ( ! content.pro_dependent && ! content.module_dependent ) {
				filterSettings.push( setting );
			}
		} );
	}

	return filterSettings;
};

/**
 * Retrieves available settings, which include:
 * - Default (free) settings
 * - Settings explicitly allowed by ID
 *
 * Combines both sets and sorts them by priority.
 *
 * @param {Setting[]} settings - The full array of settings to evaluate.
 * @param {string[]}  [ids=[]] - Optional array of setting IDs to include in addition to free ones.
 *
 * @return {Setting[]} - A sorted array of available settings based on priority.
 */
const getAvailableSettings = (
	settings: Setting[],
	ids: string[] = []
): Setting[] => {
	return getSettingsByPriority( [
		...getDefaultSettings( settings ),
		...filterSettingByIds( settings, ids ),
	] );
};

/**
 * Retrieves a single setting's content by its ID.
 *
 * Recursively searches through the settings tree and returns the `SettingContent`
 * of the matching setting ID. If not found, returns an empty object.
 *
 * @param {Setting[]} settings  - The array of settings to search within.
 * @param {string}    settingId - The ID of the setting to retrieve.
 *
 * @return {SettingContent | {}} - The content of the matched setting, or an empty object if not found.
 */
const getSettingById = (
	settings: Setting[],
	settingId: string
): SettingContent | {} => {
	if ( Array.isArray( settings ) ) {
		for ( const setting of settings ) {
			if ( setting.type === 'folder' ) {
				const found = getSettingById(
					setting.content as Setting[],
					settingId
				);
				if ( Object.keys( found ).length > 0 ) {
					return found;
				}
				continue;
			}

			if ( ( setting.content as SettingContent ).id === settingId ) {
				return setting.content;
			}
		}
	}
	return {};
};

/**
 * Determines whether a given setting is active.
 *
 * A setting is considered active if:
 * - It is not module-dependent, OR
 * - Its ID is included in the provided list of allowed IDs AND:
 *   - It is not pro-dependent, OR
 *   - The pro feature is active
 *
 * @param {SettingContent} setting   - The setting to check.
 * @param {boolean}        proActive - Whether the "pro" feature is currently active.
 * @param {string[]}       ids       - Array of allowed setting IDs.
 *
 * @return {boolean} - Returns `true` if the setting is active; otherwise `false`.
 */
const isActiveSetting = (
	setting: SettingContent,
	proActive: boolean,
	ids: string[]
): boolean => {
	if ( ! setting.module_dependent ) return true;
	if ( ids.includes( setting.id ) ) {
		if ( ! setting.pro_dependent ) return true;
		if ( proActive ) return true;
	}
	return false;
};

export {
	getAvailableSettings,
	getSettingById,
	isActiveSetting,
	getDefaultSettings,
	filterSettingByIds,
	getSettingsByPriority,
};
