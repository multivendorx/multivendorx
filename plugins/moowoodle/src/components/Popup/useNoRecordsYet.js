import { useState } from 'react';
const hasValue = (value) => Array.isArray(value)
    ? value.length > 0
    : null !== value && undefined !== value && '' !== value;
/** True for the plain first page: no search, no filter, no status tab other than "all". */
const isUnfiltered = (query) => !query.searchValue &&
    !Object.values(query.filter ?? {}).some(hasValue) &&
    (!query.categoryFilter || 'all' === query.categoryFilter) &&
    1 === Number(query.paged || 1);
/**
 * Tells a list screen whether the site has no records of its kind yet, so it can show sample rows and the next step
 * instead of an empty table.
 *
 * Wraps the table's `onQueryUpdate` (whoever supplies it: this plugin or MooWoodle Pro's table-props filter) to remember
 * the last query. The screen is empty only when that query is the plain first page and it came back with no rows; a
 * search or filter with no match is still a normal empty table.
 *
 * @param tableProps The props the screen passes to TableCard.
 * @return The same props with the wrapped `onQueryUpdate`, and whether there are no records yet.
 */
export function useNoRecordsYet(tableProps) {
    const [lastQuery, setLastQuery] = useState(null);
    const { onQueryUpdate } = tableProps;
    const props = onQueryUpdate
        ? {
            ...tableProps,
            onQueryUpdate: (query) => {
                setLastQuery(query);
                onQueryUpdate(query);
            },
        }
        : tableProps;
    const hasNoRecords = null !== lastQuery &&
        isUnfiltered(lastQuery) &&
        !tableProps.isLoading &&
        0 === (tableProps.rows?.length ?? 0);
    return { props, hasNoRecords };
}
export default useNoRecordsYet;
//# sourceMappingURL=useNoRecordsYet.js.map