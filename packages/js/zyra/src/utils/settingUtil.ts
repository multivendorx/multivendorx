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
    type: "folder" | string;
    content: Setting[] | SettingContent;
};

/**
 * Get settings objects as array sorted by priority.
 */
const getSettingsByPriority = ( settings: Setting[] ): Setting[] => {
    if ( Array.isArray( settings ) ) {
        settings.sort( ( firstSet, secondSet ) => {
            let firstPriority = 0;
            let secondPriority = 0;

            if ( firstSet.type === "folder" ) {
                firstSet.content = getSettingsByPriority(
                    firstSet.content as Setting[]
                );
                const firstChild = ( firstSet.content as Setting[] )[ 0 ];
                firstPriority =
                    ( firstChild.content as SettingContent ).priority || 0;
            } else {
                firstPriority = ( firstSet.content as SettingContent ).priority;
            }

            if ( secondSet.type === "folder" ) {
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
 * Get settings filtered by ID array.
 */
const filterSettingByIds = (
    settings: Setting[],
    ids: string[]
): Setting[] => {
    const filterSettings: Setting[] = [];

    if ( Array.isArray( settings ) && Array.isArray( ids ) ) {
        for ( const setting of settings ) {
            if ( setting.type === "folder" ) {
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
 * Get default (free) settings.
 */
const getDefaultSettings = ( settings: Setting[] ): Setting[] => {
    const filterSettings: Setting[] = [];

    if ( Array.isArray( settings ) ) {
        settings.forEach( ( setting ) => {
            if ( setting.type === "folder" ) {
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
 * Get available settings (free + based on ID).
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
 * Get a setting by ID.
 */
const getSettingById = (
    settings: Setting[],
    settingId: string
): SettingContent | {} => {
    if ( Array.isArray( settings ) ) {
        for ( const setting of settings ) {
            if ( setting.type === "folder" ) {
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
 * Check if a setting is active.
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
