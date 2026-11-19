import { useState } from 'react';

/** The query fields zyra's TableCard sends to `onQueryUpdate`, as far as this hook reads them. */
interface TableQuery {
	paged?: number | string;
	searchValue?: string;
	filter?: Record<string, unknown>;
	categoryFilter?: string;
}

interface TablePropsWithData {
	rows?: unknown[];
	isLoading?: boolean;
	onQueryUpdate?: (query: TableQuery) => void;
	[key: string]: unknown;
}

/**
 * Whether a filter value is set. An object (the date filter's `{ startDate, endDate }`) counts only when one of its own
 * values is set, so a cleared date range still reads as unfiltered.
 */
const hasValue = (value: unknown): boolean => {
	if (Array.isArray(value)) {
		return value.length > 0;
	}

	if (value instanceof Date) {
		return true;
	}

	if (value && 'object' === typeof value) {
		return Object.values(value).some(hasValue);
	}

	return null !== value && undefined !== value && '' !== value;
};

/** True for the plain first page: no search, no filter, no status tab other than "all". */
const isUnfiltered = (query: TableQuery): boolean =>
	!query.searchValue &&
	!Object.values(query.filter ?? {}).some(hasValue) &&
	(!query.categoryFilter || 'all' === query.categoryFilter) &&
	1 === Number(query.paged || 1);

/**
 * Tells a list screen whether the site has no records of its kind yet, so it can show sample rows and the next step
 * instead of an empty table.
 *
 * Wraps the table's `onQueryUpdate` (whoever supplies it: this plugin or Notifima Pro's table-props filter) to remember
 * the last query. The screen is empty only when that query is the plain first page and it came back with no rows; a
 * search or filter with no match is still a normal empty table.
 *
 * @param tableProps The props the screen passes to TableCard.
 * @return The same props with the wrapped `onQueryUpdate`, and whether there are no records yet.
 */
export function useNoRecordsYet<T extends TablePropsWithData>(
	tableProps: T
): { props: T; hasNoRecords: boolean } {
	const [lastQuery, setLastQuery] = useState<TableQuery | null>(null);
	const { onQueryUpdate } = tableProps;

	const props = onQueryUpdate
		? {
				...tableProps,
				onQueryUpdate: (query: TableQuery) => {
					setLastQuery(query);
					onQueryUpdate(query);
				},
			}
		: tableProps;

	const hasNoRecords =
		null !== lastQuery &&
		isUnfiltered(lastQuery) &&
		!tableProps.isLoading &&
		0 === (tableProps.rows?.length ?? 0);

	return { props, hasNoRecords };
}

export default useNoRecordsYet;
